import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import SweetAlert from 'react-bootstrap-sweetalert';
import IconButton from '@material-ui/core/IconButton';
import Print from '@material-ui/icons/Print';
import AttachFile from '@material-ui/icons/AttachFile';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import MatButton from '@material-ui/core/Button';
import NumberFormat from 'react-number-format';
import NotificationManager from 'react-notifications/lib/NotificationManager';

import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as billsAPI from '../../../Api/bills';
import * as Constants from '../../Util/constants';
import LinearProgress from '../../Util/LinearProgress';

const ExistingRecurringBills = (props) => {
    const multiProp = props.multiProp;
    const propertyID = props.propertyID;
    const userID = props.userID;
    const saving = props.saving;
        
    const [ recurringBills, setRecurringBills ] = useState([]);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ deleteBillID, setDeleteBillID ] = useState(0);
    const [ total, setTotal ] = useState(0);
    const [ loadingTable, setLoadingTable ] = useState(true);
    const [ totalRows, setTotalRows ] = useState(10);

    useEffect(() => {
        async function fetchData() {
            setLoadingTable(true);
            const getBills = await billsAPI.getReccuringBills({
                multiProp,
                propertyID,
                userID
            });
            let bills = [];
            let totalRecurring = 0;
            for(const b of getBills) {
                let link = "";
                if(b.UploadDate !== null && b.UploadDate !== "") {
                    const receiptDate = moment.utc(b.UploadDate);
                    const year = receiptDate.year();
                    const month = moment.utc(b.UploadDate).format('MM');
                    link = `./ReceiptsRecurring/${b.PropertyID}/${year}/${month}/${b.RecurringBillsID}.pdf`;
                }
                totalRecurring += parseFloat(b.Amount); 
                bills.push(
                    {
                        firstPayBy: moment.utc(b.FirstPayDate).format("MM/DD/YYYY"),
                        payee: b,
                        account: b.ExpenseType,
                        numPayments: b,
                        frequency: b.Frequency,
                        postMethod: b.PostMethod,
                        markPaid: parseInt(b.Paid) === 1 ? 'Yes' : 'No',
                        memo: b.memo === undefined ? '' : b.memo,
                        invoiceNumber: b.InvoiceNumber.toString() === "0" ? "" : b.InvoiceNumber,
                        debitAmt: `$${parseFloat(b.Amount).toFixed(2)}`,
                        escrow: parseInt(b.escrow) === 0 ? "No" : "Yes",
                        printCheck: b,
                        receipt: link,
                        edit: b.RecurringBillsID,
                        delete: b.RecurringBillsID
                    }
                );
            }
            
            setRecurringBills(bills);
            setTotal(totalRecurring);
            setLoadingTable(false);
        }
        fetchData();
    }, [multiProp, propertyID, userID, saving]);

    const getBills = async () => {
        setLoadingTable(true);
        const getBills = await billsAPI.getReccuringBills({
            multiProp,
            propertyID,
            userID
        });
        let bills = [];
        for(const b of getBills) {
            let link = "";
            if(b.UploadDate !== null && b.UploadDate !== "") {
                const receiptDate = moment.utc(b.UploadDate);
                const year = receiptDate.year();
                const month = moment.utc(b.UploadDate).format('MM');
                link = `./ReceiptsRecurring/${b.PropertyID}/${year}/${month}/${b.RecurringBillsID}.pdf`;
            } 
            bills.push(
                {
                    firstPayBy: moment.utc(b.FirstPayDate).format("MM/DD/YYYY"),
                    payee: b,
                    account: b.ExpenseType,
                    numPayments: b,
                    frequency: b.Frequency,
                    postMethod: b.PostMethod,
                    markPaid: parseInt(b.Paid) === 1 ? 'Yes' : 'No',
                    memo: b.memo,
                    invoiceNumber: b.InvoiceNumber.toString() === "0" ? "" : b.InvoiceNumber,
                    debitAmt: `$${parseFloat(b.Amount).toFixed(2)}`,
                    escrow: parseInt(b.escrow) === 0 ? "No" : "Yes",
                    printCheck: b,
                    receipt: link,
                    edit: b.RecurringBillsID,
                    delete: b.RecurringBillsID
                }
            );
        }
        setLoadingTable(false);
        return bills;
    }

    const deleteBill = async () => {
        const res = await billsAPI.deleteRecurring(deleteBillID);
        if(res !== 0) {
            NotificationManager.error(res, 'Error');
        } else {
            NotificationManager.success("Bill deleted successfully", "Success!");
        }
        setDeleteBillID(0);
        setShowDelete(false);
        setRecurringBills(await getBills());
    }

    const handleChangeRowsPerPage = val => setTotalRows(val);

    const columns = [
        { name: 'firstPayBy', label: 'First Pay By', },
        { name: 'payee', label: 'Payee', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton className="text-primary mr-10 mb-10"
                            onClick={() => {
                                window.location = `./index.cfm?p=78&VID=${value.Vendorid}`;
                            }}
                        >
                            {value.VendorName}
                        </MatButton>
                    );
                },
                sortCompare: (order) => {
                    return (obj1, obj2) => {
                        console.log(obj1)
                        if(order === 'asc')
                            return obj1.data.VendorName.localeCompare(obj2.data.VendorName)
                        return obj2.data.VendorName.localeCompare(obj1.data.VendorName)
                    }
                }
            },
        },
        { name: 'account', label: 'Expense Type', },
        { name: 'numPayments', label: 'Number of Payments', 
            options: {
                customBodyRender: (value) => {
                    if(value.Unlimited)     return "Unlimited";
                    else                    return value.NumberofPayments;
                }
            },
        },
        { name: 'frequency', label: 'Frequency', },
        { name: 'postMethod', label: 'Post Method', },
        { name: 'markPaid', label: 'Mark Paid', 
            options: {
                customBodyRender: (value) => {
                    if(value === "Yes") {
                        return (
                            <span className="badge badge-success">Paid</span>
                        );
                    }
                    return (
                        <span className="badge badge-info">Pending</span>
                    );
                }
            },
        },
        { name: 'memo', label: 'Memo', },
        { name: 'invoiceNumber', label: 'Invoice Number', },
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
        { name: 'printCheck', label: 'Print Check', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                const link = `./printable-Owner.cfm?VID=${value.Vendorid}&P=A&Amt=${value.Amount}`;
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
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                window.location = `./index.cfm?P=235&RBID=${value}&R=231`;
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
        onChangeRowsPerPage: handleChangeRowsPerPage
    };

    const renderTable = () => {
        if(loadingTable) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Recurring Bills..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const renderTitle = () => {
                return (
                    <>
                    <span>
                        Existing Recurring Bills: {' '}
                        <NumberFormat value={parseFloat(total).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                    </span>
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
                                    data={recurringBills}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                </div>
            );
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
            {renderTable()}
        </>
    );
}

export default ExistingRecurringBills;