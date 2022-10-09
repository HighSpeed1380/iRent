import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import { useSelector } from "react-redux";

import * as depositAPI from '../../Api/deposits';
import * as customFunctions from '../Util/myFunctions';

const styles = {
    marginTop: '3%'
};

const DepositSlip = (props) => {
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const multiProp = user.notifications.multiProp;
    const singlecheckbook = user.notifications.singlecheckbook;
    const checkRegisterID = parseInt(localStorage.getItem("checkRegisterID")) || null;
    
    const [ data, setData ] = useState([]);
    const [ totals, setTotals ] = useState({
        cash: 0,
        other: 0
    });
    const [ depositDate, setDepositDate ] = useState(moment().format("MM/DD/YYYY"));

    useEffect(() => {
        async function fetchData() {
            const deposits = await depositAPI.getSlip({
                checkRegisterID,
                multiProp,
                singlecheckbook,
                propertyID,
                userID
            });
            let arr = [];
            let totalCash = 0, totalOther = 0;
            for(const d of deposits) {
                if(checkRegisterID !== null) {
                    arr.push({
                        id: d.ID,
                        unitID: d.UnitID,
                        depositSourceID: parseInt(d.DepositSourceID),
                        comment: d.TransactionComment,
                        unit: `${d.UnitName === undefined || d.UnitName === null ? 'Prospect ' : d.UnitName} ${d.TenantFName} ${d.TenantLName}`,
                        tenantRent: parseInt(d.DepositSourceID) === 1 ? parseFloat(d.TransactionAmount) : 0,
                        housingRent: parseInt(d.DepositSourceID) === 2 ? parseFloat(d.TransactionAmount) : 0,
                        otherIncome: parseInt(d.DepositSourceID) === 3 ? parseFloat(d.TransactionAmount) : 0,
                        currency: d.PaymentType,
                        creditDate: d.TenantTransactionDate === '' ? '' : moment.utc(d.TenantTransactionDate).format('YYYY-MM-DD'),
                        checkNumber: d.CheckNumber
                    });
                    if(parseInt(d.PaymentTypeID) === 3)
                        totalCash += parseFloat(d.TransactionAmount);
                    else
                        totalOther += parseFloat(d.TransactionAmount);
                } else {
                    arr.push({
                        id: d.ID,
                        unitID: d.UnitID,
                        depositSourceID: parseInt(d.DepositSourceID),
                        comment: d.TransactionComment,
                        unit: `${d.UnitName} ${d.TenantFName} ${d.TenantLName}`,
                        tenantRent: parseFloat(d.TenantAmount),
                        housingRent: parseFloat(d.HousingAmount),
                        otherIncome: parseFloat(d.OtherAmount),
                        currency: d.PaymentType,
                        creditDate: d.TransactionDate === '' ? '' : moment.utc(d.TransactionDate).format('YYYY-MM-DD'),
                        checkNumber: d.CheckNumber
                    });
                    if(parseInt(d.PaymentTypeID) === 3)
                        totalCash += parseFloat(d.TenantAmount) + parseFloat(d.HousingAmount) + parseFloat(d.OtherAmount);
                    else
                        totalOther += parseFloat(d.TenantAmount) + parseFloat(d.HousingAmount) + parseFloat(d.OtherAmount);
                }
            }
            setData(arr);
            setTotals({
                cash: parseFloat(totalCash),
                other: parseFloat(totalOther)
            });
            if(checkRegisterID !== null && arr.length > 0)
                setDepositDate(arr[0].creditDate);
        }
        fetchData();
    }, [checkRegisterID, multiProp, singlecheckbook, propertyID, userID]);

    const calculateTotal = useCallback(() => {
        return parseFloat(totals.cash + totals.other);
    }, [totals]);

    return (
        <>
            <div className="row" style={styles}>
                <div className="col-sm-8 offset-md-2">
                    <div id="depositSlipDiv" className="table-responsive">
                        <div className="unseen">
                            <Table bordered striped>
                                <thead>
                                    <tr key={1}>
                                        <th colSpan={7} className="text-center"><h3>Deposit Slip</h3></th>
                                    </tr>
                                    <tr key={2}>
                                        <th className="text-center">Unit Number</th>
                                        <th className="text-center">Tenant Rent</th>
                                        <th className="text-center">Housing Payment</th>
                                        <th className="text-center">Other Income</th>
                                        <th className="text-center">Currency</th>
                                        <th className="text-center">Credit Date</th>
                                        <th className="text-center">Check Number</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((obj) => {
                                        let unitDesc = obj.unit;
                                        if(obj.depositSourceID === 3) {
                                            unitDesc = `Other Income ${obj.comment}`;
                                        }
                                        return (
                                            <tr key={obj.ID}>
                                                <td className="text-center">{unitDesc}</td>
                                                <td className="text-center"><NumberFormat value={obj.tenantRent.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                <td className="text-center"><NumberFormat value={obj.housingRent.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                <td className="text-center"><NumberFormat value={obj.otherIncome.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                                <td className="text-center">{obj.currency}</td>
                                                <td className="text-center">{moment.utc(obj.creditDate).format("MM/DD/YYYY")}</td>
                                                <td className="text-center">{obj.checkNumber}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="text-right" colSpan={7}>
                                            Total Cash: <NumberFormat value={totals.cash.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br />
                                            Total Other: <NumberFormat value={totals.other.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br />
                                            <b>Total Deposit: <NumberFormat value={calculateTotal().toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /></b>
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </div>
                    </div>
                    <p style={{textAlign: "center", fontSize: '15px'}}>Deposit Date: {moment.utc(depositDate).format("MM/DD/YYYY")}</p>
                    <div style={{textAlign: "center"}}><Button color="primary" onClick={() => customFunctions.printReports('depositSlipDiv')}>Print</Button></div>
                </div>
            </div>
        </>
    );
}

export default DepositSlip;