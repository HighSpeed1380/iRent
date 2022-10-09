import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import ReactDOMServer from 'react-dom/server';
import { useSelector } from "react-redux";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import PDFViewer from '../Helpers/PDFViewer/PDFViewer';

const pageStyle = {
    paddingLeft: '3%',
    paddingRight: '3%',
    paddingTop: '1%'
};

const AllTenantsStatement = () => {
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const multiprop = user.notifications.multiProp;
    const onlyDeliquents = parseInt(localStorage.getItem("onlyDeliquents")) || false;

    const [ loading, setLoading ] = useState(true);
    const [ tenants, setTenants ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setTenants(await tenantAPI.getAllTenantsStatement({
                multiprop,
                userID,
                propertyID,
                onlyDeliquents
            }));
            setLoading(false);
        }
        fetchData();
    }, [multiprop, propertyID, userID, onlyDeliquents]);

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Tenants Statement..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            if(tenants.length === 0)    return <></>;
            const data = () => {
                return ReactDOMServer.renderToStaticMarkup(
                    <>
                    <div id="AllTenantsStatementDiv" style={pageStyle}>
                        {tenants.map((obj) => {
                            const rent = () => {
                                if(parseFloat(obj.RentalAmount) > 0)
                                    return <>Tenant Rent: <b><NumberFormat value={parseFloat(obj.RentalAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
                            }
                            const housing = () => {
                                if(parseFloat(obj.HousingAmount) > 0)
                                    return <>Housing Rent: <b><NumberFormat value={parseFloat(obj.HousingAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
                            }
                            const pet = () => {
                                if(parseFloat(obj.PetRent) > 0)
                                    return <><b>Pet Rent: <NumberFormat value={parseFloat(obj.PetRent).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
                            }
                            const utility = () => {
                                if(parseFloat(obj.UtilityCharge) > 0)
                                    return <>Utility Charge: <b><NumberFormat value={parseFloat(obj.UtilityCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
                            }

                            let balance = 0;
                            return (
                                <>
                                <div className="row">
                                    <div className="col-sm-4 offset-md-4">
                                        <p style={{textAlign: 'center', fontSize: '22px'}}>Tenant Statement</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <p style={{paddingLeft: '10%'}}>
                                            <b>{obj.TenantFName} {obj.TenantLName}</b> <br/>
                                            {obj.PropertyAddress1} <br/>
                                            Unit {obj.UnitName} <br />
                                            {obj.PropertyCity}, {obj.PropertyState} {obj.PropertyZip}
                                        </p>
                                    </div>
                                    <div className="col-sm-6">
                                        <p style={{paddingRight: '10%', textAlign: 'right'}}>
                                            Statement Date: <b>{moment().format("MM/DD/YYYY")}</b><br />
                                            {rent()}
                                            {housing()}
                                            {pet()}
                                            {utility()}
                                            Lease Start: <b>{moment.utc(obj.LeaseStartDate).format("MM/DD/YYYY")}</b><br/>
                                            Lease End: <b>{moment.utc(obj.LeaseEndDate).format("MM/DD/YYYY")}</b>
                                        </p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
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
                                                {obj.Statements.map((stat) => {
                                                    if(parseInt(stat.TransactionTypeID) === 1)      balance += parseFloat(stat.TransactionAmount);
                                                    else if(parseInt(stat.TransactionTypeID) === 2) balance -= parseFloat(stat.TransactionAmount);

                                                    const renderChargeCredit = () => {
                                                        if(parseInt(stat.TransactionTypeID) === 1) {
                                                            return (
                                                                <>
                                                                    <td className="text-center"><NumberFormat value={parseFloat(stat.TransactionAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                                    <td className="text-center"></td>
                                                                </>
                                                            );
                                                        }
                                                        if(parseInt(stat.TransactionTypeID) === 2) {
                                                            return (
                                                                <>
                                                                    <td className="text-center"></td>
                                                                    <td className="text-center"><NumberFormat value={parseFloat(stat.TransactionAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                                </>
                                                            );
                                                        }
                                                    }

                                                    return (
                                                        <tr key={stat.TenantTransactionID}>
                                                            <td className="text-center">{moment.utc(stat.TenantTransactionDate).format("MM/DD/YYYY")}</td>
                                                            <td className="text-center">{stat.ChargeType} - {stat.Comment}</td>
                                                            {renderChargeCredit()}
                                                            <td className="text-center"><NumberFormat value={parseFloat(balance).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                                <p style={{pageBreakBefore: 'always'}}></p>
                                </>
                            );
                        })}
                    </div>
                    </>
                );
            }
            const html = data();
            return <PDFViewer html={html} />
        }
    }

    return render();
};

export default AllTenantsStatement;