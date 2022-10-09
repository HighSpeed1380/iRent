import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import SweetAlert from 'react-bootstrap-sweetalert';
import IconButton from '@material-ui/core/IconButton';
import Print from '@material-ui/icons/Print';
import AttachFile from '@material-ui/icons/AttachFile';
import Flag from '@material-ui/icons/Flag';
import Done from '@material-ui/icons/Done';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import LinearProgress from '../../Util/LinearProgress';
import NumberFormat from 'react-number-format';
import { Button } from 'reactstrap';
import MatButton from '@material-ui/core/Button';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { useHistory } from "react-router-dom";

import * as Constants from '../../Util/constants';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as billsAPI from '../../../Api/bills';

const ListUnpaid = (props) => {
    const history = useHistory();
    const multiProp = props.multiProp;
    const propertyID = props.propertyID;
    const userID = props.userID;
    const saving = props.saving;

    const [ unpaidBills, setUnpaidBills ] = useState([]);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ deleteBillID, setDeleteBillID ] = useState(0);
    const [ total, setTotal ] = useState(0);
    const [ loadingTable, setLoadingTable ] = useState(true);
    const [ showMarkAllPaid, setMarkAllPaid ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoadingTable(true);
            const getUnpaid = await billsAPI.getUnpaidBills({
                multiProp,
                propertyID,
                userID
            });

            const counter = new Map();
            const getDupes = await billsAPI.getDupes(propertyID);
            getDupes.forEach(({VendorID,InvoiceNumber,Amount})=> {
                const key = `${VendorID}|${InvoiceNumber}|${Amount}`;
                counter.set(key, (counter.get(key) | 0) + 1);
            });

            let bills = [];
            let totalUnpaid = 0;
            for(const b of getUnpaid) {
                const key = `${b.vendorid}|${b.invoicenumber}|${b.amount}`;
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
                totalUnpaid += parseFloat(b.amount);
                bills.push(
                    {
                        invoiceDate: moment.utc(b.invoiceDate).format("MM/DD/YYYY"),
                        payee: b.vendorName,
                        account: b.expensetype,
                        memo: b.memo,
                        invoiceNumber: b.invoicenumber.toString() === "0" ? "" : b.invoiceNumber,
                        debitAmt: `$${parseFloat(b.amount).toFixed(2)}`,
                        escrow: parseInt(b.escrow) === 0 ? "No" : "Yes",
                        printCheck: b,
                        receipt: link,
                        dupe: counter.get(key) > 1,
                        markPaid: b.checkregisterid,
                        edit: b.checkregisterid,
                        delete: b.checkregisterid
                    }
                );
            }

            setUnpaidBills(bills);
            setTotal(totalUnpaid);
            setLoadingTable(false);
        }
        fetchData();
    }, [multiProp, propertyID, userID, saving]);

    const getUnpaidBills = async () => {
        setLoadingTable(true);
        const getUnpaid = await billsAPI.getUnpaidBills({
            multiProp,
            propertyID,
            userID
        });

        const counter = new Map();
        const getDupes = await billsAPI.getDupes(propertyID);
        getDupes.forEach(({VendorID,InvoiceNumber,Amount})=> {
            const key = `${VendorID}|${InvoiceNumber}|${Amount}`;
            counter.set(key, (counter.get(key) | 0) + 1);
        });

        let bills = [];
        let totalUnpaid = 0;
        for(const b of getUnpaid) {
            const key = `${b.vendorid}|${b.invoicenumber}|${b.amount}`;
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
            totalUnpaid += parseFloat(b.amount);
            bills.push(
                {
                    invoiceDate: moment.utc(b.invoiceDate).format("MM/DD/YYYY"),
                    payee: b,
                    account: b.expensetype,
                    memo: b.memo,
                    invoiceNumber: b.invoicenumber.toString() === "0" ? "" : b.invoiceNumber,
                    debitAmt: `$${parseFloat(b.amount).toFixed(2)}`,
                    escrow: parseInt(b.escrow) === 0 ? "No" : "Yes",
                    printCheck: b,
                    receipt: link,
                    dupe: counter.get(key) > 1,
                    markPaid: b.checkregisterid,
                    edit: b.checkregisterid,
                    delete: b.checkregisterid
                }
            );
        }
        setTotal(totalUnpaid);
        setLoadingTable(false);
        return bills;
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
        setUnpaidBills(await getUnpaidBills());
    }

    const markPaid = async (crID) => {
        const res = await billsAPI.markPaid(crID, userID);
        if(res !== 0)
            NotificationManager.error(res, 'Error');
        else
            NotificationManager.success("Bill marked as paid successfully", "Success!");
        setUnpaidBills(await getUnpaidBills());
    }

    const handleMarkAllPAid = async () => {
        const crIDs = [];
        for(let i=0; i<unpaidBills.length; i++)
            crIDs.push(parseInt(unpaidBills[i].edit));
        
        const res = await billsAPI.markAllPaid({
            crIDs: crIDs.join(','),
            userID
        });
        if(res !== 0) {
            NotificationManager.error(res, 'Error');
            return;
        }
        setMarkAllPaid(false);
        setUnpaidBills(await getUnpaidBills());
        NotificationManager.success("All bills marked as paid!", "Success");
    }

    const columns = [
        { name: 'invoiceDate', label: 'InvoiceDate', },
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
        { name: 'invoiceNumber', label: 'Invoice Number', },
        { name: 'debitAmt', label: 'Debit Amount', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'escrow', label: 'Escrow', },
        { name: 'printCheck', label: 'Print Check', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                const link = `./printable-Owner.cfm?VID=${value.vendorid}&P=A&Amt=${value.amount}&cr=${value.checkregisterid}`;
                                window.open(link, '_blank');
                            }}
                        >
                            <Print />
                        </IconButton>
                    );
                }
            },
        },
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
        { name: 'dupe', label: 'Dupe?', 
            options: {
                customBodyRender: (value) => {
                    if(value) {
                        return (
                            <IconButton
                                aria-label="Possible Duplicate"
                            >
                                <Flag style={{fill: "red"}} />
                            </IconButton>
                        );
                    }
                }
            },
        },
        { name: 'markPaid', label: 'Mark Paid?', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={async () => {
                                await markPaid(value);
                            }}
                            style={{color: 'green'}}
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
                            onClick={() => {
                                const location = {
                                    pathname: '/bills/edit',
                                    state: { 
                                        checkRegisterID: value,
                                        return: '/bills/unpaidBills'
                                    }
                                }
                                history.push(location);
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
        selectableRows: "none"
    };

    const renderUnpaidBills = () => {
        if(loadingTable) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Unpaid Bills..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const renderTitle = () => {
                return (
                    <>
                    <span>
                        Unpaid Bills: {' '}
                        <NumberFormat value={parseFloat(total).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                    </span>
                    {'   '}
                    <Button color="link" onClick={() => setMarkAllPaid(true)}>Mark All Bills Paid</Button>
                    </>
                )
            }
            return (
                <div className="data-table-wrapper" style={Constants.margins}>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={renderTitle()}
                                    data={unpaidBills}
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
        <>
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
            <SweetAlert
                warning
                btnSize="sm"
                show={showMarkAllPaid}
                showCancel
                confirmBtnText="Yes, mark all paid!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => handleMarkAllPAid()}
                onCancel={() => setMarkAllPaid(false)}
            >
                All bills you be marked as paid!
            </SweetAlert>
            {renderUnpaidBills()}
        </>
    );
}

export default ListUnpaid;