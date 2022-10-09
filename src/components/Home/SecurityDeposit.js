import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table, Badge } from 'reactstrap';
import CurrencyFormat from 'react-currency-format';
import { useSelector } from "react-redux";
import NotificationManager from 'react-notifications/lib/NotificationManager';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as homeAPI from '../../Api/home';
import * as depositsAPI from '../../Api/deposits';
import * as Constants from '../Util/constants';

const SecurityDeposit = () => {
    const login = useSelector((state) => state.login);

    const propertyID = login.selectedPropertyID;
    const userID = login.user.id;

    const [ securityDepositData, setSecurityDepositData ] = useState([]);
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setSecurityDepositData(await homeAPI.getSecurityDeposit(propertyID));
        }
        fetchData();
    }, [propertyID, updated]);

    const msg = `Security Deposit. Refunds To Process ${securityDepositData.length}`;

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
                                <th className="text-center">Amount</th>
                                <th className="text-center">Address</th>
                                <th className="text-center">Mark Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {securityDepositData && securityDepositData.map((data, key) => {
                                let address = '';
                                if(data.FAddress !== '')
                                    address = `${data.FAddress}, ${data.FCity}, ${data.FState} ${data.FZip}`;

                                return (
                                    <tr key={key}>
                                        <td className="text-center">{data.TenantFName} {data.TenantLName}</td>
                                        <td className="text-center">
                                            <CurrencyFormat value={parseFloat(data.RefundAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                        </td>
                                        <td className="text-center">{address}</td>
                                        <td className="text-center">
                                            <Badge 
                                                color="success"
                                                onClick={async () => {
                                                    const res = await depositsAPI.markSecurityDepositAsPaid({
                                                        securityDepositID: parseInt(data.SecurityDepositRefundID),
                                                        propertyID,
                                                        amount: parseFloat(data.RefundAmount).toFixed(2),
                                                        memo: `${data.TenantFName} ${data.TenantLName} - Refund`,
                                                        userID
                                                    });
                                                    if(res !== 0) {
                                                        NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
                                                        return;
                                                    }
                                                    setUpdated(!updated);
                                                }}
                                                style={{cursor:'pointer'}}
                                            >
                                                Mark Paid
                                            </Badge>
                                        </td>
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

export default SecurityDeposit;