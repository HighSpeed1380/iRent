import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input, Alert } from 'reactstrap';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Util from '../Util/util';
import * as MyFuncs from '../Util/myFunctions';

const addTenantStyle = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const AddTenant = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;

    const [ updated, setUpdated ] = useState(false);
    const [ loading, setLoading ] = useState(true);
    const [ vacantUnits, setVacantUnits ] = useState([]);
    const [ addTenant, setAddTenant ] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        ssn: '',
        dob: '',
        email: '',
        phone: '',
        unitID: 0,
        driversLicense: '',
        dlState: 0,
        leaseStartDate: '',
        leaseEndDate: '',
        moveInDate: '',
        moveOutDate: '',
        refundableSecurityDeposit: 0,
        nonRefundableFee: 0,
        lastMonthRent: 0,
        proRatedRent: 0,
        admin: 0,
        application: 0,
        reservationFee: 0,
        petDeposit: 0,
        recTenantRent: 0,
        recHousingRent: 0,
        recPetRent: 0,
        recTVRent: 0,
        recUtilityRent: 0,
        recParkingRent: 0,
        recStorageRent: 0,
        recHOAFee: 0
    });

    const { handleSubmit, control, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const vacant = await tenantAPI.getVacantUnitsByProperty(propertyID);
            setVacantUnits(vacant);
            setLoading(false);
            if(vacant.length === 0) {
                NotificationManager.warning("You do not have a vacant unit. Add an unit before adding a tenant.", "Warning");
            }
        }
        fetchData();
    }, [propertyID]);

    const handleUnitChange = async (id) => {
        const unitCharges = await tenantAPI.getUnitCharges(parseInt(id));
        if(unitCharges !== null) {
            setAddTenant({
                ...addTenant,
                unitID: id,
                admin: parseFloat(unitCharges.AdminFee.toString().replace(/,/g, '')).toFixed(2),
                recTenantRent: parseFloat(unitCharges.UnitCharge.toString().replace(/,/g, '')).toFixed(2)
            });
            setUpdated(!updated);
        } else
            setAddTenant({...addTenant, unitID: id});
    }

    const submitForm = async (data) => {
        // validations and insert
        if(parseInt(data.unit) === 0) {
            NotificationManager.warning("Please select a unit.", "Warning!");
            return;
        }

        const dtDOB = moment(data.dob);
        if(!dtDOB.isValid()) {   
            NotificationManager.warning("Please enter a valid DOB.", "Warning");
            return;
        }
        const dtLeaseStart = moment(data.leaseStartDate);
        if(!dtLeaseStart.isValid()) {   
            NotificationManager.warning("Please enter a valid Lease Start Date.", "Warning");
            return;
        }
        const dtLeaseEnd = moment(data.leaseEndDate);
        if(!dtLeaseEnd.isValid()) {   
            NotificationManager.warning("Please enter a valid Lease End Date.", "Warning");
            return;
        }
        const dtMoveIn = moment(data.moveInDate);
        if(!dtMoveIn.isValid()) {   
            NotificationManager.warning("Please enter a valid Move In Date.", "Warning");
            return;
        }const dtMoveOut = moment(data.moveOutDate);
        if(!dtMoveOut.isValid()) {   
            NotificationManager.warning("Please enter a valid Move Out Date.", "Warning");
            return;
        }

        const res = await tenantAPI.addTenant({
            unitID: parseInt(data.unit),
            firstName: data.fname,
            middleName: data.mName,
            lastName: data.lName,
            phone: data.phone,
            email: data.email,
            ssn: data.ssn,
            leaseStart: dtLeaseStart,
            userID,
            propertyID,
            leaseEnd: dtLeaseEnd,
            moveIn: dtMoveIn,
            moveOut: dtMoveOut,
            rentalAmount: MyFuncs.getFormattedNum(data.recTenantRent),
            housingAmount: MyFuncs.getFormattedNum(data.recHousingRent),
            secDeposit: MyFuncs.getFormattedNum(data.refundSecDeposit),
            petRent: MyFuncs.getFormattedNum(data.recPetRent),
            TVCharge: MyFuncs.getFormattedNum(data.recTV),
            utilityCharge: MyFuncs.getFormattedNum(data.recUtility),
            storageCharge: MyFuncs.getFormattedNum(data.recStorage),
            parkingCharge: MyFuncs.getFormattedNum(data.recParking),
            HOAFee: MyFuncs.getFormattedNum(data.recHOAFee),
            nonRefDeposit: MyFuncs.getFormattedNum(data.nonRefFee),
            lastMonthRent: MyFuncs.getFormattedNum(data.lastMonthRent),
            proRated: MyFuncs.getFormattedNum(data.proRatedRent),
            admin: MyFuncs.getFormattedNum(data.admin),
            application: MyFuncs.getFormattedNum(data.application),
            reservationFee: MyFuncs.getFormattedNum(data.reservationFee),
            petDeposit: MyFuncs.getFormattedNum(data.petDeposit),
            dob: dtDOB
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        props.goToMenu("list");
    }    

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Add Vehicles..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <Main>
                    <div style={addTenantStyle}>
                    <div className="page-title d-flex justify-content-between align-items-center">
                        <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} 
                            onClick={() => history.push('/tenants/viewAll')}
                        ></i>
                            <h2>
                                <span>Add Tenant</span>
                            </h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard>
                                <Form onSubmit={handleSubmit(submitForm)}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <Label for="fName" className="mr-sm-10">First Name</Label>
                                            <Controller
                                                name="fname"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.firstName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="fname" style={Util.setErrorStyle(errors.fname)} />
                                                )}
                                            />
                                            {errors.fname && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="mName" className="mr-sm-10">Middle Name</Label>
                                            <Controller
                                                name="mName"
                                                control={control}
                                                defaultValue={addTenant.middleName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="fname" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="lName" className="mr-sm-10">Last Name</Label>
                                            <Controller
                                                name="lName"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.lastName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="lName" style={Util.setErrorStyle(errors.lName)} />
                                                )}
                                            />
                                            {errors.lName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="ssn" className="mr-sm-10">SSN</Label>
                                            <Controller
                                                name="ssn"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.ssn}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="ssn" style={Util.setErrorStyle(errors.ssn)} />
                                                )}
                                            />
                                            {errors.ssn && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="dob" className="mr-sm-10">DOB</Label>
                                            <Controller
                                                name="dob"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.dob}
                                                render={({ field }) => (
                                                    <DatePicker {...field}  id="dob" style={Util.setErrorStyle(errors.dob)} />
                                                )}
                                            />
                                            {errors.dob && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-7">
                                            <Label for="email" className="mr-sm-10">Email</Label>
                                            <Controller
                                                name="email"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.email}
                                                render={({ field }) => (
                                                    <Input {...field} type="email" id="email" style={Util.setErrorStyle(errors.email)} />
                                                )}
                                            />
                                            {errors.email && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="phone" className="mr-sm-10">Phone</Label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                defaultValue={addTenant.phone}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="phone" format="+1 (###) ###-####" mask="_" className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="unit" className="mr-sm-10">Unit</Label>
                                            <Controller
                                                name="unit"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.unitID}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="unit" style={Util.setErrorStyle(errors.unit)}
                                                        onChange={(e) => handleUnitChange(e.target.value)}
                                                    >
                                                        <option value="0">Select</option>
                                                        {vacantUnits.map((obj) => {
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
                                            {errors.unit && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="leaseStartDate" className="mr-sm-10">Lease Start Date</Label>
                                            <Controller
                                                name="leaseStartDate"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.leaseStartDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field}  id="leaseStartDate" style={Util.setErrorStyle(errors.leaseStartDate)} />
                                                )}
                                            />
                                            {errors.leaseStartDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="leaseEndDate" className="mr-sm-10">Lease End Date</Label>
                                            <Controller
                                                name="leaseEndDate"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.leaseEndDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field}  id="leaseEndDate" style={Util.setErrorStyle(errors.leaseEndDate)} />
                                                )}
                                            />
                                            {errors.leaseEndDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="moveInDate" className="mr-sm-10">Move In Date</Label>
                                            <Controller
                                                name="moveInDate"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.moveInDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field}  id="moveInDate" style={Util.setErrorStyle(errors.moveInDate)} />
                                                )}
                                            />
                                            {errors.moveInDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="moveOutDate" className="mr-sm-10">Move Out Date</Label>
                                            <Controller
                                                name="moveOutDate"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.moveOutDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field}  id="moveOutDate" style={Util.setErrorStyle(errors.moveOutDate)} />
                                                )}
                                            />
                                            {errors.moveOutDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <Alert color="info" style={{marginTop: '15px'}}>One Time Fees</Alert>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="refundSecDeposit" className="mr-sm-10">Refundable Security Deposit</Label>
                                            <Controller
                                                name="refundSecDeposit"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.refundableSecurityDeposit}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="refundSecDeposit" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.refundSecDeposit)} className="form-control" />
                                                )}
                                            />
                                            {errors.refundSecDeposit && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="nonRefFee" className="mr-sm-10">Non Refundable Fee</Label>
                                            <Controller
                                                name="nonRefFee"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.nonRefundableFee}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="nonRefFee" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.nonRefundableFee)} className="form-control" />
                                                )}
                                            />
                                            {errors.nonRefFee && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="lastMonthRent" className="mr-sm-10">Last Month's Rent</Label>
                                            <Controller
                                                name="lastMonthRent"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.lastMonthRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="lastMonthRent" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.lastMonthRent)} className="form-control" />
                                                )}
                                            />
                                            {errors.lastMonthRent && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="proRatedRent" className="mr-sm-10">Pro Rated Rent</Label>
                                            <Controller
                                                name="proRatedRent"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.proRatedRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="proRatedRent" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.proRatedRent)} className="form-control" />
                                                )}
                                            />
                                            {errors.proRatedRent && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="admin" className="mr-sm-10">Admin</Label>
                                            <Controller
                                                name="admin"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.admin}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="admin" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.admin)} className="form-control" />
                                                )}
                                            />
                                            {errors.admin && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="application" className="mr-sm-10">Application</Label>
                                            <Controller
                                                name="application"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.application}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="application" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.application)} className="form-control" />
                                                )}
                                            />
                                            {errors.application && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="reservationFee" className="mr-sm-10">Reservation Fee</Label>
                                            <Controller
                                                name="reservationFee"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.reservationFee}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="reservationFee" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.reservationFee)} className="form-control" />
                                                )}
                                            />
                                            {errors.reservationFee && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="petDeposit" className="mr-sm-10">Pet Deposit</Label>
                                            <Controller
                                                name="petDeposit"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.petDeposit}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="petDeposit" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.petDeposit)} className="form-control" />
                                                )}
                                            />
                                            {errors.petDeposit && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <Alert color="info" style={{marginTop: '15px'}}>Recurring Rental Amounts</Alert>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="recTenantRent" className="mr-sm-10">Tenant Rent</Label>
                                            <Controller
                                                name="recTenantRent"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recTenantRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recTenantRent" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recTenantRent)} className="form-control" />
                                                )}
                                            />
                                            {errors.recTenantRent && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recHousingRent" className="mr-sm-10">Housing Rent</Label>
                                            <Controller
                                                name="recHousingRent"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recHousingRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recHousingRent" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recHousingRent)} className="form-control" />
                                                )}
                                            />
                                            {errors.recHousingRent && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recPetRent" className="mr-sm-10">Pet Rent</Label>
                                            <Controller
                                                name="recPetRent"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.petDeposit}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recPetRent" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recPetRent)} className="form-control" />
                                                )}
                                            />
                                            {errors.recPetRent && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recTV" className="mr-sm-10">TV</Label>
                                            <Controller
                                                name="recTV"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recTVRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recTV" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recTV)} className="form-control" />
                                                )}
                                            />
                                            {errors.recTV && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recUtility" className="mr-sm-10">Utility</Label>
                                            <Controller
                                                name="recUtility"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recUtilityRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recUtility" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recUtility)} className="form-control" />
                                                )}
                                            />
                                            {errors.recUtility && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recParking" className="mr-sm-10">Parking</Label>
                                            <Controller
                                                name="recParking"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recParkingRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recParking" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recParking)} className="form-control" />
                                                )}
                                            />
                                            {errors.recParking && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="recStorage" className="mr-sm-10">Storage</Label>
                                            <Controller
                                                name="recStorage"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recStorageRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recStorage" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recStorage)} className="form-control" />
                                                )}
                                            />
                                            {errors.recStorage && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recHOAFee" className="mr-sm-10">HOA Fee</Label>
                                            <Controller
                                                name="recHOAFee"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={addTenant.recHOAFee}
                                                render={({ field }) => (
                                                    <NumberFormat {...field}  id="recHOAFee" thousandSeparator={true} prefix={"$"}
                                                        style={Util.setErrorStyle(errors.recHOAFee)} className="form-control" />
                                                )}
                                            />
                                            {errors.recHOAFee && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add Tenant</Button>
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

export default AddTenant;