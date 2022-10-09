import React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import moment from 'moment';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as customFuncs from '../Util/myFunctions';
import * as tenantAPI from '../../Api/tenants';

const DepositReceipt = () => {
    const tempTransactionID = parseInt(localStorage.getItem("tempTransactionID")) || null;

    const [ loading, setLoading ] = useState(true);
    const [ data, setData ] = useState({});

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setData(await tenantAPI.getTempTransactionDetails(tempTransactionID));
            setLoading(false);
        }
        fetchData();
    }, [tempTransactionID])

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
            const totalTransaction = parseFloat(data.HousingAmount) + parseFloat(data.TenantAmount);
            return (
                <>
                    <div style={{marginTop: '1%', marginLeft: '1%', marginRight: '1%', marginBottom: '1%'}}>
                        <Button color="primary" onClick={() => customFuncs.printReports('DepositReceiptDiv')}>Print</Button>
                    </div>
                    <div id="DepositReceiptDiv" className="row">
                        <div className="col-sm-4 offset-md-4">
                            <p style={{textAlign: 'center'}}>Receipt for Payment</p>
                            <Table bordered>
                                <tr>
                                    <th>
                                        <p>
                                            {data.TenantFName} {data.TenantLName} <br />
                                            Unit {data.UnitName} <br />
                                            <NumberFormat value={data.TenantPhone} displayType={'text'} format="+1 (###) ###-####" mask="_"/> <br />
                                            {data.TenantEmail}
                                        </p>
                                    </th>
                                    <th>
                                        Receipt Date: {moment().format("MM/DD/YYYY")}
                                    </th>
                                </tr>
                            </Table>
                            <Table bordered>
                                <thead>
                                    <tr>
                                        <th className="text-center">Transaction Date</th>
                                        <th className="text-center">Transaction Amount</th>
                                        <th className="text-center">Currency Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="text-center">{moment(data.TransactionDate).format("MM/DD/YYYY")}</td>
                                        <td className="text-center"><NumberFormat value={parseFloat(totalTransaction).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                        <td className="text-center">{data.PaymentType}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </>
            );
        }
    }

    return render();
}

export default DepositReceipt;