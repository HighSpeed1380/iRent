import React, { useState, useEffect, useCallback } from 'react';
import { Controller, useForm } from "react-hook-form";
import {
	Button,
	Form, FormText,
	Label,
	Input,
} from 'reactstrap';
import { FormGroup, Switch } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import moment from 'moment';
import DatePicker from "reactstrap-date-picker";
import IconButton from '@material-ui/core/IconButton';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { useSelector } from "react-redux";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as billsAPI from '../../../Api/bills';
import ListUnpaid from './ListUnpaid';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as MyFuncs from '../../Util/myFunctions';

const UnpaidBills = () => {
    const login = useSelector((state) => state.login);
    const user = login.user;
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiProp = user.notifications.multiProp;

    const [ addBill, setAddBill ] = useState({
        selectedPayee: 0,
        selectedExpenseType: 0,
        selectedLender: 0,
        selectedUnit: 0,
        debitAmt: '',
        invoiceNumber: '',
        memo: '',
        invoiceDate: moment.utc().format('YYYY-MM-DD'),
        escrow: false,
        selectedPropertyID: propertyID
    });
    const [ payees, setPayees ] = useState([]);
    const [ expenseTypes, setExpenseTypes ] = useState([]);
    const [ lenders, setLenders ] = useState([]);
    const [ units, setUnits ] = useState([]);
    const [ properties, setProperties ] = useState([]);
    const [ saving, setSaving ] = useState(false);
    const [ updFile, setUpdFile ] = useState(null);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setPayees(await billsAPI.getPayee(companyID));
            setExpenseTypes(await billsAPI.getExpenseTypes(companyID));
            setLenders(await billsAPI.getLenders(companyID));
            setUnits(await billsAPI.getUnits(propertyID));
            setProperties(await billsAPI.getProperties(userID));
        }
        fetchData();
    }, [companyID, propertyID, userID]);

    const renderLenders = () => {
        if(parseInt(addBill.selectedExpenseType) === 18) {
            return (
                <>
                    <div className="col-sm-3">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="lender" className="mr-sm-10">Lender</Label>
                            <Controller
                                name="lender"
                                control={control}
                                defaultValue={addBill.selectedLender}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="select" id="lender"
                                        style={Util.setErrorStyle(errors.lender)}
                                    >
                                        <option value="0">Select</option>
                                        {lenders.map((obj) => {
                                            return (
                                                <option 
                                                    key={obj.LenderID} 
                                                    value={obj.LenderID}
                                                >
                                                        {obj.Lender}
                                                </option>
                                            );
                                        })}
                                    </Input>
                                )}
                            />
                            {errors.lender && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </FormGroup>
                    </div>
                </>
            );
        }
    }

    const renderUnits = () => {
        if(!multiProp) {
            return (
                <>
                    <div className="col-sm-3">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="units" className="mr-sm-10">Unit</Label>
                            <Controller
                                name="units"
                                control={control}
                                defaultValue={addBill.selectedUnit}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="select" id="units"
                                        style={Util.setErrorStyle(errors.units)}
                                    >
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
                            {errors.units && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </FormGroup>
                    </div>
                </>
            )
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
                                    <Input {...field} type="select" id="properties"
                                        style={Util.setErrorStyle(errors.properties)}
                                    >
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

    const onChangePayee = async (val) => {
        const pID = addBill.properties || propertyID;
        const getData = await billsAPI.payeeUpdate(pID, val);
        const amt = getData.amount !== null ? parseFloat(getData.amount).toFixed(2) : addBill.debitAmt;
        setValue('debitAmt', amt, { shouldValidate: true });
        setValue('expenseType', getData.expenseTypeID, { shouldValidate: true });
        setValue('lender', getData.lenderID, { shouldValidate: true });
        setValue('payee', val, { shouldValidate: true });
    }

    const submitAddBill = async (data) => {
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
        if(parseInt(data.expenseType) === 18) {
            if(!data.lender || parseInt(data.lender) === 0) {
                NotificationManager.warning("Please select a Lender.", "Warning");
                return;
            }
        }
        const dt = moment.utc(data.invoiceDate);
        if(!dt.isValid()) {
            NotificationManager.warning("Please enter a valid date.", "Warning");
            return;
        }
        const submitData = {
            propertyID: data.properties === undefined ? propertyID : data.properties,
            userID,
            vendorID: parseInt(data.payee),
            expenseTypeID: parseInt(data.expenseType),
            lenderID: data.lender,
            unitID: parseInt(data.units),
            amount: MyFuncs.getFormattedNum(amt),
            invoiceDate: dt,
            invoiceNumber: data.invoiceNumber,
            memo: data.memo,
            escrow: addBill.escrow,
            hasFile: updFile ? true : false
        };

        setSaving(true);
        const res = await billsAPI.addBill(submitData);
        if(isNaN(res) || parseInt(res) <= 0) {
            setSaving(false);
            NotificationManager.error(res, 'Error');
            return;
        }

        // Does it have a receipt?
        if(updFile !== null) {
            await billsAPI.addBillReceipt({
                propertyID,
                checkRegisterID: res,
                file: updFile
            });
        }

        setAddBill({
            ...addBill,
            propertyID
        });
        setSaving(false);
        NotificationManager.success('Bill added successfully.', 'Success!');
    }

    const handleFileChange = (event) => {
        setUpdFile(event.target.files[0]);
    }

    const renderExpenseType = useCallback(() => {
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
    }, []);

    const renderPayeeLabel = useCallback(() => {
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
    }, []);

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Bills</span>
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
                                                    <Input {...field} type="select" id="payee" style={Util.setErrorStyle(errors.payee)}
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
                                            <Label for="expenseType" className="mr-sm-10">{renderExpenseType()}</Label>
                                            <Controller
                                                name="expenseType"
                                                control={control}
                                                defaultValue={addBill.selectedExpenseType}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="expenseType"
                                                        style={Util.setErrorStyle(errors.expenseType)}
                                                    >
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
                                    {renderLenders()}
                                    {renderUnits()}
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
                                                    <Input {...field} type="text" id="debitAmt"
                                                        style={Util.setErrorStyle(errors.debitAmt)}
                                                    />
                                                )}
                                            />
                                            {errors.debitAmt && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="invoiceDate" className="mr-sm-10">Invoice Date</Label>
                                            <Controller
                                                name="invoiceDate"
                                                control={control}
                                                defaultValue={addBill.invoiceDate}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <DatePicker  {...field} id="invoiceDate" style={Util.setErrorStyle(errors.invoiceDate)} />
                                                )}
                                            />
                                            {errors.invoiceDate && (
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
                                    <div className="col-sm-2">
                                        <FormGroup>
                                            <Label for="file">Attach Invoice</Label>
                                            <Input type="file" id="file" onChange={handleFileChange} />
                                            <FormText color="muted">
                                                Attach invoice file
                                            </FormText>
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-1">
                                        <FormGroup check className="mb-20">
                                            <Label for="escrow" className="mr-sm-10">Escrow?</Label>
                                            <Switch name="escrow" checked={addBill.escrow} onChange={() => setAddBill({...addBill, escrow: !addBill.escrow})} aria-label="Escrow" />
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" size="sm" className="w-auto" disabled={saving}>Add Bill</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
            <ListUnpaid multiProp={multiProp} propertyID={propertyID} userID={userID} saving={saving} />
        </Main>
    );
}

export default UnpaidBills;