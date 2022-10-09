import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as billsAPI from '../../Api/bills';
import * as Util from '../Util/util';
import * as MyFuncs from '../Util/myFunctions';

function TransferTenant(props) {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;

    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const tenantName = props.location.state ? props.location.state.tenantName : null;
    const unit = props.location.state ? props.location.state.unitName : null;

    const [ loading, setLoading ] = useState(true);
    const [ properties, setProperties ] = useState([]);
    const [ units, setUnits ] = useState([]);
    //const [ transferTo, setTransferTo ] = useState(moment().format("YYYY-MM-DD"));
    const transferTo = moment().format("YYYY-MM-DD");
    const [ dob, setDOB ] = useState(moment().format("YYYY-MM-DD"));
    const [ leaseStartDate, setLeaseStartDate ] = useState(moment().format("YYYY-MM-DD"));
    const [ leaseEndDate, setLeaseEndDate ] = useState(moment().format("YYYY-MM-DD"));
    const [ moveInDate, setMoveInDate ] = useState(moment().format("YYYY-MM-DD"));
    const [ moveOutDate, setMoveOutDate ] = useState(moment().format("YYYY-MM-DD"));
    const [ selectedProperty, setSelectedProperty ] = useState(propertyID);
    const [ tenant, setTenant ] = useState({});
    const [ previousUnitID, setPreviousUnitID ] = useState(0);
    
    const { handleSubmit, control, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/tenants/viewAll');
            }
            setProperties(await billsAPI.getProperties(userID));
            setUnits(await tenantAPI.getVacantUnitsByProperty(propertyID));
            const tenant = await tenantAPI.getTenant(tenantID);
            const background = await tenantAPI.getTenantBackground(tenantID);
            setTenant(tenant);
            setPreviousUnitID(parseInt(tenant.UnitID));

            if(background && background.DOB && background.DOB !== '')
                setDOB(moment(background.DOB).format("YYYY-MM-DD"));

            if(tenant.LeaseStartDate && tenant.LeaseStartDate !== '')   
                setLeaseStartDate(moment(tenant.LeaseStartDate).format("YYYY-MM-DD"));

            if(tenant.LeaseEndDate && tenant.LeaseEndDate !== '')   
                setLeaseEndDate(moment(tenant.LeaseEndDate).format("YYYY-MM-DD"));

            if(tenant.MoveInDate && tenant.MoveInDate !== '')   
                setMoveInDate(moment(tenant.MoveInDate).format("YYYY-MM-DD"));

            if(tenant.MoveOutDate && tenant.MoveOutDate !== '')   
                setMoveOutDate(moment(tenant.MoveOutDate).format("YYYY-MM-DD"));

            setLoading(false);
        }
        fetchData();
    }, [tenantID, userID, propertyID, history]);

    const returnToTenant = () => {
        const location = {
            pathname: '/tenants/details',
            state: { tenantID }
        }
        history.push(location);
    }

    const submitForm = async (data) => {
        if(parseInt(data.propertyID) === 0) {
            NotificationManager.warning("Property is required.", "Warning");
            return;
        }
        if(parseInt(data.unitID) === 0) {
            NotificationManager.warning("Transfer to unit is required.", "Warning");
            return;
        }
        const transferDt = moment(data.transferTo);
        if(!transferDt.isValid()) {   
            NotificationManager.warning("Please enter a valid Transfer Date.", "Warning");
            return;
        }
        const dobDt = moment(data.dob);
        if(!dobDt.isValid()) {   
            NotificationManager.warning("Please enter a valid DOB Date.", "Warning");
            return;
        }
        const leaseStartDt = moment(data.leaseStartDate);
        if(!leaseStartDt.isValid()) {   
            NotificationManager.warning("Please enter a valid Lease Start Date.", "Warning");
            return;
        }
        const leaseEndDt = moment(data.leaseEndDate);
        if(!leaseEndDt.isValid()) {   
            NotificationManager.warning("Please enter a valid Lease End Date.", "Warning");
            return;
        }
        const moveInDt = moment(data.moveInDate);
        if(!moveInDt.isValid()) {   
            NotificationManager.warning("Please enter a valid Move In Date.", "Warning");
            return;
        }
        const moveOutDt = moment(data.moveOutDate);
        if(!moveOutDt.isValid()) {   
            NotificationManager.warning("Please enter a valid Move Out Date.", "Warning");
            return;
        }   
            
        setLoading(true);
        const res = await tenantAPI.transfer({
            tenantID,
            DOB: dobDt,
            unitID: parseInt(data.unitID),
            firstName: data.firstName,
            lastName: data.lastName,
            onLease: data.othersOnLease,
            phone: data.phone,
            email: data.email,
            rentalAmount: MyFuncs.getFormattedNum(data.rentalAmount),
            housingAmount: MyFuncs.getFormattedNum(data.housingAmount),
            petRent: MyFuncs.getFormattedNum(data.petRent),
            tvCharge: MyFuncs.getFormattedNum(data.tvCharge),
            utilityCharge: MyFuncs.getFormattedNum(data.utilityCharge),
            parkingCharge: MyFuncs.getFormattedNum(data.parkingCharge),
            storageCharge: MyFuncs.getFormattedNum(data.storageCharge),
            securityDeposit: MyFuncs.getFormattedNum(data.securityDeposit),
            comment: data.tenantComments,
            ssn: data.ssn,
            leaseStartDate: leaseStartDt,
            moveInDate: moveInDt,
            leaseEndDate: leaseEndDt,
            moveOutDate: moveOutDt,
            propertyID: parseInt(data.propertyID),
            oneTimeCharge: MyFuncs.getFormattedNum(data.oneTimeCharge),
            userID: userID,
            previousUnitID: previousUnitID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request.", "Error");
            return;
        }
        // return to tenant list page
        returnToTenant();
    }

    const handleChangeProperty = async (id) => {
        setLoading(true);
        const units = await tenantAPI.getVacantUnitsByProperty(parseInt(id));
        setUnits(units);
        setSelectedProperty(parseInt(id));
        setLoading(false);
        if(units.length === 0) 
            NotificationManager.warning("Property does not have a vacant unit.", "warning");
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Transfer Tenant..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const heading = `Transfer Tenant - ${tenantName} - ${unit}`;
                
            return (
                <Main>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={heading}>
                                <Form onSubmit={handleSubmit(submitForm)}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <Label for="propertyID" className="mr-sm-10">Property</Label>
                                            <Controller
                                                name="propertyID"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={selectedProperty}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="propertyID" style={Util.setErrorStyle(errors.propertyID)}
                                                        onChange={(e) => handleChangeProperty(e.target.value)}
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
                                        <div className="col-sm-4">
                                            <Label for="unitID" className="mr-sm-10">Transfer To</Label>
                                            <Controller
                                                name="unitID"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="unitID" style={Util.setErrorStyle(errors.unitID)}>
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
                                            {errors.unitID && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="transferDate" className="mr-sm-10">Transfer Date</Label>
                                            <Controller
                                                name="transferDate"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={transferTo}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="transferDate" style={Util.setErrorStyle(errors.transferDate)} />
                                                )}
                                            />
                                            {errors.transferDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <Label for="firstName" className="mr-sm-10">Prospect First Name</Label>
                                            <Controller
                                                name="firstName"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={tenant.TenantFName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="firstName" style={Util.setErrorStyle(errors.firstName)} />
                                                )}
                                            />
                                            {errors.firstName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="middleName" className="mr-sm-10">Prospect Middle Name</Label>
                                            <Controller
                                                name="middleName"
                                                control={control}
                                                defaultValue={tenant.TenantMName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="middleName" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="lastName" className="mr-sm-10">Prospect Last Name</Label>
                                            <Controller
                                                name="lastName"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={tenant.TenantLName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="lastName" style={Util.setErrorStyle(errors.lastName)} />
                                                )}
                                            />
                                            {errors.lastName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="oneTimeCharge" className="mr-sm-10">One Time Charge</Label>
                                            <Controller
                                                name="oneTimeCharge"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="oneTimeCharge" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-10">
                                            <Label for="othersOnLease" className="mr-sm-10">Others On Lease</Label>
                                            <Controller
                                                name="othersOnLease"
                                                control={control}
                                                defaultValue={tenant.OnLease}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="othersOnLease" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="phone" className="mr-sm-3">Phone</Label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="phone" format="+1 (###) ###-####" mask="_" className="form-control" 
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="email" className="mr-sm-10">Email</Label>
                                            <Controller
                                                name="email"
                                                control={control}
                                                defaultValue={tenant.TenantEmail}
                                                render={({ field }) => (
                                                    <Input {...field} type="email" id="email" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="rentalAmount" className="mr-sm-10">Rental Amount</Label>
                                            <Controller
                                                name="rentalAmount"
                                                control={control}
                                                defaultValue={tenant.RentalAmount}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="rentalAmount" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="housingAmount" className="mr-sm-10">Housing Amount</Label>
                                            <Controller
                                                name="housingAmount"
                                                control={control}
                                                defaultValue={tenant.HousingAmount}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="housingAmount" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="petRent" className="mr-sm-10">Pet Rent</Label>
                                            <Controller
                                                name="petRent"
                                                control={control}
                                                defaultValue={tenant.PetRent}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="petRent" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="tvCharge" className="mr-sm-10">TV Charge</Label>
                                            <Controller
                                                name="tvCharge"
                                                control={control}
                                                defaultValue={tenant.TVCharge}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="tvCharge" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="utilityCharge" className="mr-sm-10">Utility Charge</Label>
                                            <Controller
                                                name="utilityCharge"
                                                control={control}
                                                defaultValue={tenant.UtilityCharge}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="utilityCharge" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="parkingCharge" className="mr-sm-10">Parking Charge</Label>
                                            <Controller
                                                name="parkingCharge"
                                                control={control}
                                                defaultValue={tenant.ParkingCharge}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="parkingCharge" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="storageCharge" className="mr-sm-10">Storage Charge</Label>
                                            <Controller
                                                name="storageCharge"
                                                control={control}
                                                defaultValue={tenant.StorageCharge}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="storageCharge" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="securityDeposit" className="mr-sm-10">Security Deposit</Label>
                                            <Controller
                                                name="securityDeposit"
                                                control={control}
                                                defaultValue={tenant.SecurityDeposit}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="securityDeposit" thousandSeparator={true} prefix={'$'} className="form-control" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="ssn" className="mr-sm-10">SSN</Label>
                                            <Controller
                                                name="ssn"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={tenant.SSN}
                                                render={({ field }) => (
                                                    <Input {...field} type="number" id="ssn" style={Util.setErrorStyle(errors.ssn)} />
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
                                                defaultValue={dob}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="dob" style={Util.setErrorStyle(errors.dob)} />
                                                )}
                                            />
                                            {errors.dob && (
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
                                                defaultValue={leaseStartDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="leaseStartDate" style={Util.setErrorStyle(errors.leaseStartDate)} />
                                                )}
                                            />
                                            {errors.leaseStartDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="leaseEndDate" className="mr-sm-10">DOB</Label>
                                            <Controller
                                                name="leaseEndDate"
                                                control={control}
                                                rules={{ required: true }}
                                                defaultValue={leaseEndDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="leaseEndDate" style={Util.setErrorStyle(errors.leaseEndDate)} />
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
                                                defaultValue={moveInDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="moveInDate" style={Util.setErrorStyle(errors.moveInDate)} />
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
                                                defaultValue={moveOutDate}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="moveOutDate" style={Util.setErrorStyle(errors.moveOutDate)} />
                                                )}
                                            />
                                            {errors.moveOutDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Label for="tenantComments" className="mr-sm-10">Tenant Comments</Label>
                                            <Controller
                                                name="tenantComments"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="textarea" id="tenantComments" rows={5} />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '10px'}}>
                                        Transfer Tenant
                                    </Button>
                                    {' '}
                                    <Button type="button" color="warning" size="sm" className="w-auto" style={{marginTop: '10px'}}
                                        onClick={returnToTenant}
                                    >
                                        Return to {tenantName}
                                    </Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                </Main>
            )
        }
    }

    return render();
}

export default TransferTenant; 