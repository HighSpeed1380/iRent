import React, {useState, useEffect} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import DatePicker from "reactstrap-date-picker";
import Alert from '@material-ui/lab/Alert';
import moment from 'moment';
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as tenantsAPI from '../../../Api/tenants';
import * as applicantsAPI from '../../../Api/applicants';

const ConvertToApplicant = (props) => {
    const history = useHistory();
    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;
    const propertyID = login.selectedPropertyID;

    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    const [leadSources, setLeadSources] = useState([]);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            if(tenantID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            setUnits(await applicantsAPI.getUnitTypes(propertyID));
            setLeadSources(await applicantsAPI.getLeadSources(companyID));
            const tenant = await tenantsAPI.getTenant(tenantID);
            const background = await tenantsAPI.getTenantBackground(tenantID);

            setValue("firstName", tenant.TenantFName);
            setValue("middleName", tenant.TenantMName);
            setValue("lastName", tenant.TenantLName);
            setValue("ssn", tenant.SSN);
            setValue("dob", moment.utc(background.DOB).format("YYYY-MM-DD"));
            setValue("phone", tenant.TenantPhone);
            setValue("email", tenant.TenantEmail);
            setValue("comment", tenant.ProspectComments);
            setValue("unitType", tenant.UnitTypeID);
            setValue("leadSource", tenant.LeadSourceID);
            setValue("currEmpName", background.CurrentEmployer);
            setValue("currEmpContact", background.CurrentEmployerContact);
            setValue("currEmpPhone", background.CurrentEmployerPhone);
            setValue("currEmpSalary", background.CurrentSalary === "" ? 0 : parseFloat(background.CurrentSalary).toFixed(2));
            setValue("prevEmpName", background.PreviousEmployer);
            setValue("prevEmpContact", background.PreviousEmployerContact);
            setValue("prevEmpPhone", background.PreviousEmployerPhone);
            setValue("currHouseNumber", background.HouseNumber.toString());
            setValue("currStreet", background.StreetName);
            setValue("currUnit", background.Unit);
            setValue("currCity", background.City);
            setValue("currState", background.State);
            setValue("currZip", background.Zip);
            setValue("currLandlordName", background.LastLandlordName);
            setValue("currLandlordPhone", background.LastLandlordPhone);
            setValue("prevHouseNumber", background.HouseNumber2);
            setValue("prevStreet", background.StreetName2);
            setValue("prevUnit", background.Unit2);
            setValue("prevCity", background.City2);
            setValue("prevState", background.State2);
            setValue("prevZip", background.Zip2);
            setValue("prevLandlordName", background.PreviousLandlordName);
            setValue("prevLandlordPhone", background.PreviousLandlordPhone);
            setValue("dl", background.DriversLicense);
            setValue("dlState", background.DLState);

            setLoading(false);
        }
        fetchData();
    }, [tenantID, propertyID, companyID, setValue, history])

    const submitForm = async (data) => {
        setLoading(true);
        const res = await applicantsAPI.convertToApplicant({
            fistName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            ssn: data.ssn,
            comment: data.comment,
            leadSourceID: parseInt(data.leadSource),
            tenantID,
            houseNumber: data.currHouseNumber,
            street: data.currStreet,
            unit: data.currUnit,
            city: data.currCity,
            state: data.currState,
            zip: data.currZip,
            landlordName: data.currLandlordName,
            landlordPhone: data.currLandlordPhone,
            prevHouseNumber: data.prevHouseNumber,
            prevStreet: data.prevStreet,
            prevCity: data.prevCity,
            prevState: data.prevState,
            prevZip: data.prevZip,
            prevLandlordName: data.prevLandlordName,
            prevLandlordPhone: data.prevLandlordPhone,
            employer: data.currEmpName,
            employerContact: data.currEmpContact,
            employerPhone: data.currEmpPhone,
            employerSalary: data.currEmpSalary === '' ? 0 : parseFloat(data.currEmpSalary).toFixed(2),
            prevEmployer: data.prevEmpName,
            prevEmployerContact: data.prevEmpContact,
            prevEmployerPhone: data.prevEmpPhone,
            driversLicense: data.dl,
            dlState: data.dlState
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        props.setConvertProspectID(0);
        props.setUpdated(!props.updated);
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Prospect..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }
        
    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                    <h2>
                        <span>Convert Prospect to Applicant</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <Alert severity="info" style={{marginBottom: '1rem'}}>Prospect Info</Alert>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="firstName" className="mr-sm-10">First Name</Label>
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="firstName" style={Util.setErrorStyle(errors.firstName)} />
                                        )}
                                    />
                                    {errors.firstName && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-4">
                                    <Label for="middleName" className="mr-sm-10">Middle Name</Label>
                                    <Controller
                                        name="middleName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="middleName" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-4">
                                    <Label for="lastName" className="mr-sm-10">Last Name</Label>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        rules={{ required: true }}
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
                                <div className="col-sm-3">
                                    <Label for="ssn" className="mr-sm-10">SSN</Label>
                                    <Controller
                                        name="ssn"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="ssn" style={Util.setErrorStyle(errors.ssn)} />
                                        )}
                                    />
                                    {errors.ssn && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="dob" className="mr-sm-10">DOB</Label>
                                    <Controller
                                        name="dob"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="dob" style={Util.setErrorStyle(errors.dob)} />
                                        )}
                                    />
                                    {errors.dob && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="phone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="phone" style={Util.setErrorStyle(errors.phone)} />
                                        )}
                                    />
                                    {errors.phone && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-4">
                                    <Label for="email" className="mr-sm-10">Email</Label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="email" style={Util.setErrorStyle(errors.email)} />
                                        )}
                                    />
                                    {errors.email && (
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
                                            <Input {...field} type="text" id="comment" />
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Interest</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="unitType" className="mr-sm-10">Interest</Label>
                                    <Controller
                                        name="unitType"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="unitType" style={Util.setErrorStyle(errors.unitType)}>
                                                {units.map((obj, idx) => {
                                                    return <option key={idx} value={obj.UnitTypeID}>{obj.UnitType}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.unitType && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="leadSource" className="mr-sm-10">Lead Source</Label>
                                    <Controller
                                        name="leadSource"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="leadSource" style={Util.setErrorStyle(errors.leadSource)}>
                                                {leadSources.map((obj, idx) => {
                                                    return <option key={idx} value={obj.LeadSourceID}>{obj.LeadSource}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.leadSource && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                                    
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Employer</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="currEmpName" className="mr-sm-10">Employer</Label>
                                    <Controller
                                        name="currEmpName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmpName" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmpContact" className="mr-sm-10">Contact</Label>
                                    <Controller
                                        name="currEmpContact"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmpContact" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmpPhone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="currEmpPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmpPhone" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmpSalary" className="mr-sm-10">Salary</Label>
                                    <Controller
                                        name="currEmpSalary"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="currEmpSalary" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Previous Employer</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="prevEmpName" className="mr-sm-10">Employer</Label>
                                    <Controller
                                        name="prevEmpName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmpName" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevEmpContact" className="mr-sm-10">Contact</Label>
                                    <Controller
                                        name="prevEmpContact"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmpContact" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevEmpPhone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="prevEmpPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmpPhone" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Residence</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="currHouseNumber" className="mr-sm-10">Number</Label>
                                    <Controller
                                        name="currHouseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currHouseNumber" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currStreet" className="mr-sm-10">Street</Label>
                                    <Controller
                                        name="currStreet"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currStreet" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="currUnit" className="mr-sm-10">Unit</Label>
                                    <Controller
                                        name="currUnit"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currUnit" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="currCity" className="mr-sm-10">City</Label>
                                    <Controller
                                        name="currCity"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currCity" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="currState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="currState" >
                                                {Constants.usStates.map((obj, idx) => {
                                                    return <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="currZip" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="currZip"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currZip" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Landlord</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="currLandlordName" className="mr-sm-10">Name</Label>
                                    <Controller
                                        name="currLandlordName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currLandlordName" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currLandlordPhone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="currLandlordPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currLandlordPhone" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>previous Residence</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="prevHouseNumber" className="mr-sm-10">Number</Label>
                                    <Controller
                                        name="prevHouseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevHouseNumber" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevStreet" className="mr-sm-10">Street</Label>
                                    <Controller
                                        name="prevStreet"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevStreet" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="prevUnit" className="mr-sm-10">Unit</Label>
                                    <Controller
                                        name="prevUnit"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevUnit" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="prevCity" className="mr-sm-10">City</Label>
                                    <Controller
                                        name="prevCity"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevCity" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="prevState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="prevState" >
                                                {Constants.usStates.map((obj, idx) => {
                                                    return <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="prevZip" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="prevZip"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevZip" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Previous Landlord</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="prevLandlordName" className="mr-sm-10">Name</Label>
                                    <Controller
                                        name="prevLandlordName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevLandlordName" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevLandlordPhone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="prevLandlordPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevLandlordPhone" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Identification</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="dl" className="mr-sm-10">Driver's License</Label>
                                    <Controller
                                        name="dl"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="dl" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="dlState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="dlState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="dlState" >
                                                {Constants.usStates.map((obj, idx) => {
                                                    return <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
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

export default ConvertToApplicant;