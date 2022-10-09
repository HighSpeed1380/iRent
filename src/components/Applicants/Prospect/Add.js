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
import * as Constants from '../../Util/constants';
import * as Util from '../../Util/util';
import * as applicantsAPI from '../../../Api/applicants';

const Add = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const company = login.company
    const companyID = company.id;
    const user = login.user;
    const userID = user.id;

    const [loading, setLoading] = useState(false);
    const [unitTypes, setUnitTypes] = useState([]);
    const [leadSources, setLeadSources] = useState([]);

    const { handleSubmit, control, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setUnitTypes(await applicantsAPI.getUnitTypes(propertyID));
            setLeadSources(await applicantsAPI.getLeadSources(companyID));
            setLoading(false);
        }
        fetchData()
    }, [propertyID, companyID])

    const submitForm = async (data) => {
        if(parseInt(data.prospectType) === 0) {
            NotificationManager.error("Please, select Prospect or Applicant.", "Error");
            return;
        }
        if(parseInt(data.unitType) === 0) {
            NotificationManager.error("Please, select a Unit Type.", "Error");
            return;
        }
        // Identification must have both (DL and State) or none
        const driversLicense = data.driversLicense === undefined ? '' : data.driversLicense;
        const dlState = data.dlState === undefined ? '0' : data.dlState;
        if(driversLicense !== '' && dlState === '0') {
            NotificationManager.error("Driver's License State is required if Driver's License is entered.", "Error");
            return;
        }
        if(dlState !== '0' && driversLicense === '') {
            NotificationManager.error("Driver's License is required if Driver's License State is entered.", "Error");
            return;
        }

        setLoading(true);
        const res = await applicantsAPI.addNewProspectApplicant({
            firstName: data.firstName,
            middleName: data.middleName !== undefined ? data.middleName : '',
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            ssn: data.ssn,
            comment: data.comments !== undefined ? data.comments : '',
            startDate: moment.utc(data.startDate).format("YYYY-MM-DD"),
            unitTypeID: parseInt(data.unitType),
            prospect: parseInt(data.prospectType),
            propertyID,
            userID,
            leadSourceID: data.leadSourceID !== undefined ? parseInt(data.leadSourceID) : 0,
            otherOnLease: data.otherOnLease !== undefined ? data.otherOnLease : '',
            lastLandlordName: data.currLandlordName !== undefined ? data.currLandlordName : '',
            lastLandlordPhone: data.currLandlordPhone !== undefined ? data.currLandlordPhone : '',
            previousLandlordName: data.prevLandlordName !== undefined ? data.prevLandlordName : '',
            previousLandlordPhone: data.prevLandlordPhone !== undefined ? data.prevLandlordPhone : '',
            currentEmployer: data.currEmp !== undefined ? data.currEmp : '',
            currentEmployerContact: data.currEmpContact !== undefined ? data.currEmpContact : '',
            currentEmployerPhone: data.currEmpPhone !== undefined ? data.currEmpPhone : '',
            currentSalary: data.currEmpSalary !== undefined ? data.currEmpSalary : 0,
            previousEmployer: data.prevEmp !== undefined ? data.prevEmp : '',
            previousEmployerContact: data.prevEmpContact !== undefined ? data.prevEmpContact : '',
            previousEmployerPhone: data.prevEmpPhone !== undefined ? data.prevEmpPhone : '',
            DOB: moment.utc(data.dob).format("YYYY-MM-DD"),
            houseNumber: data.currHouseNumber !== undefined ? data.currHouseNumber.toString() : '',
            street: data.currStreet !== undefined ? data.currStreet : '',
            unit: data.currUnit !== undefined ? data.currUnit : '',
            city: data.currCity !== undefined ? data.currCity : '',
            state: data.currState !== undefined ? data.currState : '',
            zip: data.currPostalCode !== undefined ? data.currPostalCode : '',
            houseNumber2: data.prevHouseNumber !== undefined ? data.prevHouseNumber.toString() : '',
            street2: data.prevStreet !== undefined ? data.prevStreet : '',
            city2: data.prevCity !== undefined ? data.prevCity : '',
            state2: data.prevState !== undefined ? data.prevState : '',
            zip2: data.prevPostalCode !== undefined ? data.prevPostalCode : '',
            unit2: data.prevUnit !== undefined ? data.prevUnit : '',
            driversLicense: data.driversLicense !== undefined ? data.driversLicense : '',
            DLState: data.dlState !== undefined ? data.dlState : ''
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(parseInt(data.prospectType) === 5) {
            const location = {
                pathname: '/prospects/viewAll',
            }
            history.push(location);
        } else {
            const location = {
                pathname: '/applicants/viewAll',
            }
            history.push(location);
        }
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Add Prospect/Applicant...`}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Add Prospect/Applicant</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="prospectType" className="mr-sm-10">Add New</Label>
                                    <Controller
                                        name="prospectType"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="prospectType" style={Util.setErrorStyle(errors.prospectType)}>
                                                <option value="0">Select</option>
                                                <option value="5">Prospect</option>
                                                <option value="1">Applicant</option>
                                            </Input>
                                        )}
                                    />
                                    {errors.prospectType && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
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
                                <div className="col-sm-3">
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
                                <div className="col-sm-3">
                                    <Label for="phone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat className="form-control" {...field} format="+1 (###) ###-####" mask="_" id="phone" style={Util.setErrorStyle(errors.phone)} />
                                        )}
                                    />
                                    {errors.phone && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="ssn" className="mr-sm-10">SSN</Label>
                                    <Controller
                                        name="ssn"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="ssn" style={Util.setErrorStyle(errors.ssn)} />
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
                                <div className="col-sm-2">
                                    <Label for="startDate" className="mr-sm-10">Start Date</Label>
                                    <Controller
                                        name="startDate"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="startDate" style={Util.setErrorStyle(errors.startDate)} />
                                        )}
                                    />
                                    {errors.startDate && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="comments" className="mr-sm-10">Comments</Label>
                                    <Controller
                                        name="comments"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="textarea" id="comments" rows={3} />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Interest +</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="unitType" className="mr-sm-10">Unit Type</Label>
                                    <Controller
                                        name="unitType"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="unitType" style={Util.setErrorStyle(errors.unitType)}>
                                                <option value="0">Select</option>
                                                {unitTypes.map((obj, idx) => 
                                                    <option key={idx} value={obj.UnitTypeID}>{obj.UnitType}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                    {errors.unitType && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="leadSource" className="mr-sm-10">Unit Type</Label>
                                    <Controller
                                        name="leadSource"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="leadSource">
                                                {leadSources.map((obj, idx) => 
                                                    <option key={idx} value={obj.LeadSourceID}>{obj.LeadSource}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-4">
                                    <Label for="othersOnLease" className="mr-sm-10">Others On Lease</Label>
                                    <Controller
                                        name="othersOnLease"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="othersOnLease" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Employer</Alert>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="currEmp" className="mr-sm-10">Current Employer</Label>
                                    <Controller
                                        name="currEmp"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmp" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmpContact" className="mr-sm-10">Current Employer Contact</Label>
                                    <Controller
                                        name="currEmpContact"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmpContact" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmpPhone" className="mr-sm-10">Current Employer Phone</Label>
                                    <Controller
                                        name="currEmpPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <NumberFormat className="form-control" {...field} format="+1 (###) ###-####" mask="_" id="currEmpPhone" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="currEmpSalary" className="mr-sm-10">Current Employer Salary</Label>
                                    <Controller
                                        name="currEmpSalary"
                                        control={control}
                                        render={({ field }) => (
                                            <NumberFormat className="form-control" {...field} thousandSeparator={true} prefix={'$'} id="currEmpSalary" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Previous Employer</Alert>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="prevEmp" className="mr-sm-10">Employer Name</Label>
                                    <Controller
                                        name="prevEmp"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmp" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevEmpContact" className="mr-sm-10">Employer Contact</Label>
                                    <Controller
                                        name="prevEmpContact"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmpContact" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevEmpPhone" className="mr-sm-10">Employer Phone</Label>
                                    <Controller
                                        name="prevEmpPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <NumberFormat className="form-control" {...field} format="+1 (###) ###-####" mask="_" id="prevEmpPhone" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Residence</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="currHouseNumber" className="mr-sm-10">House Number</Label>
                                    <Controller
                                        name="currHouseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="currHouseNumber" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-4">
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
                                <div className="col-sm-4">
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
                                            <Input {...field} type="select" id="currState">
                                                {Constants.usStates.map((obj, idx) => 
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currPostalCode" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="currPostalCode"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currPostalCode" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Landlord</Alert>
                            <div className="row">
                                <div className="col-sm-4">
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
                                            <NumberFormat className="form-control" {...field} format="+1 (###) ###-####" mask="_" id="currLandlordPhone" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Previous Residence</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="prevHouseNumber" className="mr-sm-10">House Number</Label>
                                    <Controller
                                        name="prevHouseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="prevHouseNumber" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-4">
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
                                <div className="col-sm-4">
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
                                            <Input {...field} type="select" id="prevState">
                                                {Constants.usStates.map((obj, idx) => 
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevPostalCode" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="prevPostalCode"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevPostalCode" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Previous Landlord</Alert>
                            <div className="row">
                                <div className="col-sm-4">
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
                                            <NumberFormat className="form-control" {...field} format="+1 (###) ###-####" mask="_" id="prevLandlordPhone" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Identification</Alert>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="driversLicense" className="mr-sm-10">Driver's License</Label>
                                    <Controller
                                        name="driversLicense"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="driversLicense" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="dlState" className="mr-sm-10">DL State</Label>
                                    <Controller
                                        name="dlState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="dlState">
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj, idx) => 
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" color="primary" style={{marginTop: '1rem'}}>Add</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default Add;