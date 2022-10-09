import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import moment from 'moment';
import DatePicker from "reactstrap-date-picker";
import NumberFormat from 'react-number-format';
import { Switch } from '@material-ui/core';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import * as Util from '../Util/util';
import * as MyFuncs from '../Util/myFunctions';
import AddVehicle from './AddVehicle';
import Documents from './Documents';

const EditTenant = (props) => {
    const history = useHistory();

    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const tenantName = props.location.state ? props.location.state.tenantName : null;

    const [ loading, setLoading ] = useState(true);
    const [ propertyID, setPropertyID ] = useState(0);
    const [ tenant, setTenant ] = useState({
        firstName: '',
        lastName: '',
        ssn: '',
        dob: moment().format("YYYY-MM-DD"),
        email: '',
        phone: '',
        dl: '',
        dlState: '',
        othersLease: '',
        comments: ''
    });
    const [ recurringConcession, setRecurringConcession ] = useState({
        amount: 0,
        reason: ''
    });
    const [ recurringCharges, setRecurringCharges ] = useState({
        tenant: 0,
        housing: 0,
        pet: 0,
        tv: 0,
        utility: 0,
        parking: 0,
        storage: 0,
        security: 0,
        HOAFee: 0,
        garage: 0,
        CAM: 0,
        monthToMonth: 0,
        additionalTenants: 0,
        RV: 0,
        trash: 0,
        sewer: 0,
        taxesFee: 0,
        insuranceFee: 0
    });
    const [ leaseDates, setLeaseDates ] = useState({
        leaseStartDate: moment().format("YYYY-MM-DD"),
        moveInDate: moment().format("YYYY-MM-DD"),
        leaseEndDate: moment().format("YYYY-MM-DD"),
        moveoutDate: moment().format("YYYY-MM-DD"),
        noticeGiven: false,
        monthToMonth: false
    });
    const [ futureLeaseChanges, setFutureLeaseChanges ] = useState({
        effectiveDate: moment().format("YYYY-MM-DD"),
        utilityCharge: 0,
        rentalAmount: 0,
        housingAmount: 0
    });
    const {  
        handleSubmit: handleSubmitTenant,  
        control: controlTenant,
        formState: { errors: errorsTenant }
    } = useForm();
    const { 
        handleSubmit: handleSubmitRecurringCharges, 
        control: controlRecurringCharges,
        formState: { errors: errorsRecurringCharges } 
    } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/tenants/viewAll');
            }
            const tenant = await tenantAPI.getTenant(tenantID);
            const background = await tenantAPI.getTenantBackground(tenantID);
            const futureLeaseChanges = await tenantAPI.getFutureLeaseChange(tenantID);
            setPropertyID(parseInt(tenant.PropertyID));
            setTenant({
                firstName: tenant.TenantFName,
                lastName: tenant.TenantLName,
                ssn: tenant.SSN,
                dob: background && background.DOB ? moment(background.DOB).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
                email: tenant.TenantEmail,
                phone: tenant.TenantPhone,
                dl: background ? background.DriversLicense : '',
                dlState: background ? background.DLState : '',
                othersLease: tenant.OnLease,
                comments: tenant.ProspectComments
            });
            setRecurringCharges({
                tenant: parseFloat(tenant.RentalAmount).toFixed(2),
                housing: parseFloat(tenant.HousingAmount).toFixed(2),
                pet: parseFloat(tenant.PetRent).toFixed(2),
                tv: parseFloat(tenant.TVCharge).toFixed(2),
                utility: parseFloat(tenant.UtilityCharge).toFixed(2),
                parking: parseFloat(tenant.ParkingCharge).toFixed(2),
                storage: parseFloat(tenant.StorageCharge).toFixed(2),
                security: parseFloat(tenant.SecurityDeposit).toFixed(2),
                HOAFee: parseFloat(tenant.HOAFee).toFixed(2),
                garage: parseFloat(tenant.GarageAmount).toFixed(2),
                CAM: parseFloat(tenant.CAM).toFixed(2),
                monthToMonth: parseFloat(tenant.MonthToMonth).toFixed(2),
                additionalTenants: parseFloat(tenant.AdditionalTenantsCharge).toFixed(2),
                RV: parseFloat(tenant.RVCharge).toFixed(2),
                trash: parseFloat(tenant.TrashCharge).toFixed(2),
                sewer: parseFloat(tenant.SewerCharge).toFixed(2),
                taxesFee: parseFloat(tenant.TaxesFee).toFixed(2),
                insuranceFee: parseFloat(tenant.InsuranceFee).toFixed(2)
            });
            setRecurringConcession({
                amount: parseFloat(tenant.ConcessionAmount).toFixed(2),
                reason: tenant.ConcessionReason
            });
            setLeaseDates({
                leaseStartDate: tenant.LeaseStartDate ? moment(tenant.LeaseStartDate).format("YYYY-MM-DD") : '',
                moveInDate: tenant.MoveInDate ? moment(tenant.MoveInDate).format("YYYY-MM-DD") : '',
                leaseEndDate: tenant.LeaseEndDate ? moment(tenant.LeaseEndDate).format("YYYY-MM-DD") : '',
                moveoutDate: tenant.MoveOutDate ? moment(tenant.MoveOutDate).format("YYYY-MM-DD") : '',
                noticeGiven: parseInt(tenant.NoticeGiven) === 0 ? false : true,
                monthToMonth: parseInt(tenant.MTM) === 0 ? false : true
            });
            if(futureLeaseChanges) {
                setFutureLeaseChanges({
                    effectiveDate: futureLeaseChanges.LeaseChangeDate ? moment(futureLeaseChanges.LeaseChangeDate).format("YYYY-MM-DD") : '',
                    utilityCharge: parseFloat(futureLeaseChanges.FutureUtilityCharge).toFixed(2),
                    rentalAmount: parseFloat(futureLeaseChanges.FutureRentalAmount).toFixed(2),
                    housingAmount: parseFloat(futureLeaseChanges.FutureHousingAmount).toFixed(2)
                });
            }
            setLoading(false);
        };
        fetchData();
    }, [tenantID, history]);

    const submitTenant = async (data) => {
        const dtDOB = moment(data.dob);
        if(!dtDOB.isValid()) {   
            NotificationManager.warning("Please enter a valid DOB.", "Warning");
            return;
        }
            
        const res = await tenantAPI.updDetails({
            fistName: data.fname,
            lastName: data.lname,
            ssn: data.ssn,
            email: data.email,
            phone: data.phone,
            othersLease: data.othersLease,
            comment: data.comments,
            dob: dtDOB,
            dl: data.dl,
            dlState: data.dlStates,
            tenantID
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        NotificationManager.success("Tenant Details Updated Successfully!", "Success");
    }

    const submitRecurringCharges = async (data) => {
        const res = await tenantAPI.updRecurringCharges({
            tenantID: tenantID,
            rentalAmount: MyFuncs.getFormattedNum(data.recTenant),
            housingAmount: MyFuncs.getFormattedNum(data.recHousing),
            petRent: MyFuncs.getFormattedNum(data.recPet),
            tvCharge: MyFuncs.getFormattedNum(data.recTV),
            utilityCharge: MyFuncs.getFormattedNum(data.recUtility),
            parkingCharge: MyFuncs.getFormattedNum(data.recParking),
            storageCharge: MyFuncs.getFormattedNum(data.recStorage),
            hoaFee: MyFuncs.getFormattedNum(data.recHOAFee),
            garageAmount: MyFuncs.getFormattedNum(data.recGarage),
            cam: MyFuncs.getFormattedNum(data.recCAM),
            monthToMonth: MyFuncs.getFormattedNum(data.recMonthToMonth),
            additionalTenantsCharge: MyFuncs.getFormattedNum(data.recAdditionalTenants),
            RVCharge: MyFuncs.getFormattedNum(data.recRV),
            trashCharge: MyFuncs.getFormattedNum(data.recTrash),
            sewerCharge: MyFuncs.getFormattedNum(data.recSewer),
            taxesFee: MyFuncs.getFormattedNum(data.recTaxesFee),
            insuranceFee: MyFuncs.getFormattedNum(data.recInsuranceFee)
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        NotificationManager.success("Tenant Recurring Charges Updated Successfully!", "Success");
    }

    const submitRecurringConcession = async () => {
        if(isNaN(recurringConcession.amount) || recurringConcession.amount === 0) {
            NotificationManager.error("Please, enter a valid recurring concesseion amount.", "Error");
            return;
        }
        if(recurringConcession.reason === '') {
            NotificationManager.error("Please, enter a recurring concession reason.", "Error");
            return;
        }
        const res = await tenantAPI.updRecurringConcession({
            tenantID,
            amount: parseFloat(recurringConcession.amount).toFixed(2),
            reason: recurringConcession.reason
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        NotificationManager.success("Tenant Recurring Concession Updated Successfully!", "Success");
    }

    const submitLeaseDates = async () => {
        const dtLeaseStart = moment(leaseDates.leaseStartDate);
        if(!dtLeaseStart.isValid()) {   
            NotificationManager.warning("Please enter a valid Lease Start Date.", "Warning");
            return;
        }
        const dtLeaseEnd = moment(leaseDates.leaseEndDate);
        if(!dtLeaseEnd.isValid()) {   
            NotificationManager.warning("Please enter a valid Lease End Date.", "Warning");
            return;
        }
        const dtMoveIn = moment(leaseDates.moveInDate);
        if(!dtMoveIn.isValid()) {   
            NotificationManager.warning("Please enter a valid Move In Date.", "Warning");
            return;
        }
        const dtMoveOut = moment(leaseDates.moveoutDate);
        if(!dtMoveOut.isValid()) {   
            NotificationManager.warning("Please enter a valid Move Out Date.", "Warning");
            return;
        }
        const res = await tenantAPI.updLeaseDates({
            tenantID,
            leaseStartDate: dtLeaseStart,
            moveInDate: dtMoveIn,
            leaseEndDate: dtLeaseEnd,
            moveOutDate: dtMoveOut,
            notice: leaseDates.noticeGiven ? 1 : 0,
            mtm: leaseDates.monthToMonth ? 1 : 0
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        NotificationManager.success("Tenant Lease Dates Updated Successfully!", "Success");
    }

    const submitFutureLease = async () => {
        const dtEffectiveDate = moment(futureLeaseChanges.effectiveDate);
        if(!dtEffectiveDate.isValid()) {   
            NotificationManager.warning("Please enter a valid Effective Date.", "Warning");
            return;
        }
        if(isNaN(futureLeaseChanges.utilityCharge)) {
            NotificationManager.error("Please, enter a valid utility charge.", "Error");
            return;
        }
        if(isNaN(futureLeaseChanges.rentalAmount)) {
            NotificationManager.error("Please, enter a valid rental amount.", "Error");
            return;
        }
        if(isNaN(futureLeaseChanges.housingAmount)) {
            NotificationManager.error("Please, enter a valid housing amount.", "Error");
            return;
        }
        const res = await tenantAPI.updFutureLeaseChanges({
            tenantID,
            leaseChangeDate: dtEffectiveDate,
            housingAmount: parseFloat(futureLeaseChanges.housingAmount).toFixed(2),
            rentalAmount: parseFloat(futureLeaseChanges.rentalAmount).toFixed(2),
            utilityCharge: parseFloat(futureLeaseChanges.utilityCharge).toFixed(2)
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        NotificationManager.success("Tenant Future Lease Changes Updated Successfully!", "Success");
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Tenant..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const tenantDetailsHeading = () => { return <span style={{color: 'blue'}}>Tenant Details</span>; }
            const recurringChargesHeading = () => { return <span style={{color: 'blue'}}>Recurring Charges</span>; }
            const recurringConcessionHeading = () => { return <span style={{color: 'blue'}}>Recurring Concessions</span>; }
            const leaseDatesHeading = () => { return <span style={{color: 'blue'}}>Lease Dates</span>; }
            const futureLeaseHeading = () => { return <span style={{color: 'blue'}}>Future Lease Changes</span>; }
            const vehiclesHeading = () => { return <span style={{color: 'blue'}}>Tenant Vehicles</span>; }
            const documentsHeading = () => { return <span style={{color: 'blue'}}>Tenant Documents</span>; }
            return (
                <Main>
                    <div className="page-title d-flex justify-content-between align-items-center">
                        <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} 
                            onClick={() => {
                                const location = {
                                    pathname: '/tenants/details',
                                    state: { tenantID }
                                }
                                history.push(location);
                            }}
                        ></i>
                            <h2>
                                <span>Edit Tenant</span>
                            </h2>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={tenantDetailsHeading()}>
                                <Form onSubmit={handleSubmitTenant(submitTenant)}>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <Label for="fname" className="mr-sm-10">First Name</Label>
                                            <Controller
                                                name="fname"
                                                control={controlTenant}
                                                rules={{ required: true }}
                                                defaultValue={tenant.firstName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="fname" style={Util.setErrorStyle(errorsTenant.fname)} />
                                                )}
                                            />
                                            {errorsTenant.fname && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="lname" className="mr-sm-10">Last Name</Label>
                                            <Controller
                                                name="lname"
                                                control={controlTenant}
                                                rules={{ required: true }}
                                                defaultValue={tenant.lastName}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="lname" style={Util.setErrorStyle(errorsTenant.lname)} />
                                                )}
                                            />
                                            {errorsTenant.lname && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="ssn" className="mr-sm-10">SSN</Label>
                                            <Controller
                                                name="ssn"
                                                control={controlTenant}
                                                rules={{ required: true }}
                                                defaultValue={tenant.ssn}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="ssn" style={Util.setErrorStyle(errorsTenant.ssn)} />
                                                )}
                                            />
                                            {errorsTenant.ssn && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="dob" className="mr-sm-10">DOB</Label>
                                            <Controller
                                                name="dob"
                                                control={controlTenant}
                                                rules={{ required: true }}
                                                defaultValue={tenant.dob}
                                                render={({ field }) => (
                                                    <DatePicker {...field} id="dob" style={Util.setErrorStyle(errorsTenant.dob)} />
                                                )}
                                            />
                                            {errorsTenant.dob && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-5">
                                            <Label for="email" className="mr-sm-10">Email</Label>
                                            <Controller
                                                name="email"
                                                control={controlTenant}
                                                rules={{ required: true }}
                                                defaultValue={tenant.email}
                                                render={({ field }) => (
                                                    <Input {...field} type="email" id="email" style={Util.setErrorStyle(errorsTenant.email)} />
                                                )}
                                            />
                                            {errorsTenant.email && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="phone" className="mr-sm-10">Phone</Label>
                                            <Controller
                                                name="phone"
                                                control={controlTenant}
                                                defaultValue={tenant.phone}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="phone" format="+1 (###) ###-####" mask="_" className="form-control" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="dl" className="mr-sm-10">Driver's License</Label>
                                            <Controller
                                                name="dl"
                                                control={controlTenant}
                                                defaultValue={tenant.dl}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="dl" />
                                                )}
                                            />
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="dlState" className="mr-sm-10">DL State</Label>
                                            <Controller
                                                name="dlStates"
                                                control={controlTenant}
                                                defaultValue={tenant.dlState}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="dlStates">
                                                        <option value="XX">Select</option>
                                                        {Constants.usStates.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.abbreviation} 
                                                                    value={obj.abbreviation}
                                                                >
                                                                    {obj.name}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Label for="othersLease" className="mr-sm-10">Others On Lease</Label>
                                            <Controller
                                                name="othersLease"
                                                control={controlTenant}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="othersLease" />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Label for="comments" className="mr-sm-10">Comments</Label>
                                            <Controller
                                                name="comments"
                                                control={controlTenant}
                                                defaultValue={tenant.comments}
                                                render={({ field }) => (
                                                    <Input {...field} type="textarea" id="comments" rows={3} />
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" style={{marginTop: '15px'}}>Update</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={recurringChargesHeading()}>
                                <Form onSubmit={handleSubmitRecurringCharges(submitRecurringCharges)}>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="recTenant" className="mr-sm-10">Tenant</Label>
                                            <Controller
                                                name="recTenant"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.tenant}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recTenant" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recTenant)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recTenant && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recHousing" className="mr-sm-10">Housing</Label>
                                            <Controller
                                                name="recHousing"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.housing}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recHousing" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recHousing)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recHousing && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recPet" className="mr-sm-10">Pet</Label>
                                            <Controller
                                                name="recPet"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.pet}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recPet" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recPet)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recPet && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recTV" className="mr-sm-10">TV</Label>
                                            <Controller
                                                name="recTV"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.tv}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recTV" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recTV)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recTV && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recUtility" className="mr-sm-10">Utility</Label>
                                            <Controller
                                                name="recUtility"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.utility}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recUtility" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recUtility)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recUtility && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recParking" className="mr-sm-10">Parking</Label>
                                            <Controller
                                                name="recParking"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.parking}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recParking" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recParking)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recParking && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="recStorage" className="mr-sm-10">Storage</Label>
                                            <Controller
                                                name="recStorage"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.storage}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recStorage" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recStorage)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recStorage && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recHOAFee" className="mr-sm-10">HOA Fee</Label>
                                            <Controller
                                                name="recHOAFee"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.HOAFee}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recHOAFee" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recHOAFee)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recHOAFee && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recGarage" className="mr-sm-10">Garage</Label>
                                            <Controller
                                                name="recGarage"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.garage}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recGarage" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recGarage)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recGarage && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recCAM" className="mr-sm-10">CAM</Label>
                                            <Controller
                                                name="recCAM"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.CAM}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recCAM" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recCAM)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recCAM && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recMonthToMonth" className="mr-sm-10">Month To Month</Label>
                                            <Controller
                                                name="recMonthToMonth"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.monthToMonth}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recMonthToMonth" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recMonthToMonth)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recMonthToMonth && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recAdditionalTenants" className="mr-sm-10">Additional Tenants</Label>
                                            <Controller
                                                name="recAdditionalTenants"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.additionalTenants}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recAdditionalTenants" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recAdditionalTenants)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recAdditionalTenants && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="recRV" className="mr-sm-10">RV</Label>
                                            <Controller
                                                name="recRV"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.RV}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recRV" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recRV)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recRV && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recTrash" className="mr-sm-10">Trash</Label>
                                            <Controller
                                                name="recTrash"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.trash}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recTrash" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recTrash)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recTrash && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recSewer" className="mr-sm-10">Sewer</Label>
                                            <Controller
                                                name="recSewer"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.sewer}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recSewer" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recSewer)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recSewer && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recTaxesFee" className="mr-sm-10">Taxes Fee</Label>
                                            <Controller
                                                name="recTaxesFee"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.taxesFee}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recTaxesFee" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recTaxesFee)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recTaxesFee && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="recInsuranceFee" className="mr-sm-10">Insurance Fee</Label>
                                            <Controller
                                                name="recInsuranceFee"
                                                control={controlRecurringCharges}
                                                rules={{ required: true }}
                                                defaultValue={recurringCharges.insuranceFee}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="recInsuranceFee" thousandSeparator={true} prefix={"$"} className="form-control" 
                                                        style={Util.setErrorStyle(errorsRecurringCharges.recInsuranceFee)}
                                                    />
                                                )}
                                            />
                                            {errorsRecurringCharges.recInsuranceFee && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" style={{marginTop: '15px'}}>Update</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={recurringConcessionHeading()}>
                                <Form>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="concessionAmount" className="mr-sm-10">Amount</Label>
                                            <NumberFormat thousandSeparator={true} prefix={"$"} value={parseFloat(recurringConcession.amount).toFixed(2)}
                                                onValueChange={(v) => {
                                                    setRecurringConcession({...recurringConcession, amount: v.floatValue === undefined ? 0 : v.floatValue})
                                                }}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-sm-4">
                                            <Label for="concessionReason" className="mr-sm-10">Reason</Label>
                                            <Input type="text" name="concessionReason" id="concessionReason" 
                                                value={recurringConcession.reason} onChange={(e) => setRecurringConcession({...recurringConcession, reason: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <Button type="button" onClick={submitRecurringConcession} color="primary" style={{marginTop: '15px'}}>Update</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={leaseDatesHeading()}>
                                <Form>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="leaseStartDate" className="mr-sm-10">Lease Start Date</Label>
                                            <DatePicker name="leaseStartDate" id="leaseStartDate" 
                                                value={leaseDates.leaseStartDate} onChange={(e) => setLeaseDates({...leaseDates, leaseStartDate: e ? moment(e).format('YYYY-MM-DD') : ''})}
                                            />
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="moveInDate" className="mr-sm-10">Move In Date</Label>
                                            <DatePicker name="moveInDate" id="moveInDate" 
                                                value={leaseDates.moveInDate} onChange={(e) => setLeaseDates({...leaseDates, moveInDate: e ? moment(e).format('YYYY-MM-DD') : ''})}
                                            />
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="leaseEndDate" className="mr-sm-10">Lease End Date</Label>
                                            <DatePicker name="leaseEndDate" id="leaseEndDate" 
                                                value={leaseDates.leaseEndDate} onChange={(e) => setLeaseDates({...leaseDates, leaseEndDate: e ? moment(e).format('YYYY-MM-DD') : ''})}
                                            />
                                        </div>
                                        <div className="col-sm-3">
                                            <Label for="moveOutDate" className="mr-sm-10">Move Out Date</Label>
                                            <DatePicker name="moveOutDate" id="moveOutDate" 
                                                value={leaseDates.moveoutDate} onChange={(e) => setLeaseDates({...leaseDates, moveoutDate: e ? moment(e).format('YYYY-MM-DD') : ''})}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <Label for="noticeGiven" className="mr-sm-10">Notice Given</Label>
                                            <Switch name="noticeGiven" checked={leaseDates.noticeGiven} onChange={() => setLeaseDates({...leaseDates, noticeGiven: !leaseDates.noticeGiven})} />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="monthToMonth" className="mr-sm-10">Month to Month?</Label>
                                            <Switch name="monthToMonth" checked={leaseDates.monthToMonth} onChange={() => setLeaseDates({...leaseDates, monthToMonth: !leaseDates.monthToMonth})} />
                                        </div>
                                    </div>
                                    <Button type="button" onClick={submitLeaseDates} color="primary" style={{marginTop: '15px'}}>Update</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={futureLeaseHeading()}>
                                <Form>
                                    <div className="row">
                                        <div className="col-sm-3">
                                            <Label for="effectiveDate" className="mr-sm-10">Effective Date</Label>
                                            <DatePicker name="effectiveDate" id="effectiveDate" 
                                                value={futureLeaseChanges.effectiveDate} onChange={(e) => setFutureLeaseChanges({...futureLeaseChanges, effectiveDate: e ? moment(e).format('YYYY-MM-DD') : ''})}
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="futureUtilityCharge" className="mr-sm-10">Utility Charge</Label>
                                            <NumberFormat thousandSeparator={true} prefix={"$"} value={parseFloat(futureLeaseChanges.utilityCharge).toFixed(2)}
                                                onValueChange={(v) => {
                                                    setFutureLeaseChanges({...futureLeaseChanges, utilityCharge: v.floatValue === undefined ? 0 : v.floatValue})
                                                }}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="futureRentalAmount" className="mr-sm-10">Rental Amount</Label>
                                            <NumberFormat thousandSeparator={true} prefix={"$"} value={parseFloat(futureLeaseChanges.rentalAmount).toFixed(2)}
                                                onValueChange={(v) => {
                                                    setFutureLeaseChanges({...futureLeaseChanges, rentalAmount: v.floatValue === undefined ? 0 : v.floatValue})
                                                }}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <Label for="futureHousingAmount" className="mr-sm-10">Housing Amount</Label>
                                            <NumberFormat thousandSeparator={true} prefix={"$"} value={parseFloat(futureLeaseChanges.housingAmount).toFixed(2)}
                                                onValueChange={(v) => {
                                                    setFutureLeaseChanges({...futureLeaseChanges, housingAmount: v.floatValue === undefined ? 0 : v.floatValue})
                                                }}
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                    <Button color="primary" onClick={submitFutureLease} style={{marginTop: '15px'}}>Update</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={vehiclesHeading()}>
                                <AddVehicle tenantID={tenantID} tenantName={tenantName} />
                            </RctCollapsibleCard>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={documentsHeading()}>
                                <Documents tenantID={tenantID} tenantName={tenantName} propertyID={propertyID} />
                            </RctCollapsibleCard>
                        </div>
                    </div>
                
                    <NotificationContainer />
                </Main>
            );
        }
    }

    return render();
}

export default EditTenant;