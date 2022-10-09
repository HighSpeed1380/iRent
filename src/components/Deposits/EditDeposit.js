import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import NumberFormat from 'react-number-format';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as billsAPI from '../../Api/bills';
import * as depositsAPI from '../../Api/deposits';

const EditDepost = (props) => {
    const history = useHistory();
    const tempTransactionID = props.location.state ? props.location.state.depositID : null;
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [ loading, setLoading ] = useState(false);
    const [ depositType, setDepositType ] = useState("");
    const [ tempTransaction, setTempTransaction ] = useState({});
    const [ paymentTypes, setPaymentTypes ] = useState([]);
    const [ lenders, setLenders ] = useState([]);
    const [ prospects, setProspects ] = useState([]);
    const [ formerTenantUnits, setFormerTenantUnits ] = useState([]);
    const [ units, setUnits ] = useState([]);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            if(tempTransactionID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            const transaction = await depositsAPI.getTemp(tempTransactionID);
            const depositSource = await depositsAPI.getDepositSource(parseInt(transaction.DepositSourceID));
            setDepositType(depositSource.DepositSource);
            setTempTransaction(transaction)
            setPaymentTypes(await depositsAPI.getPaymentTypes());
            setUnits(await depositsAPI.getCurrentTenants(parseInt(transaction.PropertyID)));
            setLenders(await billsAPI.getLenders(companyID));
            setProspects(await depositsAPI.getProspects(parseInt(transaction.PropertyID)));
            setFormerTenantUnits(await depositsAPI.getFormerTenants(parseInt(transaction.PropertyID)));

            setValue("transactionComment", transaction.TransactionComment);
            setValue("lenderID", parseInt(transaction.TransactionComment));
            setValue("prospectID", parseInt(transaction.TenantID));
            setValue("unitID", transaction.TenantID);
            setValue("comment", transaction.TransactionComment);
            setValue("otherAmount", parseFloat(transaction.OtherAmount).toFixed(2));
            setValue("tenantAmount", parseFloat(transaction.HousingAmount).toFixed(2));
            setValue("housingAmount", parseFloat(transaction.TenantAmount).toFixed(2));
            setValue("currencyID", parseInt(transaction.PaymentTypeID));
            setValue("memo", transaction.CheckNumber);
            setValue("dateCredit", moment.utc(transaction.TransactionDate).format("YYYY-MM-DD"));

            setLoading(false);
        }
        fetchData();
    }, [tempTransactionID, companyID, setValue, history])

    const submitForm = async (data) => {
        const depositSourceID = parseInt(tempTransaction.DepositSourceID);
        if([3,5,11].includes(depositSourceID) && data.transactionComment === '') {
            NotificationManager.error("Comment is required", "Error");
            return;
        } else if(data.comment !== undefined && data.comment === '') {
            NotificationManager.error("Comment is required", "Error");
            return;
        }
        if(depositSourceID === 6 && parseInt(data.lenderID) === 0) {
            NotificationManager.error("Lender is required.", "Error");
            return;
        }
        if(depositSourceID === 4 && parseInt(data.prospectID) === 0) {
            NotificationManager.error("Prospect is required.", "Error");
            return;
        }
        // default deposit soruce, the unit is required
        const reserved = [3,5,4,6,11];
        if(!reserved.includes(depositSourceID) && parseInt(data.unitID) === 0) {
            NotificationManager.error("Unit is required.", "Error");
            return;
        }
        if(parseInt(data.currencyID) === 0) {
            NotificationManager.error("Currency is required.", "Error");
            return;
        }
        let tenantAmt = 0;
        let housingAmt = 0;
        let otherAmt = 0
        if([3,5,6,11].includes(depositSourceID)) {
            otherAmt = parseFloat(data.otherAmount.toString().replace(/\$|,/g, '')).toFixed(2);
            if(otherAmt < 0) {
                NotificationManager.error("Please enter a valid other amount.", "Error");
                return;
            }
        } else {
            tenantAmt = parseFloat(data.tenantAmount.toString().replace(/\$|,/g, '')).toFixed(2);
            if(tenantAmt < 0) {
                NotificationManager.error("Please enter a valid other amount.", "Error");
                return;
            }
            housingAmt = parseFloat(data.housingAmount.toString().replace(/\$|,/g, '')).toFixed(2);
            if(housingAmt < 0) {
                NotificationManager.error("Please enter a valid other amount.", "Error");
                return;
            }
            otherAmt = parseFloat(data.otherAmount.toString().replace(/\$|,/g, '')).toFixed(2);
            if(otherAmt < 0) {
                NotificationManager.error("Please enter a valid other amount.", "Error");
                return;
            }
        }
        const dtTransaction = moment(data.dateCredit);
        if(!dtTransaction.isValid()) {
            NotificationManager.error("Please enter a valid transaction date.", "Error");
            return;
        }
        setLoading(true);
        const res = await depositsAPI.updateTempTransaction({
            housingAmount: parseFloat(housingAmt).toFixed(2),
            tenantAmount: parseFloat(tenantAmt).toFixed(2),
            otherAmount: parseFloat(otherAmt).toFixed(2),
            tenantID: data.unitID === undefined ? 0 : parseInt(data.unitID),
            transactionDate: dtTransaction,
            paymentTypeID: parseInt(data.currencyID),
            comment: [3,5,11].includes(depositSourceID) ? data.transactionComment : data.comment,
            checkNumber: data.memo,
            id: parseInt(tempTransactionID)
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.");
            return;
        }
        NotificationManager.success("Deposit updated successfully.", "Success");
    }

    const renderAmounts = () => {
        // Non Tenant
        if([3, 5, 6, 11].includes(parseInt(tempTransaction.DepositSourceID))){
            return (
                <div className="col-sm-2">
                    <Label for="otherAmount" className="mr-sm-10">Amount</Label>
                    <Controller
                        name="otherAmount"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <NumberFormat {...field} id="otherAmount" placeholder="100.99" thousandSeparator={true} prefix={"$"} 
                                className="form-control" style={Util.setErrorStyle(errors.otherAmount)} />
                        )}
                    />
                    {errors.otherAmount && (
                        <span style={{ color: "red" }} role="alert">required</span>
                    )}
                </div>
            )
        } else {
            return (
                <>
                <div className="col-sm-2">
                    <Label for="tenantAmount" className="mr-sm-10">Tenant Amount</Label>
                    <Controller
                        name="tenantAmount"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <NumberFormat {...field} id="tenantAmount" placeholder="100.99" thousandSeparator={true} prefix={"$"} 
                                value={parseFloat(tempTransaction.TenantAmount).toFixed(2)}
                                className="form-control" style={Util.setErrorStyle(errors.tenantAmount)} />
                        )}
                    />
                    {errors.tenantAmount && (
                        <span style={{ color: "red" }} role="alert">required</span>
                    )}
                </div>
                <div className="col-sm-2">
                    <Label for="housingAmount" className="mr-sm-10">Housing Amount</Label>
                    <Controller
                        name="housingAmount"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <NumberFormat {...field} id="housingAmount" placeholder="100.99" thousandSeparator={true} prefix={"$"} 
                                value={parseFloat(tempTransaction.HousingAmount).toFixed(2)}
                                className="form-control" style={Util.setErrorStyle(errors.housingAmount)} />
                        )}
                    />
                    {errors.housingAmount && (
                        <span style={{ color: "red" }} role="alert">required</span>
                    )}
                </div>
                <div className="col-sm-2">
                    <Label for="otherAmount" className="mr-sm-10">Amount</Label>
                    <Controller
                        name="otherAmount"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <NumberFormat {...field} id="otherAmount" placeholder="100.99" thousandSeparator={true} prefix={"$"} 
                                value={parseFloat(tempTransaction.OtherAmount).toFixed(2)}
                                className="form-control" style={Util.setErrorStyle(errors.otherAmount)} />
                        )}
                    />
                    {errors.otherAmount && (
                        <span style={{ color: "red" }} role="alert">required</span>
                    )}
                </div>
                </>
            )
        }
    }

    const renderDepositSource = () => {
        switch(parseInt(tempTransaction.DepositSourceID)) {
            case 3:
                return (
                    <div className="col-sm-3">
                        <Label for="transactionComment" className="mr-sm-10">Comment</Label>
                        <Controller
                            name="transactionComment"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="text" id="transactionComment" style={Util.setErrorStyle(errors.transactionComment)} />
                            )}
                        />
                        {errors.transactionComment && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 5:
                return (
                    <div className="col-sm-3">
                        <Label for="transactionComment" className="mr-sm-10">Comment</Label>
                        <Controller
                            name="transactionComment"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="text" id="transactionComment" style={Util.setErrorStyle(errors.transactionComment)} />
                            )}
                        />
                        {errors.transactionComment && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 11:
                return (
                    <div className="col-sm-3">
                        <Label for="transactionComment" className="mr-sm-10">Comment</Label>
                        <Controller
                            name="transactionComment"
                            control={control}
                            value={"Laundry Room"}
                            render={({ field }) => (
                                <Input {...field} value={"Laundry Room"} type="text" id="transactionComment" readOnly />
                            )}
                        />
                    </div>
                );
            case 6:
                return (
                    <div className="col-sm-3">
                        <Label for="lenderID" className="mr-sm-10">Lender</Label>
                        <Controller
                            name="lenderID"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="select" id="lenderID" style={Util.setErrorStyle(errors.lenderID)}
                                    onChange={(e) => setValue("lenderID", e.target.value)}
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
                        {errors.lenderID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="col-sm-3">
                        <Label for="prospectID" className="mr-sm-10">Prospect</Label>
                        <Controller
                            name="prospectID"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="select" id="prospectID" style={Util.setErrorStyle(errors.prospectID)}
                                    onChange={(e) => setValue("prospectID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {prospects.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.TenantID} 
                                                value={obj.TenantID}
                                            >
                                                {obj.Combo}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.prospectID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 7:
                return (
                    <div className="col-sm-3">
                        <Label for="unitID" className="mr-sm-10">Unit</Label>
                        <Controller
                            name="unitID"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="select" id="unitID" style={Util.setErrorStyle(errors.unitID)}
                                    onChange={(e) => setValue("unitID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {formerTenantUnits.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.TenantID} 
                                                value={obj.TenantID}
                                            >
                                                {obj.Combo}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.unitID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="col-sm-3">
                        <Label for="unitID" className="mr-sm-10">Unit</Label>
                        <Controller
                            name="unitID"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="select" id="unitID" style={Util.setErrorStyle(errors.unitID)}
                                    onChange={(e) => setValue("unitID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {units.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.TenantID} 
                                                value={obj.TenantID}
                                            >
                                                {obj.Combo}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.unitID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
        }
    }

    const renderComment = () => {
        if(![3,5,11].includes(parseInt(tempTransaction.DepositSourceID))) {
            return (
                <div className="col-sm-3">
                    <Label for="comment" className="mr-sm-10">Comment</Label>
                    <Controller
                        name="comment"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} type="text" name="comment" placeholder="12345" />
                        )}
                    />
                </div>
            )
        }
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Deposit..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const title = `Deposit Type ${depositType}`;
        
    return (
        <>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                    <h2>
                        <span>Deposit</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading={title}>
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                {renderAmounts()}
                                <div className="col-sm-3">
                                    <Label for="currencyID" className="mr-sm-10">Currency</Label>
                                    <Controller
                                        name="currencyID"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="currencyID" style={Util.setErrorStyle(errors.currencyID)}>
                                                <option value="0">Select</option>
                                                {paymentTypes.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.PaymentTypeID} 
                                                            value={obj.PaymentTypeID}
                                                        >
                                                            {obj.PaymentType}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.currencyID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                {renderDepositSource()}
                                <div className="col-sm-3">
                                    <Label for="memo" className="mr-sm-10">Memo</Label>
                                    <Controller
                                        name="memo"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" name="memo" placeholder="12345" />
                                        )}
                                    />
                                </div>
                                {renderComment()}
                                <div className="col-sm-2">
                                    <Label for="dateCredit" className="mr-sm-10">Date of Credit</Label>
                                    <Controller
                                        name="dateCredit"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="dateCredit" style={Util.setErrorStyle(errors.dateCredit)} />
                                        )}
                                    />
                                    {errors.dateCredit && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Update Deposit</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            <NotificationContainer />
        </>
    )
}

export default EditDepost;