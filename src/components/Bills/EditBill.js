import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, FormText, Label, Input } from 'reactstrap';
import { FormGroup, Switch } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import moment from 'moment';
import DatePicker from "reactstrap-date-picker";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as billsAPI from '../../Api/bills';
import * as checkRegisterAPI from '../../Api/checkRegister'
import * as Util from '../Util/util';

const EditBill = (props) => {
    const history = useHistory();

    const login = useSelector((state) => state.login);
    const user = login.user;
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const crID = props.location.state ? props.location.state.checkRegisterID : null;

    const [ loading, setLoading ] = useState(true);
    const [ payees, setPayees ] = useState([]);
    const [ expenseTypes, setExpenseTypes ] = useState([]);
    const [ units, setUnits ] = useState([]);
    const [ saving, setSaving ] = useState(false);
    const [ editBill, setEditBill ] = useState({
        propertyID: 0,
        invoiceDate: '',
        paidDate: '',
        selectedPayee: 0,
        selectedPropertyID: propertyID,
        selectedExpenseType: 0,
        selectedUnit: 0,
        debitAmt: 0,
        invoiceNumber: '',
        memo: '',
        escrow: false,
        id: 0
    });
    const [ updFile, setUpdFile ] = useState(null);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(crID === null)   history.goBack();
            const bill = await checkRegisterAPI.getByID(crID);
            setEditBill({
                propertyID: parseInt(bill.PropertyID),
                invoiceDate: bill.InvoiceDate !== '' ? moment.utc(bill.InvoiceDate).format("YYYY-MM-DD") : '',
                paidDate: bill.PaidDate !== null ? moment.utc(bill.PaidDate).format("YYYY-MM-DD") : '',
                selectedPayee: parseInt(bill.VendorID),
                selectedPropertyID: parseInt(bill.PropertyID),
                selectedExpenseType: parseInt(bill.ExpenseTypeID),
                selectedUnit: parseInt(bill.UnitID),
                debitAmt: parseFloat(bill.Amount).toFixed(2),
                invoiceNumber: bill.InvoiceNumber,
                memo: bill.Memo,
                escrow: parseInt(bill.Escrow) === 1 ? true : false,
                id: bill.CheckRegisterID
            });
            setPayees(await billsAPI.getPayee(companyID));
            setExpenseTypes(await billsAPI.getExpenseTypes(companyID));
            setUnits(await billsAPI.getUnits(parseInt(bill.PropertyID)));
            setLoading(false);
        }
        fetchData();
    }, [crID, companyID, history])

    const onChangePayee = async (val) => {
        const pID = editBill.selectedPropertyID;
        const getData = await billsAPI.payeeUpdate(pID, val);
        const amt = getData.amount !== null ? parseFloat(getData.amount).toFixed(2) : editBill.debitAmt;
        setValue("payee", val);
        setValue("expenseType", getData.expenseTypeID || editBill.selectedExpenseType);
        setValue("debitAmt", amt);
    }

    const submitEditBill = async (data) => {
        if(isNaN(data.debitAmt.toString().replace(/\$|,/g, ''))) {
            NotificationManager.error("Enter a valid debit amount.", "Error");
            return;
        }
        const amt = parseFloat(data.debitAmt.toString().replace(/\$|,/g, '')).toFixed(2);
        if(parseInt(data.payee) === 0) {
            NotificationManager.error("Payee is required.", 'Error');
            return;
        }
        if(parseInt(data.expenseType) === 0) {
            NotificationManager.error("Expense Type is required.", 'Error');
            return;
        }
        const invoiceDT = moment(data.invoiceDate);
        if(!invoiceDT.isValid()) {
            NotificationManager.warning("Please enter a valid invoice date.", "Warning");
            return;
        }
        const paidDT = data.paidDate === '' ? null : moment(data.paidDate);
        if(paidDT !== null && !paidDT.isValid()) {
            NotificationManager.warning("Please enter a valid paid date.", "Warning");
            return;
        }

        const editBillData = {
            propertyID: editBill.propertyID,
            userID,
            vendorID: data.payee,
            expenseTypeID: data.expenseType,
            unitID: editBill.selectedUnit,
            amount: amt,
            invoiceDate: invoiceDT,
            paidDate: paidDT,
            invoiceNumber: data.invoiceNumber,
            memo: data.memo,
            escrow: editBill.escrow,
            hasFile: updFile ? true : false,
            crID: editBill.id
        };
        setLoading(true);
        setSaving(true);
        const res = await checkRegisterAPI.updateBill(editBillData);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            setSaving(false);
            setLoading(false);    
            return;
        }
        if(updFile !== null) {
            await checkRegisterAPI.updBillReceipt({
                propertyID: editBill.propertyID,
                checkRegisterID: editBill.id,
                file: updFile
            });
        }
        setSaving(false);
        setLoading(false);
        NotificationManager.success('Bill added successfully.', 'Success!');
    }

    const handleFileChange = (event) => {
        setUpdFile(event.target.files[0]);
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Bill..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div>
                <div className="formelements-wrapper">
                    <div className="page-title d-flex justify-content-between align-items-center" style={{marginTop: '1%'}}>
                        <div className="page-title-wrap">
                            <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                            <h2>
                                <span>Edit Bill</span>
                            </h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading="Add Bill">
                                <Form onSubmit={handleSubmit(submitEditBill)}>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="invoiceDate" className="mr-sm-10">Invoice Date</Label>
                                                <Controller
                                                    name="invoiceDate"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    defaultValue={editBill.invoiceDate}
                                                    render={({ field }) => (
                                                        <DatePicker {...field} id="invoiceDate" style={Util.setErrorStyle(errors.invoiceDate)} />
                                                    )}
                                                />
                                                {errors.invoiceDate && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-2">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="paidDate" className="mr-sm-10">Paid Date</Label>
                                                <Controller
                                                    name="paidDate"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    defaultValue={editBill.paidDate}
                                                    render={({ field }) => (
                                                        <DatePicker {...field} id="paidDate" style={Util.setErrorStyle(errors.paidDate)} />
                                                    )}
                                                />
                                                {errors.paidDate && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-3">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="payee" className="mr-sm-10">Payee</Label>
                                                <Controller
                                                    name="payee"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    defaultValue={editBill.selectedPayee}
                                                    render={({ field }) => (
                                                        <Input {...field} name="payee" type="select" style={Util.setErrorStyle(errors.payee)}
                                                            onChange={(e) => onChangePayee(e.target.value)}
                                                        >
                                                            <option value="0">Select</option>
                                                            {payees.map((obj) => {
                                                                return (
                                                                    <option 
                                                                        key={obj.VendorID} 
                                                                        value={obj.VendorID}
                                                                    >
                                                                            {obj.VendorName}
                                                                    </option>
                                                                );
                                                            })}
                                                        </Input>
                                                    )}
                                                />
                                                {errors.payee && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-3">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="expenseType" className="mr-sm-10">Account</Label>
                                                <Controller
                                                    name="expenseType"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    defaultValue={editBill.selectedExpenseType}
                                                    render={({ field }) => (
                                                        <Input {...field} name="expenseType" type="select" style={Util.setErrorStyle(errors.expenseType)}>
                                                            <option value="0">Select</option>
                                                            {expenseTypes.map((obj) => {
                                                                return (
                                                                    <option 
                                                                        key={obj.ExpenseTypeID} 
                                                                        value={obj.ExpenseTypeID}
                                                                    >
                                                                            {obj.ExpenseType}
                                                                    </option>
                                                                );
                                                            })}
                                                        </Input>
                                                    )}
                                                />
                                                {errors.expenseType && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="units" className="mr-sm-10">Unit</Label>
                                                <Controller
                                                    name="units"
                                                    control={control}
                                                    defaultValue={editBill.selectedUnit}
                                                    render={({ field }) => (
                                                        <Input {...field} name="units" type="select">
                                                            <option value="0">Select</option>
                                                            {units.map((obj) => {
                                                                return (
                                                                    <option 
                                                                        key={obj.UnitID} 
                                                                        value={obj.UnitID}
                                                                    >
                                                                            {obj.UnitName}
                                                                    </option>
                                                                );
                                                            })}
                                                        </Input>
                                                    )}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-2">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="debitAmt" className="mr-sm-10">Debit Amt</Label>
                                                <Controller
                                                    name="debitAmt"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    defaultValue={editBill.debitAmt}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="debitAmt" style={Util.setErrorStyle(errors.debitAmt)} 
                                                            placeholder="0.00" step="0.01" />
                                                    )}
                                                />
                                                {errors.debitAmt && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-3">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="invoiceNumber" className="mr-sm-10">Invoice Number</Label>
                                                <Controller
                                                    name="invoiceNumber"
                                                    control={control}
                                                    defaultValue={editBill.invoiceNumber}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="invoiceNumber" />
                                                    )}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-3">
                                            <FormGroup className="mr-10 mb-10">
                                                <Label for="memo" className="mr-sm-10">Memo</Label>
                                                <Controller
                                                    name="memo"
                                                    control={control}
                                                    defaultValue={editBill.memo}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="memo" />
                                                    )}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-sm-1">
                                            <FormGroup check className="mb-20">
                                                <Label for="escrow" className="mr-sm-10">Escrow?</Label>
                                                <Switch name="escrow" checked={editBill.escrow} onChange={() => setEditBill({...editBill, escrow: !editBill.escrow})} aria-label="Escrow" />
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <FormGroup>
                                                <Label for="file">Attach Receipt</Label>
                                                <Input type="file" id="file" onChange={handleFileChange} />
                                                <FormText color="muted">
                                                    Attach invoice file
                                                </FormText>
                                            </FormGroup>
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" size="sm" className="w-auto" disabled={saving}>Update Bill</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default EditBill;