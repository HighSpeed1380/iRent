import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table } from 'reactstrap';
import MatButton from '@material-ui/core/Button';
import CurrencyFormat from 'react-currency-format';
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import NotificationManager from 'react-notifications/lib/NotificationManager';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as helper from '../Util/myFunctions';
import * as homeAPI from '../../Api/home';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const ConcessionRequest = () => {
    const login = useSelector((state) => state.login);
    const user = login.user;

    const propertyID = login.selectedPropertyID;
    const admin = parseInt(user.securityLevel);

    const [ concessionReqData, setConcessionReqData ] = useState([]);
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setConcessionReqData(await homeAPI.getConcessionRequest(propertyID));
        }
        fetchData();
    }, [propertyID, updated]);

    const renderApproveDeny = (id) => {
        if(admin in [1, 2]) {
            return (
                <>
                    <td className="text-center">
                        <MatButton 
                            className="text-success mr-10 mb-10"
                            onClick={async () => {
                                const res = await tenantAPI.updateTenantTransactionType({
                                    tenantTransactionID: parseInt(id),
                                    transactionTypeID: 2
                                });
                                if(res !== 0) {
                                    NotificationManager.error(Constants.DEFAULT_ERROR, "Error")
                                    return;
                                }
                                setUpdated(!updated)
                            }}
                        >
                            Approve
                        </MatButton>
                    </td>
                    <td className="text-center">
                        <MatButton 
                            className="text-danger mr-10 mb-10"
                            onClick={async () => {
                                const res = await tenantAPI.updateTenantTransactionType({
                                    tenantTransactionID: parseInt(id),
                                    transactionTypeID: 4
                                });
                                if(res !== 0) {
                                    NotificationManager.error(Constants.DEFAULT_ERROR, "Error")
                                    return;
                                }
                                setUpdated(!updated)
                            }}
                        >
                            Deny
                        </MatButton>
                    </td>
                </>
            );
        } else {
            return (
                <>
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                </>
            );
        }
    }

    const msg = `Concession Request`;

    return (
        <RctCollapsibleCard
           customClasses="overflow-hidden"
           colClasses="col-sm-6 col-md-6 w-xs-half-block"
           heading={msg}
           collapsible
           closeable
           fullBlock
        >
            <Fragment>
                <Scrollbars className="rct-scroll" autoHeight autoHeightMin={100}
                    autoHeightMax={424} autoHide
                >
                    <Table hover className="mb-0" responsive>
                        <thead>
                            <tr>
                                <th className="text-center">Tenant</th>
                                <th className="text-center">Unit</th>
                                <th className="text-center">Amount</th>
                                <th className="text-center">Comment</th>
                                <th className="text-center">Date</th>
                                <th className="text-center">Action</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {concessionReqData && concessionReqData.map((data, key) => {
                                return (
                                    <tr key={key}>
                                        <td className="text-center">
                                            <Link to={{
                                                pathname: '/tenants/details',
                                                state: {
                                                    tenantID: parseInt(data.TenantID)
                                                }
                                            }}>
                                                {data.TenantFName} {data.TenantLName}
                                            </Link>
                                        </td>
                                        <td className="text-center">{data.UnitName}</td>
                                        <td className="text-center">
                                            <CurrencyFormat value={parseFloat(data.TransactionAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                        </td>
                                        <td className="text-center">{data.Comment}</td>
                                        <td className="text-center">{helper.formatDate(new Date(data.TenantTransactionDate))}</td>
                                        {renderApproveDeny(data.TenantTransactionID)}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default ConcessionRequest;