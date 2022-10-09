import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';
import NumberFormat from 'react-number-format';
import DeleteForever from '@material-ui/icons/DeleteForever';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Done from '@material-ui/icons/Done';
import MatButton from '@material-ui/core/Button';
import moment from 'moment';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as depositsAPI from '../../Api/deposits';
import * as billsAPI from '../../Api/bills';

const History = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [ loading, setLoading ] = useState(true);
    const [ deposits, setDeposits ] = useState([]);
    const [ deleteDeposit, setDeleteDeposit ] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const deposits = await depositsAPI.getHistory(propertyID);
            const arr = [];
            for(const d of deposits) {
                arr.push({
                    dateCredit: d,
                    inputDate: moment.utc(d.CheckDate).format("MM/DD/YYYY"),
                    payee: d,
                    account: d.ExpenseType,
                    memo: d.Memo,
                    creditAmt: d,
                    transactionID: d.CheckRegisterID,
                    reconciled: d,
                    //edit: d.CheckRegisterID,
                    delete: d.CheckRegisterID
                });
            }
            setDeposits(arr);
            setLoading(false);
        }
        fetchData();
    }, [propertyID]);

    const columns = [
        { name: 'dateCredit', label: 'Date of Credit', 
            options: {
                customBodyRender: (value) => {
                    console.log(value)
                    let dt = '';
                    if(value.fromDate !== null && value.ToDate !== null) {
                        if(value.fromDate === value.ToDate)
                            dt = moment.utc(value.fromDate).format("MM/DD/YYYY");
                        else
                            dt = moment.utc(value.fromDate).format("MM/DD/YYYY") + " - " + moment.utc(value.ToDate).format("MM/DD/YYYY");
                    }
                    return dt;
                },
            }
        },
        { name: 'inputDate', label: 'Input Credit', },
        { name: 'payee', label: 'Payee', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton color="primary" onClick={() => {
                            const location = {
                                pathname: '/deposits/breakdown',
                                state: { 
                                    checkRegisterID: value.CheckRegisterID
                                }
                            }
                            history.push(location);
                        }}>
                            Deposit
                        </MatButton>
                    )
                },
            }
        },
        { name: 'account', label: 'Account', },
        { name: 'memo', label: 'Memo', },
        { name: 'creditAmt', label: 'Credit Amt', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(value.TransactionType) === 2)
                        return <NumberFormat value={parseFloat(value.Amount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                    return <></>
                },
            }
        },
        { name: 'transactionID', label: 'Transaction ID', },
        { name: 'reconciled', label: 'Reconciled', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(value.Reconciled) === 1) {
                        <IconButton><Done /></IconButton>
                    }
                    return <></>;
                }
            },
        },
        /*
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Edit"
                            onClick={async () => {
                                const isClosedOut = await billsAPI.isClosedOut(value);
                                if(isClosedOut) {
                                    NotificationManager.error("This transaction has been closed out by your accounting dept, and can not be edited", "Error", 6000)
                                    return;
                                }
                                const location = {
                                    pathname: '/deposits/history/edit',
                                    state: { 
                                        checkRegisterID: parseInt(value)
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
        */
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setDeleteDeposit(parseInt(value));
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
        pagination: false,
        selectableRows: "none",
        customSearch: (searchQuery, currentRow, columns) => {
            let found = false;
            currentRow.forEach(element => {
                if(element === null)    found = false;
                else if(typeof element === 'object') {
                    if(element.Amount.toString().trim().includes(searchQuery))
                        found = true;
                    if(element.fromDate.toString().includes(searchQuery))
                        found = true;
                    if(element.ToDate.toString().includes(searchQuery))
                        found = true;
                } else if(element.toString().includes(searchQuery)){
                    found = true;
                }
            });
            return found;
        }
    };

    const deleteDepositBtn = async () => {
        setLoading(true);
        const res = await depositsAPI.deleteDepositHistory(deleteDeposit);
        setLoading(false);
        setDeleteDeposit(0);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Deposit deleted.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Deposit History..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <SweetAlert
                warning
                btnSize="sm"
                show={deleteDeposit !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteDepositBtn()}
                onCancel={() => setDeleteDeposit(0)}
            >
                You will not be able to recover this deposit!
            </SweetAlert>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Deposits History</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Deposits History`}
                            data={deposits}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        </Main>
    )
}

export default History;