import React, { useState, useEffect, useCallback } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Form,  Label, FormGroup } from 'reactstrap';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import AttachFile from '@material-ui/icons/AttachFile';
import Done from '@material-ui/icons/Done';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Block from '@material-ui/icons/Block';
import Tooltip from '@material-ui/core/Tooltip';
import NumberFormat from 'react-number-format';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';
import DatePicker from "reactstrap-date-picker";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as checkRegisterAPI from '../../Api/checkRegister';
import * as billsAPI from '../../Api/bills';
import * as Constants from '../Util/constants';

const CheckRegister = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const admin = user.securityLevel;
    const singleCheckbook = user.notifications.singleCheckBook;

    let crID = null;
    if(props.location.state && props.location.state.checkRegisterID !== undefined)
        crID = parseInt(props.location.state.checkRegisterID);

    const [ checkRegisterID, setCheckRegisterID ] = useState(crID)
    const [ goal, setGoal ] = useState(props.goal === undefined ? 0 : props.goal);
    const [ startDate, setStartDate ] = useState(moment().subtract(3, 'month').format('YYYY-MM-DD'));
    const [ endDate, setEndDate ] = useState(moment().format('YYYY-MM-DD'));
    const [ dateRange, setDateRange ] = useState({startDate, endDate});
    const [ checkRegister, setCheckRegister ] = useState([]);
    const [ loadingTable, setLoadingTable ] = useState(true);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ deleteCR, setDeleteCR ] = useState(0);
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoadingTable(true);
            const getData = await checkRegisterAPI.get({
                singleCheckbook,
                propertyID,
                userID,
                ...dateRange,
                checkRegisterID
            });
            let checkRegisters = [];
            let balance = 0;
            for(const d of getData) {
                let link = "";
                if(d.UploadDate !== null && d.UploadDate !== "") {
                    const receiptDate = moment(d.UploadDate);
                    const year = receiptDate.year();
                    const month = moment(d.UploadDate).format('MM');
                    link = `./Receipts/${d.PropertyID}/${year}/${month}/${d.CheckRegisterID}.pdf`;
                }

                let credit = null;
                let debit = null;
                if(parseInt(d.TransactionType) === 1) {
                    debit = parseFloat(d.Amount);
                    balance -= parseFloat(d.Amount);
                } else if(parseInt(d.TransactionType) === 2) {
                    credit = parseFloat(d.Amount);
                    balance += parseFloat(d.Amount);
                }
                checkRegisters.push({
                    date: moment(d.CheckDate).format("MM/DD/YYYY"),
                    payee: d,
                    account: d.ExpenseType,
                    memo: d.Memo,
                    invoiceNumber: d.InvoiceNumber.toString() === "0" ? "" : d.InvoiceNumber,
                    debitAmount: debit ? debit.toFixed(2) : '',
                    creditAmount: credit ? credit.toFixed(2) : '',
                    balance: balance.toFixed(2),
                    receipt: link,
                    reconcile: d,
                    markPaidUnpaid: d,
                    edit: d.CheckRegisterID,
                    delete: d.CheckRegisterID
                });
            }
            setCheckRegister(checkRegisters);
            setLoadingTable(false);
        }
        fetchData();
    }, [propertyID, singleCheckbook, userID, dateRange, checkRegisterID, updated]);

    const getCheckRegisters = async (crID) => {
        const filterCRID = crID !== null ? checkRegisterID : crID;
        const getData = await checkRegisterAPI.get({
            singleCheckbook,
            propertyID,
            userID,
            startDate,
            endDate,
            checkRegisterID: filterCRID
        });
        let checkRegisters = [];
        let balance = 0;
        for(const d of getData) {
            let link = "";
            if(d.UploadDate !== null && d.UploadDate !== "") {
                const receiptDate = moment(d.UploadDate);
                const year = receiptDate.year();
                const month = moment(d.UploadDate).format('MM');
                link = `./Receipts/${d.PropertyID}/${year}/${month}/${d.CheckRegisterID}.pdf`;
            } else {
                link = '';
                // App upload
                //link = await billsAPI.getAppBill({
                //    propertyID: d.PropertyID,
                //    checkRegisterID: d.CheckRegisterID
                //});
            }

            let credit = null;
            let debit = null;
            if(parseInt(d.TransactionType) === 1) {
                debit = parseFloat(d.Amount);
                balance -= parseFloat(d.Amount);
            } else if(parseInt(d.TransactionType) === 2) {
                credit = parseFloat(d.Amount);
                balance += parseFloat(d.Amount);
            }
            checkRegisters.push({
                date: moment(d.CheckDate).format("MM/DD/YYYY"),
                payee: d,
                account: d.ExpenseType,
                memo: d.Memo,
                invoiceNumber: d.InvoiceNumber.toString() === "0" ? "" : d.InvoiceNumber,
                debitAmount: debit ? debit.toFixed(2) : '',
                creditAmount: credit ? credit.toFixed(2) : '',
                balance: balance.toFixed(2),
                receipt: link,
                reconcile: d,
                edit: d.CheckRegisterID,
                delete: d.CheckRegisterID
            });
        }
        return checkRegisters;
    }

    const search = async () => {
        const sDate = moment(startDate);
        const eDate = moment(endDate);
        if(!sDate.isValid() || !eDate.isValid()) {
            NotificationManager.error('Please enter a valid date range.', 'Error');
            return;
        }
        setDateRange({
            startDate: moment(startDate).format('YYYY-MM-DD'),
            endDate: moment(endDate).format('YYYY-MM-DD')
        });
    }

    const deleteCheckRegister = async () => {
        setShowDelete(false);
        const res = await checkRegisterAPI.deleteCR(deleteCR, userID);
        if(res !== 0) {
            NotificationManager.error(res, 'Error');
            return;
        }

        NotificationManager.success('Check Register delete successfully.', 'Success');
        setLoadingTable(true);
        setCheckRegister(await getCheckRegisters());
        setLoadingTable(false);
    }

    const reconcile = async (crID) => {
        const res = await checkRegisterAPI.reconcile(crID);
        if(res !== 0) {
            NotificationManager.error(res, 'Error');
            return;
        }
        setLoadingTable(true);
        setCheckRegister(await getCheckRegisters());
        setLoadingTable(false);
    }

    const markUnpaid = async (crID) => {
        const res = await billsAPI.markUnpaid(crID, userID);
        if(res !== 0)
            NotificationManager.error(res, 'Error');
        else
            NotificationManager.success("Bill marked as unpaid successfully", "Success!");
        
        setUpdated(!updated);
    }

    const markPaid = async (crID) => {
        const res = await billsAPI.markPaid(crID, userID);
        if(res !== 0)
            NotificationManager.error(res, 'Error');
        else
            NotificationManager.success("Bill marked as paid successfully", "Success!");
        
        setUpdated(!updated);
    }

    const columns = [
        { name: 'date', label: 'Date', },
        { name: 'payee', label: 'Payee', 
            options: {
                customBodyRender: (value) => {
                    if(value.VendorName && value.VendorName !== '')
                        return value.VendorName.toString();

                    return (
                        <Button className="mr-10 mb-10" color="link"
                            onClick={() => {
                                const location = {
                                    pathname: '/deposits/breakdown',
                                    state: { 
                                        checkRegisterID: value.CheckRegisterID
                                    }
                                }
                                history.push(location);
                            }}  
                        >
                            Item
                        </Button>
                    );
                }
            },
        },
        { name: 'account', label: 'Account' },
        { name: 'memo', label: 'Memo', },
        { name: 'invoiceNumber', label: 'Invoice Number', },
        { name: 'debitAmount', label: 'Debit Amount',
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            }
        },
        { name: 'creditAmount', label: 'Credit Amount', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            }
        },
        { name: 'balance', label: 'Balance', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            }
        },
        { name: 'receipt', label: 'Receipt', 
            options: {
                customBodyRender: (value) => {
                    if(value !== null && value !== "") {
                        const link = 'https://myirent.com/rent/' + value;
                        return (
                            <IconButton
                                aria-label="Receipt"
                                onClick={() => {
                                    window.open(link, '_blank');
                                }}
                            >
                                <AttachFile />
                            </IconButton>
                        );
                    }
                }
            },
        },
        { name: 'reconcile', label: 'Reconcile', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(value.Reconciled) === 1) {
                        return (
                            <IconButton
                                aria-label="Print"
                                onClick={async () => {
                                    reconcile();
                                }}
                            >
                                <Done />
                            </IconButton>
                        );
                    }
                }
            },
        },
        { name: 'markPaidUnpaid', label: 'Mark Paid/Unpaid?', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(value.Paid) === 0) {
                        return (
                            <Button className="mr-10 mb-10" color="link"
                                onClick={async () => {
                                    await markPaid(value.CheckRegisterID);
                                }}
                            >
                                Mark Paid
                            </Button>
                        );
                    }
                    return (
                        <Button className="mr-10 mb-10" color="link" style={{color: 'red'}}
                            onClick={async () => {
                                await markUnpaid(value.CheckRegisterID);
                            }}
                        >
                            Mark Unpaid
                        </Button>
                    );
                }
            },
        },          
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    if(admin === 1) {
                        return (
                            <IconButton
                                aria-label="Edit"
                                onClick={() => {
                                    const location = {
                                        pathname: '/checkRegister/edit',
                                        state: { 
                                            checkRegisterID: value
                                        }
                                    }
                                    history.push(location);
                                }}
                            >
                                <Edit />
                            </IconButton>
                        );
                    } else {
                        return (
                            <Tooltip title="Only administrator users can edit.">
                                <IconButton aria-label="Edit">
                                    <Block style={{color: 'red'}} />
                                </IconButton>
                            </Tooltip>
                        )
                    }
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
                                    setDeleteCR(value);
                                    setShowDelete(true);
                                }}
                            >
                                <DeleteForever />
                            </IconButton>
                        );
                    } else {
                        return (
                            <Tooltip title="Only administrator users can delete.">
                                <IconButton aria-label="Edit">
                                    <Block style={{color: 'red'}} />
                                </IconButton>
                            </Tooltip>
                        )
                    }
                }
            },
        },        
    ];
    const options = {
        filterType: 'dropdown',
        selectableRows: "none",
        rowsPerPage: 100,
    };

    const renderTable = () => {
        if(loadingTable) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Check Register..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const renderTitle = () => {
                return (
                    <Button className="mr-10 mb-10" color="link"
                        onClick={async () => {
                            setLoadingTable(true);
                            setCheckRegisterID(null);
                            setCheckRegister(await getCheckRegisters(null));
                            setLoadingTable(false);
                        }}
                    >
                        Reaload Check Register Items
                    </Button>
                );
            }
            return (
                <div className="data-table-wrapper">
                    <div className="row" style={{paddingBottom: '50px'}}>
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={renderTitle()}
                                    data={checkRegister}
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

    const reconcileBtn = useCallback( () => {
        if(goal === '' || parseFloat(goal) < 0) {
            NotificationManager.error("Please enter a valid reconcile goal.", "error");
            return;
        }

        const location = {
            pathname: '/reconcile',
            state: { goal }
        }
        history.push(location);
    }, [goal, history]);


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
                onConfirm={() => deleteCheckRegister()}
                onCancel={() => setShowDelete(false)}
            >
                You will not be able to recover this check register!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Check Register</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-4">
                        <RctCollapsibleCard heading="">
                            <Form inline>
                                <FormGroup className="mb-10 mr-sm-10 mb-sm-0" inline>
                                    <Label for="reconcileGoal" className="mr-sm-10">Reconcile Goal:</Label>
                                    <NumberFormat thousandSeparator={true} prefix={'$'} name="reconcileGoal" id="reconcileGoal" placeholder="0" 
                                        value={goal} onValueChange={(e) => setGoal(e.floatValue === undefined ? '' : e.floatValue)} style={{maxWidth: '160px'}}
                                        allowNegative={false} className="form-control"
                                    />
                                </FormGroup>
                                <Button className="btn btn-success" onClick={reconcileBtn}>Reconcile</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                    <div className="col-sm-12 col-md-12 col-xl-6">
                        <RctCollapsibleCard heading="">
                            <Form inline>
                                <FormGroup className="mb-10 mr-sm-10 mb-sm-0" inline>
                                    <Label for="startDate" className="mr-sm-10">Start Date:</Label>
                                    <DatePicker name="startDate" id="startDate" style={{maxWidth: '110px'}}
                                        value={startDate} onChange={(e) => setStartDate(e ? moment(e).format('YYYY-MM-DD') : '')}
                                    />
                                </FormGroup>
                                <FormGroup className="mb-10 mr-sm-10 mb-sm-0" inline>
                                    <Label for="endDate" className="mr-sm-10">End Date:</Label>
                                    <DatePicker name="endDate" id="endDate" style={{maxWidth: '110px'}}
                                        value={endDate} onChange={(e) => setEndDate(e ? moment(e).format('YYYY-MM-DD') : '')}
                                    />
                                </FormGroup>
                                <Button className="btn btn-primary" onClick={search}>Update</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                {renderTable()}
            </div>
        </Main>
    );
}

export default CheckRegister;