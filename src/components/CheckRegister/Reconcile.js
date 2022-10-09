import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Typography , Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as checkRegisterAPI from '../../Api/checkRegister';
import * as Constants from '../Util/constants';

const Reconcile = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const singleCheckbook = user.notifications.singleCheckBook;
    const userID = user.id;
    const goal = props.location.state ? props.location.state.goal : null;

    const [ payments, setPayments ] = useState([]);
    const [ credits, setCredits ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ reconcileDate, setReconcileDate ] = useState(null);
    const [ reconcileDifference, setReconcileDifference ] = useState(null);
    const [ totalCredits, setTotalCredits ] = useState(0);
    const [ totalDebits, setTotalDebits ] = useState(0);
    const [ previousBalance, setPreviousBalance ] = useState(0);
    const [ showDifference, setShowDifference ] = useState(0);
    const [ creditsChecked, setCreditsChecked ] = useState([]);
    const [ billsChecked, setBillsChecked ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(goal === null || goal === undefined) {
                history.push('/checkRegister');
            }
            const debits = await checkRegisterAPI.getReconcileDebits({
                singleCheckbook,
                propertyID,
                userID
            });
            let payments = [];
            for(const d of debits) {
                payments.push({
                    check: parseFloat(d.Amount),
                    date: moment(d.CheckDate).format('MM/DD/YYYY'),
                    payee: d.VendorName,
                    debitAmt: d,
                    id: d.CheckRegisterID
                });
            }
            setPayments(payments);
            setBillsChecked(new Array(payments.length).fill(false));

            let creditsArr = [];
            const credits = await checkRegisterAPI.getReconcileCredits({
                singleCheckbook,
                propertyID,
                userID
            });
            const map = new Map(Object.entries(credits.details))
            for(const c of credits.credits) {
                creditsArr.push({
                    date: moment(c.CheckDate).format('MM/DD/YYYY'),
                    payee: {
                        memo: c.Memo,
                        title: map.get(c.CheckRegisterID.toString())
                    },
                    creditAmt: c,
                    id: c.CheckRegisterID
                })
            }
            setCredits(creditsArr);
            setCreditsChecked(new Array(creditsArr.length).fill(false));

            const recLog = await checkRegisterAPI.getReconcileLog(propertyID);
            setReconcileDate(moment(recLog.ReconcileDate).format('MM/DD/YYYY'));
            setReconcileDifference(recLog.Difference);
            const previous = await (checkRegisterAPI.getPreviousReconcile({
                singleCheckbook,
                propertyID,
                userID
            }));
            setPreviousBalance(previous.toFixed(2));
            setShowDifference((previous - goal).toFixed(2));
            setLoading(false);
        }
        fetchData();
    }, [singleCheckbook, propertyID, userID, goal, history]);

    const handlePaymentRowSelect = (curRowSelected) => {
        let diff = parseFloat(showDifference);
        if(curRowSelected.length === 0) {
            setTotalDebits(0);
            let total = 0;
            for(let i=0; i<billsChecked.length; i++) {
                if(billsChecked[i]) {
                    total += parseFloat(payments[i].debitAmt.Amount);
                }
            }
            setShowDifference((diff+total).toFixed(2));
            setBillsChecked(new Array(payments.length).fill(false));
        } else if(curRowSelected.length === payments.length && curRowSelected.length > 1) {
            // all
            let total = 0;
            for(let i=0; i<payments.length; i++) {
                total += parseFloat(payments[i].debitAmt.Amount);
            }
            setTotalDebits(total.toFixed(2));
            setBillsChecked(new Array(payments.length).fill(true));
            setShowDifference((diff-total).toFixed(2));
        } else {
            const val = !billsChecked[curRowSelected[0].index] ? 
                parseFloat(payments[curRowSelected[0].index].debitAmt.Amount) :
                -parseFloat(payments[curRowSelected[0].index].debitAmt.Amount);
            billsChecked[curRowSelected[0].index] = !billsChecked[curRowSelected[0].index];
            const tDebit = parseFloat(totalDebits) + val;
            setTotalDebits(tDebit.toFixed(2));
            setBillsChecked(billsChecked);
            setShowDifference((diff-val).toFixed(2));
        }
    }

    const handleCreditRowSelect = (curRowSelected) => {
        let diff = parseFloat(showDifference);
        if(curRowSelected.length === 0) {
            setTotalCredits(0);
            let total = 0;
            for(let i=0; i<creditsChecked.length; i++) {
                if(creditsChecked[i]) {
                    total += parseFloat(credits[i].creditAmt.Amount);
                }
            }
            setShowDifference((diff-total).toFixed(2));
            setCreditsChecked(new Array(credits.length).fill(false));
        } else if(curRowSelected.length === credits.length && curRowSelected.length > 1) {
            // all
            let total = 0;
            for(let i=0; i<credits.length; i++) {
                total += parseFloat(credits[i].creditAmt.Amount);
            }
            setTotalCredits(total.toFixed(2));
            setCreditsChecked(new Array(credits.length).fill(true));
            setShowDifference((diff+total).toFixed(2));
        } else {
            const val = !creditsChecked[curRowSelected[0].index] ? 
                parseFloat(credits[curRowSelected[0].index].creditAmt.Amount) :
                -parseFloat(credits[curRowSelected[0].index].creditAmt.Amount);
            const tCredit = parseFloat(totalCredits) + val;
            creditsChecked[curRowSelected[0].index] = !creditsChecked[curRowSelected[0].index]
            setTotalCredits(tCredit.toFixed(2));
            setCreditsChecked(creditsChecked);
            setShowDifference((diff+val).toFixed(2));
        }
    }

    const columnsPayments = [
        { name: 'date', label: 'Date', },
        { name: 'payee', label: 'Payee', },
        { name: 'debitAmt', label: 'Debit Amount', 
            options: {
                customBodyRender: (value) => {
                    return  (
                        <Button color="primary"
                            onClick={() => {
                                const location = {
                                    pathname: '/checkRegister',
                                    state: { checkRegisterID: value.CheckRegisterID }
                                }
                                history.push(location);
                            }}
                        >
                            <NumberFormat value={value.Amount} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                        </Button>
                    );
                }
            }
        },
    ];

    const columnsCredits = [
        { name: 'date', label: 'Date', },
        { name: 'payee', label: 'Payee', 
            options: {
                customBodyRender: (value) => {
                    const HtmlTooltip = withStyles((theme) => ({
                        tooltip: {
                          backgroundColor: '#f5f5f9',
                          color: 'rgba(0, 0, 0, 0.87)',
                          fontSize: theme.typography.pxToRem(12),
                          border: '1px solid #dadde9',
                        },
                      }))(Tooltip);
                    return (
                        <HtmlTooltip
                            title={
                            <React.Fragment>
                                <Typography color="inherit" style={{fontSize: '16px'}}>Payments:</Typography>
                                    {value.title.map((data) => {
                                        return (
                                            <>
                                            <span style={{fontSize: '12px'}}>Tenant: {data.tenantName} &nbsp;&nbsp;Amount: ${data.amount}</span>
                                            <br/>
                                            </>
                                        );
                                    })}
                            </React.Fragment>
                            }
                        >
                            <Button>{value.memo}</Button>
                        </HtmlTooltip>
                    );
                }
            },
        },
        { name: 'creditAmt', label: 'Credit Amount', 
            options: {
                customBodyRender: (value) => {
                    return  (
                        <Button color="primary"
                            onClick={() => {
                                const location = {
                                    pathname: '/checkRegister',
                                    state: { checkRegisterID: value.CheckRegisterID }
                                }
                                history.push(location);
                            }}
                        >
                            <NumberFormat value={value.Amount} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                        </Button>
                    );
                }
            }
        },
    ];

    const optionsPayments = {
        filterType: 'dropdown',
        pagination: false,
        onRowSelectionChange: handlePaymentRowSelect
    };

    const optionsCredits = {
        filterType: 'dropdown',
        pagination: false,
        onRowSelectionChange: handleCreditRowSelect
    };

    const backToCR = () => {
        history.push("/checkRegister");
    }

    const completeReconciliation = async () => {
        let crIDs = new Set();
        for(let i=0; i<billsChecked.length; i++) {
            if(billsChecked[i]) {
                crIDs.add(payments[i].id)
            }
        }
        for(let i=0; i<creditsChecked.length; i++) {
            if(creditsChecked[i]) {
                crIDs.add(credits[i].id)
            }
        }
        const res = await checkRegisterAPI.completeReconcile({
            crIDs: Array.from(crIDs).join(','),
            userID,
            propertyID,
            difference: parseFloat(showDifference)
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        backToCR();
    }   

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Data..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            )
        } else {
            return (
                <>
                <div className="row">
                    <div className="col-sm-4 col-md-4 col-xl-4">
                        <RctCollapsibleCard heading="">
                            <div className="alert alert-primary fade show" role="alert">
                                <p>
                                    Total Credit: <NumberFormat value={totalCredits} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/>
                                    Total Debits: <NumberFormat value={totalDebits} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/>
                                    Goal: <NumberFormat value={goal} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/>
                                    Previous Balance: <NumberFormat value={previousBalance} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/>
                                    Difference: <NumberFormat value={showDifference} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/>
                                </p>
                            </div>
                            <Button className="btn btn-primary" onClick={completeReconciliation}>Reconciliation Complete</Button>
                        </RctCollapsibleCard>
                    </div>
                    <div className="col-sm-6 col-md-6 col-xl-6">
                        <RctCollapsibleCard heading="">
                            <div className="alert alert-danger fade show" role="alert">
                                Last Reconciled: {reconcileDate} Difference: {' '}
                                <NumberFormat value={reconcileDifference} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                            </div>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row" style={{paddingBottom: '50px'}}>
                    <div className="col-sm-6 col-md-6 col-xl-6">
                        {/*Payments*/}
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={"Payments"}
                                data={payments}
                                columns={columnsPayments}
                                options={optionsPayments}
                            />
                        </MuiThemeProvider>
                    </div>
                    <div className="col-sm-6 col-md-6 col-xl-6">
                        {/*Credits*/}
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={"Credits"}
                                data={credits}
                                columns={columnsCredits}
                                options={optionsCredits}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
                </>
            );
        }
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                    <i className="ti-angle-left" onClick={backToCR} style={{cursor: 'pointer'}}></i>
                        <h2>
                            <span>Reconcile</span>
                        </h2>
                    </div>
                </div>
                {render()}
            </div>
        </Main>
    );
}

export default Reconcile;