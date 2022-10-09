import React, {useState, useEffect} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';
import * as tenantsAPI from '../../../Api/tenants';

const ConvertToTenant = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user;
    const userID = user.id;
    const propertyID = login.selectedPropertyID;
    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const unitID = props.location.state ? props.location.state.unitID : null;
    const tenantName = props.location.state ? props.location.state.tenantName : null;
    const unitName = props.location.state ? props.location.state.unitName : null;

    const [loading, setLoading] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            if(tenantID === null || unitID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            const property = await applicantsAPI.getPropertyByID(propertyID);
            const tenant = await tenantsAPI.getTenant(tenantID);
            const unit = await applicantsAPI.getUnitDetails(unitID);
            if(tenant !== null) {
                
            }
            if(property !== null) {
                setValue("refSecDeposit", parseFloat(property.SecurityDeposit).toFixed(2));    
                setValue("nonRefFee", parseFloat(property.NRSecurityDeposit).toFixed(2));        
                setValue("application", parseFloat(property.ApplicationFee).toFixed(2));
            }
            if(unit !== null) {
                setValue("admin", parseFloat(unit.AdminFee).toFixed(2));    
                setValue("tenantRent", parseFloat(unit.UnitCharge).toFixed(2));   
                setValue("hoaFee", unit.HOAFee !== '' ? parseFloat(unit.UnitCharge).toFixed(2) : 0);    
            }
            setValue("leaseStartDate", moment.utc().format("YYYY-MM-DD"))
            setValue("leaseEndDate", moment.utc().format("YYYY-MM-DD"))
            setValue("moveInDate", moment.utc().format("YYYY-MM-DD"))
            setValue("moveOutDate", moment.utc().format("YYYY-MM-DD"))
            setValue("reservationFee", 0);
            setValue("petDeposit", 0);
            setValue("lastMonthRent", 0);    
            setValue("proRatedRent", 0);
            setValue("housingRent", 0);
            setValue("petRent", 0);
            setValue("tvRent", 0);
            setValue("utilityRent", 0);
            setValue("storageRent", 0);
            setValue("parkingRent", 0);
            setValue("oneTimeConcessionAmt", 0);
            setValue("oneTimeConcessionDt", moment.utc().format("YYYY-MM-DD"));
            setValue("oneTimeConcessionReason", '');
            
            setLoading(false);
        }
        fetchData();
    }, [tenantID, propertyID, unitID, setValue, history])

    const submitForm = async (data) => {
        setLoading(true);
        const res = await applicantsAPI.convertToTenant({
            rentalAmount: parseFloat(data.tenantRent).toFixed(2),
            housingAmount: parseFloat(data.housingRent).toFixed(2),
            petRent: parseFloat(data.petRent).toFixed(2),
            TVCharge: parseFloat(data.tvRent).toFixed(2),
            utilityCharge: parseFloat(data.utilityRent).toFixed(2),
            storageCharge: parseFloat(data.storageRent).toFixed(2),
            parkingCharge: parseFloat(data.parkingRent).toFixed(2),
            securityDeposit: parseFloat(data.refSecDeposit).toFixed(2),
            HOAFee: parseFloat(data.hoaFee).toFixed(2),
            leaseStartDate: moment.utc(data.leaseStartDate).format("YYYY-MM-DD"),
            leaseEndDate: moment.utc(data.leaseEndDate).format("YYYY-MM-DD"),
            moveInDate: moment.utc(data.moveInDate).format("YYYY-MM-DD"),
            moveOutDate: moment.utc(data.moveOutDate).format("YYYY-MM-DD"),
            propertyID,
            unitID,
            tenantID,
            userID,
            nonRefundableDeposit: parseFloat(data.nonRefFee).toFixed(2),
            proRatedRent: parseFloat(data.proRatedRent).toFixed(2),
            lastMonthRent: parseFloat(data.lastMonthRent).toFixed(2),
            reservationFee: parseFloat(data.reservationFee).toFixed(2),
            petDepositOneTime: parseFloat(data.petDeposit).toFixed(2),
            oneTimeConcession: parseFloat(data.oneTimeConcessionAmt).toFixed(2),
            adminFee: parseFloat(data.admin).toFixed(2),
            applicationFee: parseFloat(data.application).toFixed(2),
            concessionComment: data.oneTimeConcessionReason
        });
        setLoading(false)
        if(res === -1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(res !== 0) {
            NotificationManager.error(res, "Error");
            return;
        }
        props.setUpdated(!props.updated);
        props.setConvertTenantID(0)
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Convert To Tenant...`}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => {
                        history.goBack()
                    }}></i>
                    <h2>
                        <span>Convert <i>{tenantName}</i> to tenant. Move in to unit: <i>{unitName}</i></span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="leaseStartDate" className="mr-sm-10">Lease Start Date</Label>
                                    <Controller
                                        name="leaseStartDate"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="leaseStartDate" style={Util.setErrorStyle(errors.leaseStartDate)} />
                                        )}
                                    />
                                    {errors.leaseStartDate && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="leaseEndDate" className="mr-sm-10">Lease End Date</Label>
                                    <Controller
                                        name="leaseEndDate"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="leaseEndDate" style={Util.setErrorStyle(errors.leaseEndDate)} />
                                        )}
                                    />
                                    {errors.leaseEndDate && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div> 
                                <div className="col-sm-2">
                                    <Label for="moveInDate" className="mr-sm-10">Move In Date</Label>
                                    <Controller
                                        name="moveInDate"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="moveInDate" style={Util.setErrorStyle(errors.moveInDate)} />
                                        )}
                                    />
                                    {errors.moveInDate && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div> 
                                <div className="col-sm-2">
                                    <Label for="moveOutDate" className="mr-sm-10">Move Out Date</Label>
                                    <Controller
                                        name="moveOutDate"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="moveOutDate" style={Util.setErrorStyle(errors.moveOutDate)} />
                                        )}
                                    />
                                    {errors.moveOutDate && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>  
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>One Time Fees</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="refSecDeposit" className="mr-sm-10">Refundable Security Deposit</Label>
                                    <Controller
                                        name="refSecDeposit"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="refSecDeposit" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.refSecDeposit)} />
                                        )}
                                    />
                                    {errors.refSecDeposit && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="nonRefFee" className="mr-sm-10">Non Refundable Fee</Label>
                                    <Controller
                                        name="nonRefFee"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="nonRefFee" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.nonRefFee)} />
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
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="lastMonthRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.lastMonthRent)} />
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
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="proRatedRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.proRatedRent)} />
                                        )}
                                    />
                                    {errors.proRatedRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="admin" className="mr-sm-10">Admin</Label>
                                    <Controller
                                        name="admin"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="admin" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.admin)} />
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
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="application" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.application)} />
                                        )}
                                    />
                                    {errors.application && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="reservationFee" className="mr-sm-10">Reservation Fee</Label>
                                    <Controller
                                        name="reservationFee"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="reservationFee" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.reservationFee)} />
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
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="petDeposit" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.petDeposit)} />
                                        )}
                                    />
                                    {errors.petDeposit && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Recurring Rental Amounts</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="tenantRent" className="mr-sm-10">Tenant Rent</Label>
                                    <Controller
                                        name="tenantRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="tenantRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.tenantRent)} />
                                        )}
                                    />
                                    {errors.tenantRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="housingRent" className="mr-sm-10">Housing Rent</Label>
                                    <Controller
                                        name="housingRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="housingRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.housingRent)} />
                                        )}
                                    />
                                    {errors.housingRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="petRent" className="mr-sm-10">Pet Rent</Label>
                                    <Controller
                                        name="petRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="petRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.petRent)} />
                                        )}
                                    />
                                    {errors.petRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="tvRent" className="mr-sm-10">TV</Label>
                                    <Controller
                                        name="tvRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="tvRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.tvRent)} />
                                        )}
                                    />
                                    {errors.tvRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="utilityRent" className="mr-sm-10">Utility</Label>
                                    <Controller
                                        name="utilityRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="utilityRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.utilityRent)} />
                                        )}
                                    />
                                    {errors.utilityRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="parkingRent" className="mr-sm-10">Parking</Label>
                                    <Controller
                                        name="parkingRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="parkingRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.parkingRent)} />
                                        )}
                                    />
                                    {errors.parkingRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="storageRent" className="mr-sm-10">Storage</Label>
                                    <Controller
                                        name="storageRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="storageRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.storageRent)} />
                                        )}
                                    />
                                    {errors.storageRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="hoaFee" className="mr-sm-10">HOA Fee</Label>
                                    <Controller
                                        name="hoaFee"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="hoaFee" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.hoaFee)} />
                                        )}
                                    />
                                    {errors.hoaFee && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>One Time Concession</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="oneTimeConcessionAmt" className="mr-sm-10">Amount</Label>
                                    <Controller
                                        name="oneTimeConcessionAmt"
                                        control={control}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="oneTimeConcessionAmt" thousandSeparator={true} prefix={'$'} />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="oneTimeConcessionDt" className="mr-sm-10">Date</Label>
                                    <Controller
                                        name="oneTimeConcessionDt"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="oneTimeConcessionDt"  />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="oneTimeConcessionReason" className="mr-sm-10">Reason</Label>
                                    <Controller
                                        name="oneTimeConcessionReason"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} className="form-control" type="textarea" rows={4} id="oneTimeConcessionReason" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" color="primary" style={{marginTop: '1rem'}}>Convert</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default ConvertToTenant;