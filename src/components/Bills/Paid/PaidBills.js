import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import AttachFile from '@material-ui/icons/AttachFile';
import Done from '@material-ui/icons/Done';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';
import DatePicker from "reactstrap-date-picker";
import NumberFormat from 'react-number-format';
import MatButton from '@material-ui/core/Button';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as billsAPI from '../../../Api/bills';
import * as Constants from '../../Util/constants';
import LinearProgress from '../../Util/LinearProgress';

const PaidBills = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user;
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;

    const [ vendors, setVendors ] = useState([]);
    const [ selectedVendor, setSelectedVendor ] = useState(0);
    const [ startDate, setStartDate ] = useState(moment().subtract(3, 'month').format('YYYY-MM-DD'));
    const [ endDate, setEndDate ] = useState(moment().format('YYYY-MM-DD'));
    const [ dateRange, setDateRange ] = useState({startDate, endDate});
    const [ searchVendor, setSearchVendor ] = useState(selectedVendor);
    const [ paidBills, setPaidBills ] = useState([]);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ deleteBillID, setDeleteBillID ] = useState(0);
    const [ loadingTable, setLoadingTable ] = useState(true);
    const [ totalPaid, setTotalPaid ] = useState(0);
    const [ totalRows, setTotalRows ] = useState(10);

    useEffect(() => {
        async function fetchData() {
            setVendors(await billsAPI.getPayee(companyID));

            setLoadingTable(true);
            const getPaid = await billsAPI.getPaidBills({
                propertyID,
                vendorID: searchVendor,
                ...dateRange
            });
            let bills = [];
            let total = 0;
            for(const b of getPaid) {
                let link = "";
                if(b.UploadDate !== null && b.UploadDate !== "") {
                    const receiptDate = moment.utc(b.UploadDate);
                    const year = receiptDate.year();
                    const month = moment.utc(b.UploadDate).format('MM');
                    link = `./Receipts/${b.propertyID}/${year}/${month}/${b.checkregisterid}.pdf`;
                } else {
                    // App upload
                    link = await billsAPI.getAppBill({
                        propertyID: b.propertyID,
                        checkRegisterID: b.checkregisterid
                    });
                }
                total += parseFloat(b.amount);
                bills.push(
                    {
                        invoiceDate: moment.utc(b.invoiceDate).format("MM/DD/YYYY"),
                        paidDate: moment.utc(b.PaidDate).format("MM/DD/YYYY"),
                        payee: b.vendorName,
                        account: b.expensetype,
                        memo: b.memo,
                        invoiceNumber: b.invoicenumber.toString() === "0" ? "" : b.invoiceNumber,
                        debitAmt: `$${parseFloat(b.amount).toFixed(2)}`,
                        escrow: parseInt(b.escrow) === 0 ? "No" : "Yes",
                        receipt: link,
                        markUnpaid: b.checkregisterid,
                        edit: b.checkregisterid,
                        delete: b.checkregisterid
                    }
                );
            }

            setPaidBills(bills);
            setTotalPaid(total);
            setLoadingTable(false);
        }
        fetchData();
    }, [propertyID, companyID, dateRange, searchVendor]);

    const updateSearch = async () => {
        const sDate = moment(startDate);
        const eDate = moment(endDate);
        if(!sDate.isValid()) {
            NotificationManager.warning('Please enter a valid start date.', 'Error!');
            return;
        }
        if(!eDate.isValid()) {
            NotificationManager.warning('Please enter a valid end date.', 'Error!');
            return;
        }

        setDateRange({
            startDate: moment(startDate).format('YYYY-MM-DD'),
            endDate: moment(endDate).format('YYYY-MM-DD')
        });
        setSearchVendor(selectedVendor);
    }

    const getBills = async () => {
        setLoadingTable(true);
        const getPaid = await billsAPI.getPaidBills({
            propertyID,
            vendorID: selectedVendor,
            startDate,
            endDate
        });
        let bills = [];
        for(const b of getPaid) {
            let link = "";
            if(b.UploadDate !== null && b.UploadDate !== "") {
                const receiptDate = moment.utc(b.UploadDate);
                const year = receiptDate.year();
                const month = moment.utc(b.UploadDate).format('MM');
                link = `./Receipts/${b.propertyID}/${year}/${month}/${b.checkregisterid}.pdf`;
            } else {
                // App upload
                link = await billsAPI.getAppBill({
                    propertyID: b.propertyID,
                    checkRegisterID: b.checkregisterid
                });
            }
            bills.push(
                {
                    invoiceDate: moment.utc(b.invoiceDate).format("MM/DD/YYYY"),
                    paidDate: moment.utc(b.PaidDate).format("MM/DD/YYYY"),
                    payee: b.vendorName,
                    account: b.expensetype,
                    memo: b.memo,
                    invoiceNumber: b.invoicenumber.toString() === "0" ? "" : b.invoiceNumber,
                    debitAmt: `$${parseFloat(b.amount).toFixed(2)}`,
                    escrow: parseInt(b.escrow) === 0 ? "No" : "Yes",
                    receipt: link,
                    markUnpaid: b.checkregisterid,
                    edit: b.checkregisterid,
                    delete: b.checkregisterid
                }
            );
        }
        setLoadingTable(false);
        return bills;
    }

    const markUnpaid = async (crID) => {
        const res = await billsAPI.markUnpaid(crID, userID);
        if(res !== 0)
            NotificationManager.error(res, 'Error');
        else
            NotificationManager.success("Bill marked as unpaid successfully", "Success!");
        
        const bills = await getBills();
        setPaidBills(bills);
    }

    const deleteBill = async () => {
        const res = await billsAPI.deleteBill(deleteBillID);
        if(res !== 0) {
            NotificationManager.error(res, 'Error');
        } else {
            NotificationManager.success("Bill deleted successfully", "Success!");
        }
        setDeleteBillID(0);
        setShowDelete(false);
        setPaidBills(await getBills());
    }

    const editBill = async (crID) => {
        const isClosedOut = await billsAPI.isClosedOut(crID);
        if(isClosedOut) {
            NotificationManager.error('This transaction has been closed out by your accounting dept, and can not be edited.','Error!')
            return;
        } else {
            const location = {
                pathname: '/bills/edit',
                state: { 
                    checkRegisterID: crID,
                    return: '/bills/paidBills'
                }
            }
            history.push(location);
        }
    }

    const handleChangeRowsPerPage = val => setTotalRows(val);

    const columns = [
        { name: 'invoiceDate', label: 'InvoiceDate', },
        { name: 'invoiceNumber', label: 'Invoice Number', },
        { name: 'paidDate', label: 'Paid Date', },
        { name: 'payee', label: 'Payee', 
            options: {
                customBodyRender: (value) => {
                    return(
                        <MatButton className="text-primary mr-10 mb-10"
                            onClick={() => {
                                window.location = `./index.cfm?p=78&VID=${value.vendorid}`;
                            }}
                        >
                            {value.vendorName}
                        </MatButton>
                    );
                },
                sortCompare: (order) => {
                    return (obj1, obj2) => {
                        if(order === 'asc')
                            return obj1.data.vendorName.localeCompare(obj2.data.vendorName)
                        return obj2.data.vendorName.localeCompare(obj1.data.vendorName)
                    }
                }
            },
        },
        { name: 'account', label: 'Expense Type', },
        { name: 'memo', label: 'Memo', },
        { name: 'debitAmt', label: 'Debit Amount', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                },
                sortCompare: (order) => {
                    return (obj1, obj2) => {
                        const val1 = parseFloat(obj1.data.substring(1, obj1.data.length))
                        const val2 = parseFloat(obj2.data.substring(1, obj2.data.length))
                        if(order === 'asc')
                            return val1-val2;
                        return val2-val1;
                    }
                }
            },
        },
        { name: 'escrow', label: 'Escrow', },
        { name: 'receipt', label: 'Receipt', 
            options: {
                customBodyRender: (value) => {
                    if(value !== null && value !== "") {
                        return (
                            <IconButton
                                aria-label="Receipt"
                                onClick={() => {
                                    window.open(value, '_blank');
                                }}
                            >
                                <AttachFile />
                            </IconButton>
                        );
                    }
                }
            },
        },
        { name: 'markUnpaid', label: 'Mark as unpaid?', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={async () => {
                                await markUnpaid(value);
                            }}
                            style={{color: 'red'}}
                        >
                            <Done />
                        </IconButton>
                    );
                }
            },
        },        
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={async () => {
                                await editBill(value);
                            }}
                        >
                            <Edit />
                        </IconButton>
                    );
                }
            },
        },        
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setDeleteBillID(value);
                                setShowDelete(true);
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    );
                }
            },
        },        
    ];
    const options = {
        filterType: 'dropdown',
        selectableRows: "none",
        rowsPerPage: totalRows,
        onChangeRowsPerPage: handleChangeRowsPerPage,        
    };

    const renderTable = () => {
        if(loadingTable) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Paid Bills..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const renderTitle = () => {
                return (
                    <>
                    <span>
                        Paid Bills: {' '}
                        <NumberFormat value={parseFloat(totalPaid).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                    </span>
                    </>
                )
            }
            return (
                <div className="data-table-wrapper">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={renderTitle()}
                                    data={paidBills}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                </div>
            )
        }
    }

    return (
        <Main>
            <SweetAlert
                warning
                btnSize="sm"
                show={showDelete}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteBill()}
                onCancel={() => setShowDelete(false)}
            >
                You will not be able to recover this bill!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Paid Bills</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="">
                            <Form>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="payee" className="mr-sm-10">Vendors</Label>
                                            <Input type="select" name="vendors" id="vendors" 
                                                value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}
                                            >
                                                <option value="0">Select</option>
                                                {vendors.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.VendorID} 
                                                            value={obj.VendorID}
                                                        >
                                                                {obj.VendorName}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="startDate" className="mr-sm-10">Start Date</Label>
                                            <DatePicker name="startDate" id="startDate"
                                                value={startDate} onChange={(e) => setStartDate(e ? moment(e).format('YYYY-MM-DD') : '')}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="endDate" className="mr-sm-10">End Date</Label>
                                            <DatePicker name="endDate" id="endDate"
                                                value={endDate} onChange={(e) => setEndDate(e ? moment(e).format('YYYY-MM-DD') : '')}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="button" color="primary" size="sm" className="w-auto"
                                    onClick={updateSearch}
                                >
                                    Update
                                </Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
            {renderTable()}  
        </Main>
    );
}

export default PaidBills;