import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table } from 'reactstrap';
import NumberFormat from 'react-number-format';
import ReactDOMServer from 'react-dom/server';

import RctCollapsibleCard from './RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../util/LinearProgress';
import * as tenantAPI from '../api/Tenants';
import PDFViewer from '../Helpers/PDFViewer/PDFViewer';

const MoveOutStatement = () => {
    const tenantID = parseInt(localStorage.getItem("tenantID")) || null;
    const [ loading, setLoading ] = useState(false);
    const [ tenantData, setTenantData ] = useState({});

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setTenantData(await tenantAPI.getMoveOutStatementData(tenantID));
            setLoading(false);
        }
        fetchData();
    }, [tenantID])

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
            if(Object.keys(tenantData).length === 0)    return <></>;
            const rent = () => {
                if(parseFloat(tenantData.RentalAmount) > 0)
                    return <>Tenant Rent: <b><NumberFormat value={parseFloat(tenantData.RentalAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
            }
            const housing = () => {
                if(parseFloat(tenantData.HousingAmount) > 0)
                    return <>Housing Rent: <b><NumberFormat value={parseFloat(tenantData.HousingAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
            }
            const pet = () => {
                if(parseFloat(tenantData.PetRent) > 0)
                    return <>Pet Rent: <b><NumberFormat value={parseFloat(tenantData.PetRent).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
            }
            const utility = () => {
                if(parseFloat(tenantData.UtilityCharge) > 0)
                    return <>Utility Charge: <b><NumberFormat value={parseFloat(tenantData.UtilityCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b><br/></>
            }
            const data = () => {
                let balance = 0;
                return ReactDOMServer.renderToStaticMarkup(
                //return (
                <>
                    <div className="row">
                        <div className="col-sm-4 offset-md-4">
                            <p style={{textAlign: 'center', fontSize: '22px'}}>Tenant Statement</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-4 offset-md-2">
                            <p style={{paddingLeft: '10%'}}>
                                {tenantData.TenantFName} {tenantData.TenantLName} <br />
                                Unit: <b>{tenantData.UnitName}</b> <br />
                                Reason Left: {tenantData.ReasonLeft}
                            </p>
                        </div>
                        <div className="col-sm-4 offset-md-2">
                            <p style={{paddingLeft: '10%'}}>
                                Statement Date: {moment().format("MM/DD/YYYY")} <br />
                                {rent()}
                                {housing()}
                                {pet()}
                                {utility()}
                                Lease Start: <b>{moment.utc(tenantData.LeaseStartDate).format("MM/DD/YYYY")}</b><br/>
                                Lease End: <b>{moment.utc(tenantData.LeaseEndDate).format("MM/DD/YYYY")}</b><br/>
                                Move Out: <b>{moment.utc(tenantData.MoveOutDate).format("MM/DD/YYYY")}</b>
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
                                    {tenantData.Statements && tenantData.Statements.map((stat) => {
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
                </>
                );
            }
            const html = data();
            return <PDFViewer html={html} />
        }
   }

    return render();
}

export default MoveOutStatement;