import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as depositsAPI from '../../Api/deposits';

const EditDepositHistory = (props) => {
    const history = useHistory();
    const checkRegisterID = props.location.state ? props.location.state.checkRegisterID : null;

    const [ loading, setLoading ] = useState(true);
    const [ deposits, setDeposits ] = useState([]);
    const [ total, setTotal ] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const deposits = await depositsAPI.getEditDeposits(checkRegisterID);
            const arr = [];
            let sum = 0;
            for(const tt of deposits.tenantTransactions) {
                let source = '';
                if(parseInt(tt.DepositSourceID) === 1)          source = 'Tenant Payment';
                else if(parseInt(tt.DepositSourceID) === 2)     source = 'Housing Payment';
                else if(parseInt(tt.DepositSourceID) === 4)     source = 'Prospect Payment';
                else if(parseInt(tt.DepositSourceID) === 7)     source = 'Former Tenant Payment';
                else    source = 'Other Income'
                arr.push({
                    depositFrom: source,
                    tenantPayment: parseInt(tt.DepositSourceID) === 1 ? tt.TransactionAmount : 0,
                    housingPayment: parseInt(tt.DepositSourceID) === 2 ? tt.TransactionAmount : 0,
                    escrow: 0,
                    loan: 0,
                    otherIncome: parseInt(tt.DepositSourceID) === 3 ? tt.TransactionAmount : 0,
                    creditDate: moment.utc(tt.TenantTransactionDate).format("MM/DD/YYYY"),
                    edit: tt.TenantTransactionID
                });
                sum += parseFloat(tt.TransactionAmount);
            }
            for(const ep of deposits.escrowPayments) {
                arr.push({
                    depositFrom: "Escrow Reimbursement",
                    tenantPayment: 0,
                    housingPayment: 0,
                    escrow: ep.Amount,
                    loan: 0,
                    otherIncome: 0,
                    creditDate: moment.utc(ep.CreditDate).format("MM/DD/YYYY"),
                    edit: ep.EscrowPaymentsID
                });
                sum += parseFloat(ep.Amount);
            }
            for(const j of deposits.journal) {
                arr.push({
                    depositFrom: "Loan",
                    tenantPayment: 0,
                    housingPayment: 0,
                    escrow: 0,
                    loan: j.JournalAmount,
                    otherIncome: 0,
                    creditDate: moment.utc(j.DateEntered).format("MM/DD/YYYY")
                });
                sum += parseFloat(j.JournalAmount)
            }
            setDeposits(arr);
            setTotal(parseFloat(sum).toFixed(2));
            setLoading(false);
        }
        fetchData();
    }, [checkRegisterID]);

    const columns = [
        { name: 'depositFrom', label: 'Deposit From', },
        { name: 'tenantPayment', label: 'Tenant Payment', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={parseFloat(value).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                },
            }
        },
        { name: 'housingPayment', label: 'Housing Payment', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={parseFloat(value).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                },
            }
        },
        { name: 'escrow', label: 'Escrow Reimbursement', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={parseFloat(value).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                },
            }
        },
        { name: 'loan', label: 'Loan', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={parseFloat(value).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                },
            }
        },
        { name: 'otherIncome', label: 'Other Income', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={parseFloat(value).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                },
            }
        },
        { name: 'creditDate', label: 'Credit Date', },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: false,
        selectableRows: "none",
    };

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Deposits..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const renderTitle = () => {
        return (
            <>
            Total: {' '}
            <NumberFormat value={parseFloat(total).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
            </>
        )
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center" style={{marginTop: '1%'}}>
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                    <h2>
                        <span>Edit Deposit</span>
                    </h2>
                </div>
            </div>
            <div className="row">
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
        </Main>
    )
}

export default EditDepositHistory;