import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { useHistory, Link } from "react-router-dom";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import { Button } from 'reactstrap';
import Print from '@material-ui/icons/Print';

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as depositsAPI from '../../Api/deposits';
import * as Constants from '../Util/constants';

const DepositBreakDown = (props) => {
    const history = useHistory();
    const crID = props.location.state ? props.location.state.checkRegisterID : null;

    const [ loading, setLoading ] = useState(true);
    const [ deposits, setDeposits ] = useState([]);
    const [ totalAmount, setTotalAmount ] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(crID === null) {
                history.goBack();
                return;
            }
            const deposits = await depositsAPI.getDepositBreakdown(crID);
                console.log(deposits);
            let arr = [];
            let total = 0;
            for(const d of deposits.tenantDeposits) {
                arr.push({
                    unit: d.UnitName !== undefined ? d.UnitName : '',
                    tenantApplicant: `${d.TenantFName !== undefined ? d.TenantFName : ''} ${d.TenantLName !== undefined ? d.TenantLName : ''}`,
                    payment: d.Comment !== '0' ? d.Comment : '', 
                    amount: parseFloat(d.TransactionAmount).toFixed(2),
                    currency: d.PaymentType,
                    creditDate: d.TenantTransactionDate !== undefined ? moment.utc(d.TenantTransactionDate).format("MM/DD/YYYY") : '',
                    transactionID: d
                });
                total += parseFloat(d.TransactionAmount);
            }
            for(const ep of deposits.escrowPayments) {
                arr.push({
                    payment: 'Escrow Payment',
                    amount: parseFloat(ep.Amount).toFixed(2),
                    creditDate: ep.CreditDate !== undefined ? moment.utc(ep.CreditDate).format("MM/DD/YYYY") : '',
                });
                total += parseFloat(ep.Amount);
            }
            for(const loan of deposits.loanDeposits) {
                arr.push({
                    payment: 'Loan',
                    amount: parseFloat(loan.JournalAmount).toFixed(2),
                    creditDate: loan.CreditDate !== undefined ? moment.utc(loan.CreditDate).format("MM/DD/YYYY") : '',
                });
                total += parseFloat(loan.JournalAmount);
            }
            setDeposits(arr);
            setTotalAmount(total.toFixed(2));
            setLoading(false);
        }
        fetchData();
    }, [crID, history]);

    const columns = [
        { name: 'unit', label: 'Unit', },
        { name: 'tenantApplicant', label: 'Tenant/Applicant', },
        { name: 'payment', label: 'Payment', },
        { name: 'amount', label: 'Amount', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat displayType={"text"} value={value} thousandSeparator={true} prefix={"$"} />
                }
            },
        },
        { name: 'currency', label: 'Currency', },
        { name: 'creditDate', label: 'Credit Date', },
        { name: 'transactionID', label: 'Transaction ID', 
            options: {
                customBodyRender: (value) => {
                    if(value && value !== undefined) {
                        return (
                            <Button className="mr-10 mb-10" color="link"
                                onClick={() => {
                                    const location = {
                                        pathname: '/deposits/editTransaction',
                                        state: { 
                                            tenantTransactionID: value.TenantTransactionID
                                        }
                                    }
                                    history.push(location);
                                }}  
                            >
                                {value.TenantTransactionID}
                            </Button>
                        )
                    }
                }
            },
        },
        { name: 'depositSlip', label: 'Deposit Slip', 
            options: {
                customBodyRender: () => {
                    return (
                        <Link
                            to="/printable/depositSlip"
                            onClick={async () => {
                                await localStorage.setItem("checkRegisterID", crID);
                            }}
                            target="_blank"
                        >
                            <Print />
                        </Link>
                    );
                }
            },
        },
    ];
    const options = {
        filterType: 'dropdown',
        selectableRows: "none",
        rowsPerPage: 100,
    };

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Deposit Breakdown..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const renderTitle = () => {
        return (
            <>
                Total: <NumberFormat displayType={"text"} value={totalAmount} thousandSeparator={true} prefix={"$"} />
            </>
        )
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={{marginTop: '2%'}}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>Deposit Breakdown</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="data-table-wrapper">
                <div className="row" style={{paddingBottom: '50px'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={renderTitle()}
                                data={deposits}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default DepositBreakDown;