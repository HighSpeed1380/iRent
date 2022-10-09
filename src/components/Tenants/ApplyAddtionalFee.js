import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { Button, Form, Label, Input } from 'reactstrap';
import NumberFormat from 'react-number-format';
import Select from 'react-select';
import { Switch } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as billsAPI from '../../Api/bills';
import * as Util from '../Util/util';
import * as MyFuncs from '../Util/myFunctions';

const addFeeStyles = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const ApplyAddtionalFee = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const admin = user.securityLevel;

    const [ loading, setLoading ] = useState(true);
    const [ properties, setProperties ] = useState([]);
    const [ tenants, setTenants ] = useState([]);
    const [ descriptions, setDescriptions ] = useState([]);
    const [ selectAllTenants, setSelectAllTenants ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setProperties(await billsAPI.getProperties(userID));
            const tenants = await tenantAPI.getTenants({
                multiprop: false,
                userID,
                propertyID,
                companyID
            });
            let arr= [];
            for(const t of tenants) {
                arr.push({
                    value: t.TenantID,
                    label: `${t.TenantFName} ${t.TenantLName} - Unit: ${t.UnitName}`
                });
            }
            setTenants(arr);
            setDescriptions(await tenantAPI.getChargeTypes());
            setLoading(false);
        }
        fetchData();
    }, [propertyID, userID, companyID]);

    const submitForm = async (data) => {
        if(parseInt(data.propertyID) === 0) {
            NotificationManager.warning("Please select a property.", "Warning");
            return;
        }
        if(data.tenantID.length === 0) {
            NotificationManager.warning("Please select at least one tenant.", "Warning!");
            return;
        }
        const dtCharge = moment(data.chargeDate);
        if(!dtCharge.isValid()) {   
            NotificationManager.warning("Please enter a valid charge date.", "Warning");
            return;
        }
        if(parseInt(data.description) === 0) {
            NotificationManager.warning("Please select a description.", "Warning");
            return;
        }

        const amount = parseFloat(data.amount.substring(1, data.amount.length).replace(/,/g, ''));
        if(amount === 0) {
            NotificationManager.warning("Please enter a valid amount.", "Warning");
            return;
        }
            
        let tenantsArr = [];
        data.tenantID.map((element) => tenantsArr.push({tenantID: element.value}));
        // Add the Fee
        const res = await tenantAPI.applyAdditionalCharges({
            chargeTypeID: parseInt(data.description),
            tenants: tenantsArr,
            transactionType: 1,
            amount: MyFuncs.getFormattedNum(data.amount),
            comment: data.comment,
            userID,
            depositSourceID: 1,
            propertyID: parseInt(data.propertyID),
            admin,
            transactionDate: dtCharge
        });

        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error!");
            return;
        }
        NotificationManager.success("Additional Fee applied sucessfully.", "Success!")
    }

    const handleChangeProperty = async (id) => {
        const tenants = await tenantAPI.getTenants({
            multiprop: false,
            userID,
            propertyID: parseInt(id),
            companyID
        });
        let arr= [];
        for(const t of tenants) {
            arr.push({
                value: t.TenantID,
                label: `${t.TenantFName} ${t.TenantLName} - Unit: ${t.UnitName}`
            });
        }
        setTenants(arr);
        setValue("propertyID", id);
        setValue("tenantID", []);
    }

    const handleSelectAllTenants = () => {
        if(selectAllTenants)
            setValue("tenantID", []);
        else
            setValue("tenantID", tenants)
        setSelectAllTenants(!selectAllTenants)
    }

    const handleSelectTenant = (selected) => {
        setValue("tenantID", selected);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Apply Additional Fee..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <Main>
                    <div style={addFeeStyles}>
                    <div className="page-title d-flex justify-content-between align-items-center">
                        <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.push('/tenants/viewAll')}></i>
                            <h2>
                                <span>Apply Additional Fee</span>
                            </h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard>
                                <Form onSubmit={handleSubmit(submitForm)}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <Label for="propertyID" className="mr-sm-10">Property</Label>
                                            <Controller
                                                name="propertyID"
                                                control={control}
                                                defaultValue={propertyID}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="propertyID" onChange={(e) => handleChangeProperty(e.target.value)}
                                                        style={Util.setErrorStyle(errors.propertyID)} 
                                                    >
                                                        <option value="0">Select</option>
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
                                            {errors.propertyID && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-6">
                                            <Label for="tenantID" className="mr-sm-10">Tenant</Label>
                                            <Controller
                                                name="tenantID"
                                                control={control}
                                                defaultValue={[]}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        isMulti
                                                        name="colors"
                                                        options={tenants}
                                                        className="basic-multi-select form-control"
                                                        classNamePrefix="select"
                                                        onChange={handleSelectTenant}
                                                        style={Util.setErrorStyle(errors.tenantID)}
                                                    />
                                                )}
                                            />
                                            {errors.tenantID && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="selectAll" className="mr-sm-10">Select all Tenants</Label>
                                            <Switch name="selectAll" checked={selectAllTenants} onChange={() => handleSelectAllTenants()} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="description" className="mr-sm-10">Description</Label>
                                            <Controller
                                                name="description"
                                                control={control}
                                                defaultValue={0}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="description" style={Util.setErrorStyle(errors.description)}>
                                                        <option value="0">Select</option>
                                                        {descriptions.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.ChargeTypeID} 
                                                                    value={obj.ChargeTypeID}
                                                                >
                                                                    {obj.ChargeType}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                            {errors.description && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="chargeDate" className="mr-sm-10">Charge Date</Label>
                                            <Controller
                                                name="chargeDate"
                                                control={control}
                                                defaultValue={moment().format("YYYY-MM-DD")}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="chargeDate" style={Util.setErrorStyle(errors.chargeDate)} />
                                                )}
                                            />
                                            {errors.chargeDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="amount" className="mr-sm-10">Amount</Label>
                                            <Controller
                                                name="amount"
                                                control={control}
                                                defaultValue={0}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="amount" style={Util.setErrorStyle(errors.amount)} 
                                                        thousandSeparator={true} prefix={"$"} className="form-control"
                                                    />
                                                )}
                                            />
                                            {errors.amount && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Label for="comment" className="mr-sm-10">Comment</Label>
                                            <Controller
                                                name="comment"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="textarea" name="comment" rows={3} />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" style={{marginTop: '10px'}}>Apply Charge</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                    </div>
                </Main>
            )
        }
    }

    return render();
}

export default ApplyAddtionalFee;