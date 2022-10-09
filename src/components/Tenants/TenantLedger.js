import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import MatButton from '@material-ui/core/Button';
import { Badge } from 'reactstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Block from '@material-ui/icons/Block';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { Link } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import AllocatePayment from './AllocatePayment';
import EditTransaction from './EditTransaction';

const TenantLedger = (props) => {
    //const history = useHistory();
    const tenantID = props.tenantID;
    const admin = props.admin;
    const propertyID = props.propertyID;
    const userID = props.userID;
    const companyID = props.companyID;

    const [ loading, setLoading ] = useState(true);
    const [ ledgerData, setLedgerData ] = useState([]);
    const [ allocatedPayments, setAllocatedPayments ] = useState(new Map());
    const [ tenantBalance, setTenantBalance ] = useState(0);
    const [ housingBalance, setHousingBalance ] = useState(0);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ deleteTransactionID, setDeleteTransactionID ] = useState(0);
    const [ updated, setUpdated ] = useState(false);
    const [ openAllocate, setOpenAllocate ] = useState(false);
    const [ selectedTransaction, setSelectedTransaction ] = useState(0);
    const [ openEditTransaction, setOpenEditTransaction ] = useState(false);
    const [ editTransactionID, setEditTransactionID ] = useState(0);
    const [ rowsPerPage, setRowsPerPage ] = useState(10);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const data = await tenantAPI.getLedger(tenantID);
            setAllocatedPayments(new Map(Object.entries(data.alllocatedPayments)));
            let arr = [];
            let totalDebit = 0;
            let totalCredit = 0;
            let tenantBalance = 0;
            let housingBalance = 0;
            for(const l of data.ledger) {
                let credit = 0;
                let debit = 0;
                let transDate = '';
                if(parseInt(l.TransactionTypeID) === 1) {
                    if(l.CheckDate) transDate = moment.utc(l.CheckDate).valueOf();
                    else            transDate = moment.utc(l.TenantTransactionDate).valueOf(); 
                    debit = parseFloat(l.TransactionAmount).toFixed(2);
                    tenantBalance += parseInt(l.ChargeTypeID) !== 6 ? parseFloat(l.TransactionAmount) : 0;
                    housingBalance += parseInt(l.ChargeTypeID) === 6 ? parseFloat(l.TransactionAmount) : 0;
                    totalDebit += parseFloat(l.TransactionAmount);
                } else if(parseInt(l.TransactionTypeID) === 2) {
                    if(l.CheckDate) transDate = moment.utc(l.CheckDate).valueOf();
                    else            transDate = moment.utc(l.TenantTransactionDate).valueOf();
                    credit = parseFloat(l.TransactionAmount).toFixed(2);
                    tenantBalance -= parseInt(l.ChargeTypeID) !== 6 ? parseFloat(l.TransactionAmount) : 0;
                    housingBalance -= parseInt(l.ChargeTypeID) === 6 ? parseFloat(l.TransactionAmount) : 0;
                    totalCredit += parseFloat(l.TransactionAmount);
                }
                arr.push({
                    dateCredit: moment.utc(l.TenantTransactionDate).valueOf(),
                    transactionDate: transDate,
                    description: l,
                    charge: debit,
                    credit: credit,
                    balance: (totalDebit-totalCredit).toFixed(2),
                    edit: l.TenantTransactionID,
                    delete: l.TenantTransactionID
                });
            }
            setLedgerData(arr);
            setTenantBalance(tenantBalance);
            setHousingBalance(housingBalance);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated, openAllocate, openEditTransaction]);
        
    const allocatePayment = (transactionID) => {
        setSelectedTransaction(transactionID);
        setOpenAllocate(true);
    }

    const columns = [
        { name: 'dateCredit', label: 'Date of Credit',
            options: {
                customBodyRender: (value) => {
                    return moment.utc(value).format("MM/DD/YYYY");
                }
            }
        },
        { name: 'transactionDate', label: 'Transaction Date',
            options: {
                customBodyRender: (value) => {
                    return moment.utc(value).format("MM/DD/YYYY");
                }
            }
        },
        { name: 'description', label: 'Description', 
            options: {
                customBodyRender: (value) => {
                    const allocate = (id, transactionID) => {
                        if(id === 2) {
                            return (
                                <>
                                    {' '}
                                    <MatButton color="primary" onClick={() => allocatePayment(transactionID)}>Allocate Payment</MatButton>
                                </>
                            );
                        }
                    }
                    return (
                        <div>
                            {value.ChargeType} - {value.Comment} {value.TenantTransactionID}
                            {allocate(parseInt(value.TransactionTypeID), parseInt(value.TenantTransactionID))}
                            {allocatedPayments.get(value.TenantTransactionID.toString()).map((payments) => {
                                return (
                                    <>
                                        <br/>
                                        <span style={{marginLeft: '1em'}}>{payments.Category}: <NumberFormat value={payments.PaymentAmount} displayType={'text'} thousandSeparator={true} prefix={'$'} /></span>
                                    </>
                                )
                            })}
                        </div>
                    );
                }
            }
        },
        { name: 'charge', label: 'Charge', 
            options: {
                customBodyRender: (value) => {
                    if(parseFloat(value) !== 0) {
                        return (
                            <Badge className="mb-10 mr-10" color="danger" pill style={{fontSize: '90%'}}>
                                <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                            </Badge>
                        )
                    }
                }
            },
        },
        { name: 'credit', label: 'Credit', 
            options: {
                customBodyRender: (value) => {
                    if(parseFloat(value) !== 0) {
                        return (
                            <Badge className="mb-10 mr-10" color="success" pill style={{fontSize: '90%'}}>
                                <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                            </Badge>
                        )
                    }
                }
            },
        },
        { name: 'balance', label: 'Balance', 
            options: {
                customBodyRender: (value) => {
                    const colorBalance = value > 0 ? 'danger' : 'secondary';
                    return (
                        <Badge className="mb-10 mr-10" color={colorBalance} pill style={{fontSize: '90%'}}>
                            {value < 0 ? '(' : ''}
                            <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} allowNegative={false} />
                            {value < 0 ? ')' : ''}
                        </Badge>
                    )
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
                                const closed = await tenantAPI.isTransactionClosed(parseInt(value));
                                if(closed) {
                                    NotificationManager.error("This transaction has been closed out by your accounting dept, and can not be edited.", "Warning!");
                                    return;
                                }
                                setEditTransactionID(parseInt(value));
                                setOpenEditTransaction(true);
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
                    if(admin === 1) {
                        return (
                            <IconButton
                                aria-label="Print"
                                onClick={() => {
                                    setDeleteTransactionID(value);
                                    setShowDelete(true);
                                }}
                            >
                                <DeleteForever />
                            </IconButton>
                        );
                    } else {
                        return <IconButton style={{color: 'red'}}><Block /></IconButton>;
                    }
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        selectableRows: "none",
        rowsPerPage: rowsPerPage,
        onChangeRowsPerPage: (val) => setRowsPerPage(val)
    };

    const deleteTransaction = async () => {
        const res = await tenantAPI.deleteTransaction(deleteTransactionID);
        setDeleteTransactionID(0);
        setShowDelete(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please contact us.", "Error");
            return;
        }
        setUpdated(!updated);
    }

    const sendLedgerToTenant = async () => {
        setLoading(true);
        const res = await tenantAPI.sendLedgerToTenant({
            tenantID,
            userID
        });
        setLoading(false);
        if(res !== 0) 
            NotificationManager.error(res, "Error");
        else
            NotificationManager.success("Ledger sent to tenant.", "Success!");
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Tenant Ledger..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            if(openAllocate) {
                return <AllocatePayment setOpenAllocate={setOpenAllocate} tenantID={tenantID} propertyID={propertyID}
                    selectedTransaction={selectedTransaction} tenantName={props.tenantName} />
            }

            const renderTitle = () => {
                const tenantMSG = tenantBalance < 0 ? 'Tenant has Credit: ' : 'Tenant Owes: ';
                const housingMSG = housingBalance < 0 ? 'House has credit: ' : 'Housing Owes: ';
                const totalDue = () => {
                    const balance = tenantBalance + housingBalance;
                    if(balance > 0) {
                        return (
                            <>
                                <b>
                                    Total Due: <NumberFormat value={balance.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />.
                                </b>
                                <br />
                                <Link to="/printable/accSummaryStatement" onClick={async () => {
                                        await localStorage.setItem("tenantID", tenantID);
                                    }} target="_blank"
                                >
                                    Print 90 Day Account Summary
                                </Link>
                                {' | '}
                                <Link to="/printable/printTenantLedger" onClick={async () => {
                                        await localStorage.setItem("tenantID", tenantID);
                                    }} target="_blank"
                                >
                                    Print Tenant Ledger
                                </Link>
                                {' | '}
                                <Link onClick={sendLedgerToTenant}>
                                    Send Ledger To Tenant
                                </Link>
                            </>
                        )
                    }
                    return (
                        <>
                            <b>Nothing is currently due.</b>
                            <br />
                            <Link to="/printable/accSummaryStatement" onClick={async () => {
                                    await localStorage.setItem("tenantID", tenantID);
                                }} target="_blank"
                            >
                                Print 90 Day Account Summary
                            </Link>
                            {' | '}
                            <Link to="/printable/printTenantLedger" onClick={async () => {
                                    await localStorage.setItem("tenantID", tenantID);
                                }} target="_blank"
                            >
                                    Print Tenant Ledger
                            </Link>
                            {' | '}
                            <Link onClick={sendLedgerToTenant}>
                                Send Ledger To Tenant
                            </Link>
                        </>
                    );
                }
                return (
                    <>
                        <p style={{fontSize: '15px'}}>
                            <u>Tenant Ledger</u> -
                            {' '}{tenantBalance > 0 ? <b style={{color: 'red'}}>Late Fees will be incurred.</b> : ''}
                            {' '}{tenantMSG} <NumberFormat value={Math.abs(tenantBalance.toFixed(2))} displayType={'text'} thousandSeparator={true} prefix={'$'} />.
                            {' '}{housingMSG} <NumberFormat value={Math.abs(housingBalance.toFixed(2))} displayType={'text'} thousandSeparator={true} prefix={'$'} />.
                            {' '}{totalDue()}
                        </p>
                    </>
                );
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
                        onConfirm={() => deleteTransaction()}
                        onCancel={() => setShowDelete(false)}
                    >
                        You will not be able to recover this transaction!
                    </SweetAlert>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={renderTitle()}
                                    data={ledgerData}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                </>
            );
        }
    }

    if(openEditTransaction) {
        return <EditTransaction tenantTransactionID={editTransactionID} admin={admin} userID={userID} 
            propertyID={propertyID} companyID={companyID} closeEdit={() => setOpenEditTransaction(false)} />
    }

    return render();
}

export default TenantLedger;