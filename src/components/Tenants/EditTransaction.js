import React, { useState, useEffect } from 'react';
import { Button, Form, Label, Input, Alert } from 'reactstrap';
import NumberFormat from 'react-number-format';
import moment from 'moment';
import DatePicker from "reactstrap-date-picker";
import { NotificationManager } from 'react-notifications';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';

const EditTransaction = (props) => {
    const tenantTransactionID = props.tenantTransactionID;
    const admin = props.admin;
    const userID = props.userID;
    const propertyID = props.propertyID;
    const companyID = props.companyID;

    const [ loading, setLoading ] = useState(true);
    const [ transactionTypeLabel, setTransactionTypeLabel ] = useState('');
    const [ transactionTypes, setTransactionTypes ] = useState([]);
    const [ tenants, setTenants ] = useState([]);
    const [ originalTransaction, setOriginalTransaction ] = useState({
        date: null,
        amount: 0,
        tenantID: 0,
        comment: '',
        chargeType: 0
    });
    const [ editData, setEditData ] = useState({
        selectedTransactionType: 0,
        amount: 0,
        date: moment().format("YYYY-MM-DD"),
        tenantID: 0,
        comment: ''
    });
    const [ reconcile, setReconcile ] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const transactionDetails = await tenantAPI.getEditTransactionDetails(tenantTransactionID);
            setTransactionTypeLabel(transactionDetails.TransactionType);
            setTransactionTypes(await tenantAPI.getEditTransactionType(parseInt(transactionDetails.TransactionTypeID)));
            let selectedTransactionID = parseInt(transactionDetails.ChargeTypeID);
            if(parseInt(transactionDetails.TransactionTypeID) !== 1 && parseInt(transactionDetails.TransactionTypeID) !== 3) {
                selectedTransactionID = selectedTransactionID === 6 ? 2 : selectedTransactionID;
            }
            setEditData({
                amount: parseFloat(transactionDetails.TransactionAmount).toFixed(2),
                selectedTransactionType: selectedTransactionID,
                date: transactionDetails.TenantTransactionDate ? moment(transactionDetails.TenantTransactionDate).format("YYYY-MM-DD") : '',
                tenantID: parseInt(transactionDetails.TenantID),
                comment: transactionDetails.Comment
            });
            setOriginalTransaction({
                amount: parseFloat(transactionDetails.TransactionAmount).toFixed(2),
                chargeType: selectedTransactionID,
                date: transactionDetails.TenantTransactionDate ? moment(transactionDetails.TenantTransactionDate).format("YYYY-MM-DD") : '',
                tenantID: parseInt(transactionDetails.TenantID),
                comment: transactionDetails.Comment
            });
            setTenants(await tenantAPI.getEditTransactionTenants(parseInt(transactionDetails.TenantID)));
            setReconcile(transactionDetails.Reconciled === null ? 0 : parseInt(transactionDetails.Reconciled));
            setLoading(false);
        }
        fetchData();
    }, [tenantTransactionID]);

    const updTransaction = async () => {
        if(parseInt(editData.selectedTransactionType) === 0) {
            NotificationManager.warning("Please enter select a Transaction Type.", "Warning");
            return;
        }
        const newTransactionDt = moment(editData.date);
        if(!newTransactionDt.isValid()) {   
            NotificationManager.warning("Please enter a Transaction Date.", "Warning");
            return;
        }
        if(parseFloat(editData.amount) === 0) {
            NotificationManager.warning("Please enter a valid Transaction Amount.", "Warning");
            return;
        }
        setLoading(true);
        const res = await tenantAPI.editTransaction({
            tenantTransactionID,
            transactionAmount: parseFloat(editData.amount).toFixed(2),
            tenantID: parseInt(editData.tenantID),
            transactionDate: newTransactionDt,
            chargeTypeID: parseInt(editData.selectedTransactionType),
            userID,
            comment: editData.comment,
            originalTransactionDate: moment(originalTransaction.date),
            originalAmount: parseFloat(originalTransaction.amount).toFixed(2),
            originalChargeTypeID: parseInt(originalTransaction.chargeType),
            originalComment: originalTransaction.comment,
            propertyID,
            originalTenantID: originalTransaction.tenantID,
            companyID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us", "Error!");
            return;
        }
        NotificationManager.success("Transaction updated successfully.", "Success!");
        return;
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Transaction..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const AmountLabel = () => {
                if(parseInt(reconcile) === 1) 
                    return <span>Amount <font color="red">Reconciled</font></span>;
                else
                return <span>Amount</span>;
            }
            const AmountDisplay = () => {
                if(parseInt(admin) in [1, 2, 5]) {
                    return (
                        <NumberFormat namne="amount" thousandSeparator={true} prefix={"$"} defaultValue={parseFloat(editData.amount).toFixed(2)}
                            onValueChange={(v) => setEditData({...editData, amount: v.floatValue === undefined ? 0 : v.floatValue})}
                            className="form-control"
                        />
                    );
                } else {
                    return (
                        <NumberFormat namne="amount" displayType={'text'} thousandSeparator={true} prefix={"$"} defaultValue={parseFloat(editData.amount).toFixed(2)} 
                            className="form-control"
                        />
                    );
                }
            }
            const DateDisplay = () => {
                if(parseInt(admin) in [1, 2, 5]) {
                    return (
                        <DatePicker name="date" id="date" value={editData.date} 
                            onChange={(e) => setEditData({...editData, date: e ? moment(e).format('YYYY-MM-DD') : ''})}
                        />
                    );
                } else {
                    return (
                        <span>{moment(editData.date).format("MM/DD/YYYY")}</span>
                    );
                }
            }
            const showReconcileAlert = () => {
                if(parseInt(reconcile) === 1) {
                    return (
                        <div className="row" style={{marginLeft: '1px', marginTop: '20px'}}>
                            <Alert color="danger">
                                Changing a reconciled transaction <b>amount</b> will cause that total deposit to become unreconciled.
                            </Alert>
                        </div>
                    )
                }
            }

            return (
                <>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => props.closeEdit()}></i>
                        <h2>
                            <span>Edit Transaction</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Edit Transaction">
                            <Form>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <Label for="transactionType" className="mr-sm-10">Transaction Type {transactionTypeLabel}</Label>
                                        <Input type="select" name="transactionType" id="transactionType" 
                                            value={editData.selectedTransactionType} onChange={(e) => setEditData({...editData, selectedTransactionType: e.target.value})}
                                        >
                                            <option value="0">Select</option>
                                            {transactionTypes.map((obj) => {
                                                return (
                                                    <option 
                                                        key={obj.id} 
                                                        value={obj.id}
                                                    >
                                                        {obj.desc}
                                                    </option>
                                                );
                                            })}
                                        </Input>
                                    </div>
                                    <div className="col-sm-2">
                                        <Label for="amount" className="mr-sm-10">{AmountLabel()}</Label>
                                        {AmountDisplay()}
                                    </div>
                                    <div className="col-sm-2">
                                        <Label for="date" className="mr-sm-10">Transaction Date</Label>
                                        {DateDisplay()}
                                    </div>
                                    <div className="col-sm-3">
                                        <Label for="teanntID" className="mr-sm-10">Tenant</Label>
                                        <Input type="select" name="teanntID" id="teanntID" value={editData.tenantID} 
                                            onChange={(e) => setEditData({...editData, tenantID: e.target.value})}
                                        >
                                            {tenants.map((obj) => {
                                                return (
                                                    <option 
                                                        key={obj.TenantID} 
                                                        value={obj.TenantID}
                                                    >
                                                        {obj.UnitName} - {obj.TenantFName} {obj.TenantLName}
                                                    </option>
                                                );
                                            })}
                                        </Input>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <Label for="comment" className="mr-sm-10">Comment</Label>
                                        <Input type="text" name="comment" id="comment" value={editData.comment} 
                                            onChange={(e) => setEditData({...editData, comment: e.target.value})}
                                        />
                                    </div>
                                </div>
                                {showReconcileAlert()}
                                <Button color="primary" style={{marginTop: '15px'}} onClick={updTransaction}>Update Transaction</Button>
                                {' '}
                                <Button color="warning" style={{marginTop: '15px'}} onClick={() => props.closeEdit()}>Return</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                </>
            );
        }
    }

    return render();
}

export default EditTransaction;