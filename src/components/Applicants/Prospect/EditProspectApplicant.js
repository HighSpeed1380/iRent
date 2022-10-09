import React, {useState, useEffect} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import Alert from '@material-ui/lab/Alert';
import { FormGroup } from '@material-ui/core';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as tenantsAPI from '../../../Api/tenants';
import * as applicantsAPI from '../../../Api/applicants';

const EditProspectApplicant = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;
    const propertyID = login.selectedPropertyID;
    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const name = props.location.state ? props.location.state.name : null;

    const [loading, setLoading] = useState(false);
    const [tenantName, setTenantName] = useState("");
    const [units, setUnits] = useState([]);
    const [ printable, setPrintable ] = useState([]);
    const [ selectedDoc, setSelectedDoc ] = useState(0);
    const [ formsPDF, setFormsPDF ] = useState(new Map());

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            if(tenantID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            setUnits(await applicantsAPI.getUnitTypes(propertyID));
            const tenant = await tenantsAPI.getTenant(tenantID);
            const background = await tenantsAPI.getTenantBackground(tenantID);
            if(tenant !== null) {
                setTenantName(`${tenant.TenantFName} ${tenant.TenantLName}`);
                setValue('email', tenant.TenantEmail);
                setValue('phone', tenant.TenantPhone);
                setValue('unit', parseInt(tenant.UnitTypeID));
                setValue('ssn', tenant.SSN);
            }
            if(background !== null) {
                setValue('dob', background.DOB === null ? '' : moment.utc(background.DOB).format("YYYY-MM-DD"));
                setValue('dlState', background.DLState);
                setValue('driversLicense', background.DriversLicense);
                setValue('currSalary', isNaN(background.CurrentSalary) ? 0 : parseFloat(background.CurrentSalary).toFixed(2));
                setValue('currEmployer', background.CurrentEmployer);
                setValue('currEmployerContact', background.CurrentEmployerContact);
                setValue('currEmployerPhone', background.CurrentEmployerPhone);
                setValue('prevEmployer', background.PreviousEmployer);
                setValue('prevEmployerContact', background.PreviousEmployerContact);
                setValue('prevEmployerPhone', background.PreviousEmployerPhone);
                setValue('currHouseNumber', background.HouseNumber);
                setValue('currStreet', background.StreetName);
                setValue('currCity', background.City);
                setValue('currState', background.State);
                setValue('currZip', background.Zip);
                setValue('currLandlord', background.LastLandlordName);
                setValue('currLandlordPhone', background.LastLandlordPhone);
                setValue('prevHouseNumber', background.HouseNumber2);
                setValue('prevStreet', background.StreetName2);
                setValue('prevCity', background.City2);
                setValue('prevState', background.State2);
                setValue('prevZip', background.Zip2);
                setValue('prevLandlord', background.PreviousLandlordName);
                setValue('prevLandlordPhone', background.PreviousLandlordPhone);
            }
            const listForms = await tenantsAPI.getListForms({
                companyID,
                propertyID
            });
            let formsDropdown = [];
            let map = new Map();
            for(const f of listForms) {
                formsDropdown.push({
                    id: f.FormsCreatorID,
                    name: f.FormName
                });
                map.set(f.FormsCreatorID, f.PDFForm === null ? false : true);
            }
            setPrintable(formsDropdown);
            setFormsPDF(map);
            setLoading(false)
        }
        fetchData()
    }, [companyID, tenantID, propertyID, setValue, history]);

    const submitForm = async (data) => {
        setLoading(true);
        const res = await applicantsAPI.updateProspectApplicant({
            ssn: data.ssn,
            email: data.email,
            phone: data.phone.replace(/'/g, "\\'"),
            unitTypeID: parseInt(data.unit),
            tenantID,
            dob: data.dob,
            driversLicense: data.driversLicense || "",
            dlState: data.dlState || "",
            currSalary: isNaN(data.currSalary) ? 0 : parseFloat(data.currSalary).toFixed(2),
            currEmployer: data.currEmployer || "",
            currEmployerContact: data.currEmployerContact || "",
            currEmployerPhone: data.currEmployerPhone || "",
            prevEmployer: data.prevEmployer || "",
            prevEmployerContact: data.prevEmployerContact || "",
            prevEmployerPhone: data.prevEmployerPhone || "",
            houseNumber: isNaN(data.currHouseNumber) ? 0 : parseInt(data.currHouseNumber),
            streetName: data.currStreet || "",
            city: data.currCity || "",
            state: data.currState || "",
            zip: data.currZip || "",
            lastLandlordName: data.currLandlord || "",
            lastLandlordPhone: data.currLandlordPhone || "",
            houseNumber2: data.prevHouseNumber || "",
            streetName2: data.prevStreet || "",
            city2: data.prevCity || "",
            state2: data.state2 || "",
            zip2: data.prevZip || "",
            prevLandlordName: data.prevLandlordName || "",
            prevLandlordPhone: data.prevLandlordPhone || "",
        });
        setLoading(false)
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        } else
            NotificationManager.success(`${name} updated.`, "Success");
    }

    const openDoc = () => {
        if(parseInt(selectedDoc) === 0) {
            NotificationManager.error("Please select a document.", "Error");
            return;
        }
        if(formsPDF.get(parseInt(selectedDoc))) {
            // PDF
            const url = `./RHAWA-PDF/${parseInt(selectedDoc)}`;
            window.open(url, '_blank');
        } else {
            let url = `./printable.cfm?P=11&FC=${parseInt(selectedDoc)}&TID=${tenantID}`;
            if(parseInt(selectedDoc) === 4)
                url = url + `&a=0`;
            
            window.open(url, '_blank'); 
        }
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading ${name}...`}
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
                        <span>{name} - {tenantName}</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4 col-md-4 col-xl-4">
                    <FormGroup className="mr-10 mb-10">
                        <Label for="printableDoc" className="mr-sm-10">Printable Docs</Label>
                        <Input type="select" name="printableDoc" id="printableDoc" 
                            value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}
                        >
                            <option value="0">Select</option>
                            {printable.map((obj) => {
                                return (
                                    <option 
                                        key={obj.id} 
                                        value={obj.id}
                                    >
                                        {obj.name}
                                    </option>
                                );
                            })}
                        </Input>
                    </FormGroup>
                </div>
                <FormGroup className="mr-10 mb-10">
                    <Button type="button" color="primary" style={{marginTop: '2rem'}} onClick={openDoc}>Open Document</Button>
                </FormGroup>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form onSubmit={handleSubmit(submitForm)}>
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
                                            <Input {...field} type="text" id="phone" style={Util.setErrorStyle(errors.phone)} />
                                        )}
                                    />
                                    {errors.phone && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="unit" className="mr-sm-10">Interest</Label>
                                    <Controller
                                        name="unit"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="unit" style={Util.setErrorStyle(errors.unit)}>
                                                {units.map((obj, idx) => {
                                                    return <option key={idx} value={obj.UnitTypeID}>{obj.UnitType}</option>
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
                                                {Constants.usStates.map((obj, idx) => {
                                                     return <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Employment History</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="currSalary" className="mr-sm-10">Current Salary</Label>
                                    <Controller
                                        name="currSalary"
                                        control={control}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="currSalary" thousandSeparator={true} prefix={'$'} />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmployer" className="mr-sm-10">Current Employer</Label>
                                    <Controller
                                        name="currEmployer"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmployer" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmployerContact" className="mr-sm-10">Current Employer Contact</Label>
                                    <Controller
                                        name="currEmployerContact"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmployerContact" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currEmployerPhone" className="mr-sm-10">Current Employer Phone</Label>
                                    <Controller
                                        name="currEmployerPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currEmployerPhone" />
                                        )}
                                    />
                                </div>
                            </div>
                        
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="prevEmployer" className="mr-sm-10">Previous Employer</Label>
                                    <Controller
                                        name="prevEmployer"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmployer" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevEmployerContact" className="mr-sm-10">Previous Employer Contact</Label>
                                    <Controller
                                        name="prevEmployerContact"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmployerContact" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevEmployerPhone" className="mr-sm-10">Previous Employer Phone</Label>
                                    <Controller
                                        name="prevEmployerPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevEmployerPhone" />
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
                                <div className="col-sm-5">
                                    <Label for="currStreet" className="mr-sm-10">Street</Label>
                                    <Controller
                                        name="currStreet"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="currStreet" />
                                        )}
                                    />
                                </div>
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
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="currState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="currState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="currState">
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj, idx) =>
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
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
                                <div className="col-sm-4">
                                    <Label for="currLandlord" className="mr-sm-10">Landlord Name</Label>
                                    <Controller
                                        name="currLandlord"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currLandlord" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currLandlordPhone" className="mr-sm-10">Landlord Phone</Label>
                                    <Controller
                                        name="currLandlordPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currLandlordPhone" />
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
                                <div className="col-sm-5">
                                    <Label for="prevStreet" className="mr-sm-10">Street</Label>
                                    <Controller
                                        name="prevStreet"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="prevStreet" />
                                        )}
                                    />
                                </div>
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
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="prevState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="prevState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="prevState">
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj, idx) =>
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
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
                                <div className="col-sm-4">
                                    <Label for="prevLandlord" className="mr-sm-10">Landlord Name</Label>
                                    <Controller
                                        name="prevLandlord"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevLandlord" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="prevLandlordPhone" className="mr-sm-10">Landlord Phone</Label>
                                    <Controller
                                        name="prevLandlordPhone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="prevLandlordPhone" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" color="primary" style={{marginTop: '1rem'}}>Update {name}</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    );
}

export default EditProspectApplicant;