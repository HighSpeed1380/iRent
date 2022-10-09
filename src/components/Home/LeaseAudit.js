import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table } from 'reactstrap';
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as helper from '../Util/myFunctions';
import * as homeAPI from '../../Api/home';

const LeaseAudit = () => {
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [ leaseAuditData, setLeaseAuditData ] = useState([]);
    const [ needAudit, setNeedAudit ] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const data = await homeAPI.getLeaseAudit(propertyID);
            setLeaseAuditData(data.data);
            setNeedAudit(data.totalNeedAudit);
        }
        fetchData();
    }, [propertyID]);

    const titleRender = () => {
        return (
            <p>
                Lease Audit Snapshot. {leaseAuditData.length} Missing, {needAudit} Need Auditing.
                {' '}<a href="./index.cfm?p=58">Click to Audit</a>
            </p>
        )
    }

    return (
        <RctCollapsibleCard
           customClasses="overflow-hidden"
           colClasses="col-sm-6 col-md-6 w-xs-half-block"
           heading={titleRender()}
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
                                <th className="text-center">Lease Start date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaseAuditData && leaseAuditData.map((data, key) => {
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
                                        <td className="text-center">{helper.formatDate(new Date(data.LeaseStartDate))}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default LeaseAudit;