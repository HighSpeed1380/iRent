import React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import { useHistory } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as MyFuncs from '../Util/myFunctions';

const AccountSummaryTenantStatement = () => {
    const history = useHistory();
    const tenantID = parseInt(localStorage.getItem("tenantID")) || null;

    const [ loading, setLoading ] = useState(true);
    const [ companyProp, setCompanyProp ] = useState({});
    const [ tenant, setTenant ] = useState({});
    const [ unit, setUnit ] = useState({});
    const [ currentBalance, setCurrentBalance ] = useState(0);
    const [ tableData, setTableData ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/');
            }
            const compProp = await tenantAPI.getCompanyPropDetails(tenantID);
            if(compProp !== null) {
                setCompanyProp({
                    propertyName: compProp.PropertyName,
                    companyName: compProp.CompanyName,
                    address: `${compProp.PropertyAddress1} ${compProp.PropertyAddress2} ${compProp.PropertyCity} ${compProp.PropertyState}, ${compProp.PropertyZip}`,
                    phone: compProp.PropertyPhone
                });
            }
            setTenant(await tenantAPI.getTenant(tenantID));
            setUnit(await tenantAPI.getTenantUnit(tenantID));
            setCurrentBalance(await tenantAPI.getBalanceUntil({
                tenantID,
                date: new Date(moment().add(-90, 'days'))
            }));
            setTableData(await tenantAPI.getTransactionsAfterDate({
                tenantID,
                date: new Date(moment().add(-90, 'days'))
            }));
            setLoading(false);
        }
        fetchData();
    }, [tenantID, history])

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            let curBalance = currentBalance;
            return (
                <>
                    <div style={{marginTop: '1%', marginLeft: '1%', marginRight: '1%', marginBottom: '1%'}}>
                        <Button color="primary" onClick={() => MyFuncs.printReports('AccountSummaryTenantStatementDiv')}>Print</Button>
                    </div>
                    <div id="AccountSummaryTenantStatementDiv" style={{marginLeft: '1%', marginRight: '1%'}}>
                        <div className="row">
                            <div className="col-sm-12">
                                <p>
                                    <b>
                                        {companyProp.propertyName} <br />
                                        Managed By: {companyProp.companyName} <br/>
                                        {companyProp.address} <br />
                                        <NumberFormat value={companyProp.phone} displayType={'text'} format="+1 (###) ###-####" mask="_"/>
                                    </b>
                                </p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4 offset-md-4">
                                <p style={{textAlign: 'center'}}>
                                    <h3>Tenant Statement</h3> <br/>
                                    <span style={{color: 'red'}}>* This statement excludes late fees.</span>
                                </p>
                            </div>
                        </div>
                        <div className="row" style={{marginTop: '2px', marginBottom: '2px'}}>
                            <div className="col-sm-4 offset-md-2">
                                <p>
                                    {tenant.TenantFName} {tenant.TenantLName} <br />
                                    Unit: <b>{unit.UnitName}</b>
                                </p>
                            </div>
                            <div className="col-sm-4 offset-md-2">
                                <p>
                                    Statement Date: {moment().format("MM/DD/YYYY")} <br />
                                    Tenant Rent <NumberFormat value={parseFloat(tenant.RentalAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br />
                                    Lease Start {moment(tenant.LeaseStartDate).format("MM/DD/YYYY")} <br />
                                    Lease End {moment(tenant.LeaseEndDate).format("MM/DD/YYYY")} <br />
                                    Statement Starting {moment().add(-90, 'days').format("MM/DD/YYYY")} <br />
                                </p>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <div id="depositSlipDiv" className="table-responsive">
                                    <div className="unseen">
                                        <Table bordered striped>
                                            <thead>
                                                <tr>
                                                    <th className="text-center">Transaction Date</th>
                                                    <th className="text-center">Description</th>
                                                    <th className="text-center">Charge</th>
                                                    <th className="text-center">Credit</th>
                                                    <th className="text-center">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="text-center"></td>
                                                    <td className="text-center">Previous Balance</td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center"></td>
                                                    <td className="text-center"><NumberFormat value={parseFloat(currentBalance).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                </tr>
                                                {tableData.map((obj) => {
                                                    if(parseInt(obj.TransactionTypeID) === 1)       curBalance += parseFloat(obj.TransactionAmount);
                                                    else if(parseInt(obj.TransactionTypeID) === 2)  curBalance -= parseFloat(obj.TransactionAmount)
                                                    const charge = parseInt(obj.TransactionTypeID) === 1 ? parseFloat(obj.TransactionAmount) : 0;
                                                    const credit = parseInt(obj.TransactionTypeID) === 2 ? parseFloat(obj.TransactionAmount) : 0;
                                                    return (
                                                        <tr key={obj.TenantTransactionID}>
                                                            <td className="text-center">{moment(obj.TenantTransactionDate).format("MM/DD/YYYY")}</td>
                                                            <td className="text-center">{obj.ChargeType} - {obj.Comment}</td>
                                                            <td className="text-center"><NumberFormat value={parseFloat(charge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                            <td className="text-center"><NumberFormat value={parseFloat(credit).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                            <td className="text-center"><NumberFormat value={parseFloat(curBalance).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td className="text-right" colSpan={5}>
                                                        <b>Total <NumberFormat value={parseFloat(curBalance).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            );
        }
    }

    return render();
}

export default AccountSummaryTenantStatement;