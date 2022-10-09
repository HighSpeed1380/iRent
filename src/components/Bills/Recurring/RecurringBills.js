import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, FormText, Label, Input, } from 'reactstrap';
import { FormGroup, Switch } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import moment from 'moment';
import DatePicker from "reactstrap-date-picker";
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { useSelector } from "react-redux";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as billsAPI from '../../../Api/bills';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as MyFuncs from '../../Util/myFunctions';
import ExistingRecurringBills from './ExistingRecurringBills';

const RecurringBill = () => {
    const login = useSelector((state) => state.login);
    const user = login.user;
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiProp = user.notifications.multiProp;

    const [ addBill, setAddBill ] = useState({
        selectedPayee: 0,
        firstPayBy: moment().format('YYYY-MM-DD'),
        selectedExpenseType: 0,
        markPaid: false,
        debitAmt: '',
        invoiceNumber: '',
        memo: '',
        escrow: false,
        selectedFrequency: 0,
        numPayments: '',
        selectedPostMethod: 0,
        selectedPropertyID: propertyID
    });
    const [ unlimited, setUnlimited ] = useState(false);
    const [ payees, setPayees ] = useState([]);
    const [ expenseTypes, setExpenseTypes ] = useState([]);
    const [ frequency, setFrequency ] = useState([]);
    const [ postMethods, setPostMethods ] = useState([]);
    const [ properties, setProperties ] = useState([]);
    const [ saving, setSaving ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setPayees(await billsAPI.getPayee(companyID));
            setExpenseTypes(await billsAPI.getExpenseTypes(companyID));
            setFrequency(await billsAPI.getFrequencies());
            setPostMethods(await billsAPI.getPostMethods());
            setProperties(await billsAPI.getProperties(userID));
        }
        fetchData();
    }, [companyID, userID]);

    const submitAddBill = async (data) => {
        if(parseInt(data.payee) === 0) {
            NotificationManager.warning('Payee is required!', 'Warning');
            return;
        }
        if(parseInt(data.expenseType) === 0) {
            NotificationManager.warning('Expense Type is required!', 'Warning');
            return;
        }
        const dt = moment(data.firstPay);
        if(!dt.isValid()) {
            NotificationManager.warning("Please enter a valid first pay by date.", "Warning");
            return;
        }
        if(parseInt(data.frequency) === 0) {
            NotificationManager.warning('Frequency is required!', 'Warning');
            return;
        }
        if(parseInt(data.postMethod) === 0) {
            NotificationManager.warning('Post Method is required!', 'Warning');
            return;
        }
        if(data.numPayments === '' && unlimited === false) {
            NotificationManager.warning('You must enter an amount for number of paymetns or select unlimited payments.', 'Warning');
            return;
        }
        setSaving(true);
        
        const res = await billsAPI.addRecurring({
            propertyID: data.properties === undefined ? propertyID : data.properties,
            vendorID: parseInt(data.payee),
            amount: MyFuncs.getFormattedNum(data.debitAmt),
            memo: data.memo,
            expenseTypeID: parseInt(data.expenseType),
            firstPayDate: dt,
            escrow: addBill.escrow,
            invoiceNumber: data.invoiceNumber,
            userID,
            frequencyID: data.frequency,
            postMethodID: data.postMethod,
            unlimited: unlimited,
            numPayments: data.numPayments,
            paid: addBill.markPaid,
            hasFile: data.file !== undefined && data.file.length > 0 ? true : false
        });
        if(isNaN(res) || parseInt(res) <= 0) {
            NotificationManager.error(res, 'Error');
            return;
        }

        // Does it have a receipt?
        if(data.file !== undefined && data.file.length > 0 ) {
            await billsAPI.addRecurringReceipt({
                propertyID,
                recurringBillID: res,
                file: data.file[0]
            });
        }

        setAddBill({
            selectedPayee: 0,
            firstPayBy: moment().format('YYYY-MM-DD'),
            selectedExpenseType: 0,
            markPaid: false,
            debitAmt: '',
            invoiceNumber: '',
            memo: '',
            escrow: false,
            selectedFrequency: 0,
            numPayments: '',
            unlimited: false,
            selectedPostMethod: 0
        });

        setSaving(false);
        NotificationManager.success('Bill added successfully.', 'Success!');
    }

    const handleNumPayments = (val) => {
        setValue('numPayments', val, { shouldValidate: true });
        if(val !== '') {
            setUnlimited(false);
        }
    }

    const handleUnlimited = () => {
        setUnlimited(!unlimited);
        if(!unlimited) {
            setValue('numPayments', '');
        }
    }

    const renderProperties = () => {
        if(multiProp) {
            return (
                <div className="row">
                    <div className="col-sm-3">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="properties" className="mr-sm-10">Properties</Label>
                            <Controller
                                name="properties"
                                control={control}
                                defaultValue={addBill.selectedPropertyID}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="select" id="properties" style={Util.setErrorStyle(errors.properties)} >
                                        {properties.map((obj) => {
                                            return (
                                                <option 
                                                    key={obj.PropertyID} 
                                                    value={obj.PropertyID}
                                                >
                                                        {obj.PropertyName}
                                                </option>
                                            );
                                        })}
                                    </Input>
                                )}
                            />
                            {errors.properties && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </FormGroup>
                    </div>
                </div>
            );
        }
    }

    const renderExpenseType = () => {
        const link = `index.cfm?P=160&R=231`;
        return (
            <>
                Expense Type
                <IconButton
                    aria-label="Print"
                    onClick={() => {
                        window.location.href = link;
                    }}
                    style={{color: 'blue', maxHeight: '10px'}}
                >
                    <AddCircleOutline />
                </IconButton>
            </>
        )
    }

    const renderPayeeLabel = () => {
        const link = `index.cfm?P=18&Ret=10`;
        return (
            <>
                Payee
                <IconButton
                    aria-label="Print"
                    onClick={() => {
                        window.location.href = link;
                    }}
                    style={{color: 'blue', maxHeight: '10px'}}
                >
                    <AddCircleOutline />
                </IconButton>
            </>
        )
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Recurring Bill</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Add Bill">
                            <Form onSubmit={handleSubmit(submitAddBill)}>
                                {renderProperties()}
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="payee" className="mr-sm-10">{renderPayeeLabel()}</Label>
                                            <Controller
                                                name="payee"
                                                control={control}
                                                defaultValue={addBill.selectedPayee}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="payee" >
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
                                            <Label for="expenseType" className="mr-sm-10">{renderExpenseType()}</Label>
                                            <Controller
                                                name="expenseType"
                                                control={control}
                                                defaultValue={addBill.selectedExpenseType}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="expenseType" style={Util.setErrorStyle(errors.expenseType)}>
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
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="firstPay" className="mr-sm-10">First Pay By</Label>
                                            <Controller
                                                name="firstPay"
                                                control={control}
                                                defaultValue={addBill.firstPayBy}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <DatePicker  {...field} id="firstPay" style={Util.setErrorStyle(errors.firstPay)} />
                                                )}
                                            />
                                            {errors.firstPay && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup check className="mb-20">
                                            <Label for="markPaid" className="mr-sm-10">Mark Paid</Label>
                                            <Switch name="markPaid" checked={addBill.markPaid} onChange={() => setAddBill({...addBill, markPaid: !addBill.markPaid})} aria-label="Mark Paid" />
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="debitAmt" className="mr-sm-10">Debit Amt</Label>
                                            <Controller
                                                name="debitAmt"
                                                control={control}
                                                defaultValue={addBill.debitAmt}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <NumberFormat  {...field} id="debitAmt" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.debitAmt)} className="form-control"
                                                    />
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
                                                defaultValue={addBill.invoiceNumber}
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
                                                defaultValue={addBill.memo}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="memo" />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-1">
                                        <FormGroup check className="mb-20">
                                            <Label for="escrow" className="mr-sm-10">Escrow?</Label>
                                            <Switch name="escrow" checked={addBill.escrow} onChange={() => setAddBill({...addBill, escrow: !addBill.escrow})} aria-label="Escrow" />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup>
                                            <Label for="file">Attach Invoice</Label>
                                            <Controller
                                                name="file"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="file" id="file" />
                                                )}
                                            />
                                            <FormText color="muted">
                                                Attach invoice file
                                            </FormText>
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="frequency" className="mr-sm-10">Frequency</Label>
                                            <Controller
                                                name="frequency"
                                                control={control}
                                                defaultValue={addBill.selectedFrequency}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="frequency" style={Util.setErrorStyle(errors.frequency)} >
                                                        <option value="0">Select</option>
                                                        {frequency.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.FrequencyID} 
                                                                    value={obj.FrequencyID}
                                                                >
                                                                        {obj.Frequency}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                            {errors.frequency && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="numPayments" className="mr-sm-10">Number of Payments</Label>
                                            <Controller
                                                name="numPayments"
                                                control={control}
                                                defaultValue={addBill.numPayments}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" id="numPayments"
                                                        onChange={(e) => handleNumPayments(e.target.value)}
                                                    />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <Label for="unlimited" className="mr-sm-10">Unlimited Payments</Label>
                                        <Switch name="unlimited" checked={unlimited} onChange={handleUnlimited} aria-label="Unlimited" />
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="postMethod" className="mr-sm-10">Post Method</Label>
                                            <Controller
                                                name="postMethod"
                                                control={control}
                                                defaultValue={addBill.selectedPostMethod}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="postMethod" style={Util.setErrorStyle(errors.postMethod)} >
                                                        <option value="0">Select</option>
                                                        {postMethods.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.PostMethodID} 
                                                                    value={obj.PostMethodID}
                                                                >
                                                                        {obj.PostMethod}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                            {errors.postMethod && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" size="sm" className="w-auto" disabled={saving}>Add Recurring Bill</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
            <ExistingRecurringBills 
                multiProp={multiProp} propertyID={propertyID} 
                userID={userID} saving={saving} />
        </Main>
    );
};

export default RecurringBill;