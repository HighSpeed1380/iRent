import React, {useState, useEffect} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import Alert from '@material-ui/lab/Alert';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';
import * as tenantsAPI from '../../../Api/tenants';
import * as backgroundScreeningAPI from '../../../Api/backgroundScreening';
import * as encrypt from '../../Util/encrypt';

const RunBackgroundScreening = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user;
    const userID = user.id;
    const propertyID = login.selectedPropertyID;
    const company = login.company
    const companyID = company.id;
    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const othersOnLeaseID = props.location.state ? props.location.state.othersOnLeaseID : null;

    const [loading, setLoading] = useState(false);
    const [leadSourceCompanyID, setLeadSourceCompanyID] = useState(0);
    const [rhawaPackage, setRhawaPackage] = useState([]);
    const [applicantCC, setApplicantCC] = useState('');
    const [run, setRun] = useState(true);
    const [backgroundScreening, setBackgroundScreening] = useState(1);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const company = await applicantsAPI.getCompanyDetails(companyID);
            if(company !== null && parseInt(company.LeadSourceCompanyID) === 337) {
                setLeadSourceCompanyID(parseInt(company.LeadSourceCompanyID));
                // get RHAWA packages
                setRhawaPackage(await applicantsAPI.getBackgroundPackages(company));
                // get applicant credit card details
                const appCC = await applicantsAPI.getApplicantCreditCard(tenantID);
                    console.log(appCC)
                if(appCC !== null) {
                    const card = encrypt.decrypt(appCC.CardNumber);
                    setValue('cardFName', appCC.CardHolderFName);
                    setValue('cardLName', appCC.CardHolderLName);
                    setValue('cardNumber', '****' + card.substring(card.length-4));
                    setValue('cardType', appCC.CardType);
                    setValue('expMonth', appCC.CardExpMonth);
                    setValue('expYear', appCC.CardExpYear);
                    setValue('cardCVC', encrypt.decrypt(appCC.CardCVC));
                    setValue('billingAddress', appCC.CardAddress);
                    setValue('billingCity', appCC.CardCity);
                    setValue('billingState', appCC.CardState);
                    setValue('billingZip', appCC.CardPostalCode);

                    setApplicantCC(card);
                }
            }

            // applicant details
            let tenant = await tenantsAPI.getTenant(tenantID);
            let background = await tenantsAPI.getTenantBackground(tenantID);
            if(othersOnLeaseID !== 0) {
                tenant = null;
                background = null
            }
            const otherOnLease = await applicantsAPI.getTentOthersOnLeaseByID(othersOnLeaseID);
            if(tenant !== null) {
                setValue("firstName", tenant.TenantFName);
                setValue("middleName", tenant.TenantMName);
                setValue("lastName", tenant.TenantLName);
                setValue("ssn", tenant.SSN);
            } else {
                setValue("firstName", otherOnLease.FirstName);
                setValue("lastName", otherOnLease.LastName);
                setValue("ssn", otherOnLease.SSN);
            }
            if(otherOnLease !== null)
                setValue("dob", moment.utc(otherOnLease.DOB).format("YYYY-MM-DD"));
            else
                setValue("dob", moment.utc(background.DOB).format("YYYY-MM-DD"));

            if(background !== null) {
                setValue("currHouseNumber", background.HouseNumber !== null ? background.HouseNumber.toString() : '');
                setValue("currStreet", background.StreetName !== null ? background.StreetName : '');
                setValue("currUnit", background.Unit !== null ? background.Unit.toString() : '');
                setValue("currCity", background.City !== null ? background.City : '');
                setValue("currState", background.State !== null ? background.State : '');
                setValue("currZip", background.Zip !== null ? background.Zip : '');
                setValue("prevHouseNumber", background.HouseNumber2 !== null ? background.HouseNumber2.toString() : '');
                setValue("prevStreet", background.StreetName2 !== null ? background.StreetName2 : '');
                setValue("prevCity", background.City2 !== null ? background.City2 : '');
                setValue("prevState", background.State2 !== null ? background.State2 : '');
                setValue("prevZip", background.Zip2 !== null ? background.Zip2 : '');
                setValue("income", background.CurrentSalary !== null ? parseFloat(background.CurrentSalary).toFixed(2) : 0)
            }
            if(otherOnLease !== null) {
                setValue("driversLicense", otherOnLease.DriversLicense !== null ? otherOnLease.DriversLicense : '');
                setValue("dlState", otherOnLease.DLState !== null ? otherOnLease.DLState : '');
            } else {
                setValue("driversLicense", background.DriversLicense !== null ? background.DriversLicense : '');
                setValue("dlState", background.DLState !== null ? background.DLState : '');
            }

            const property = await applicantsAPI.getPropertyByID(propertyID);
            if(property !== null)
                setBackgroundScreening(parseInt(property.BackgroundScreening));

            setLoading(false);
        }
        fetchData();
    }, [companyID, tenantID, othersOnLeaseID, propertyID, setValue]);

    const submitForm = async (data) => {
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
        if(data.rhawaPackage !== undefined && parseInt(data.rhawaPackage) === 0) {
            NotificationManager.error("Please, select a package.", "Error");
            return;
        }
        setLoading(true);
        let orgName = '';
        let orgCode = '';
        if(companyID !== 27) {
            const company = await applicantsAPI.getCompanyDetails(companyID);
            if(parseInt(company.LeadSourceCompanyID) !== 337) {
                orgName = company.CompanyName;
                orgCode = company.BackgroundOrgCode;
            }
        }
        if(parseInt(backgroundScreening) !== 1) {
            // tazworks 
            const screeningDetails = await applicantsAPI.getRunBSDetails({
                propertyID,
                backgroundScreening: parseInt(data.rhawaPackage)
            });
            if(data.cardNumber !== undefined && data.cardNumber !== null) {
                if(data.cardNumber[0] === '*')  data.cardNumber = applicantCC;
            }

            const res = await backgroundScreeningAPI.request({
                TENANTID: tenantID,
                TENANTOTHERSONLEASEID: othersOnLeaseID,
                USERID: screeningDetails.UserID,
                PASSWORD: screeningDetails.Password,
                PACKAGENAME: screeningDetails.PackageName,
                REQUESTURL: screeningDetails.RequestURL,
                ORGANIZATIONNAME: orgName,
                ORGANIZATIONCODE: orgCode,
                REFERENCEID: propertyID,
                POSTALCODE: data.currZip,
                REGION: data.currState,
                MUNICIPALITY: data.currCity,
                ADDRESSLINE: `${data.currHouseNumber} ${data.currStreet}`,
                GIVENNAME: data.firstName,
                FAMILYNAME: data.lastName,
                MIDDLENAME: data.middleName !== undefined && data.middleName !== null ? data.middleName : '',
                EMAILADDRESS: data.email,
                SSN: data.ssn,
                DOB: moment.utc(data.dob).format("MM/DD/YYYY"),
                CARDHOLDERFIRSTNAME: data.cardFName !== undefined && data.cardFName !== null ? data.cardFName : '',
                CARDHOLDERLASTNAME: data.cardLName !== undefined && data.cardLName !== null ? data.cardLName : '',
                CARDTYPE: data.cardType !== undefined && data.cardType !== null ? data.cardType : '',
                CARDNUMBER: data.cardNumber !== undefined && data.cardNumber !== null ? data.cardNumber : '',
                CARDCVC: data.cardCVC !== undefined && data.cardCVC !== null ? data.cardCVC : '',
                CARDEXPMONTH: data.expMonth !== undefined && data.expMonth !== null ? data.expMonth : '',
                CARDEXPYEAR: data.expYear !== undefined && data.expYear !== null ? data.expYear : '',
                CARDPOSTALCODE: data.billingZip !== undefined && data.billingZip !== null ? data.billingZip : '',
                BILLINGSTREETADDRESS: data.billingAddress !== undefined && data.billingAddress !== null ? data.billingAddress : '',
                BILLINGCITY: data.billingCity !== undefined && data.billingCity !== null ? data.billingCity : '',
                BILLINGSTATE: data.billingState !== undefined && data.billingState !== null ? data.billingState : ''
            });
            setLoading(false)
            if(res === -1) {
                NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
                return;
            }
            if(res !== 0) {
                NotificationManager.error(res, "Error", 7000);
                return;
            }
            props.setRunBackground({ tenantID: 0, othersOnLeaseID: 0 });
            props.setUpdated(!props.updated);
        } else {
            if(data.income[0] === '$')  data.income = data.income.substring(1, data.income.length);
            if(data.currRent[0] === '$')  data.currRent = data.currRent.substring(1, data.currRent.length);
            console.log(data.currRent)
            // CIC
            const res = await backgroundScreeningAPI.requestCICReprot({
                propertyID,
                userID,
                tenantID,
                tenantOthersOnLeaseID: othersOnLeaseID,
                lastName: data.lastName,
                firstName: data.firstName,
                middleNameInit: data.middleName !== undefined && data.middleName !== null ? data.middleName.substring(0, 1) : '',
                suffix: data.suffix !== undefined ? data.suffix : '',
                dob: moment.utc(data.dob).format("MM-DD-YYYY"),
                ssn: data.ssn,
                monthlyIncome: parseInt(data.income.replace(",", "")),
                rent: parseInt(data.currRent.replace(",", "")),
                houseNumber: data.currHouseNumber,
                street: data.currStreet,
                unit: data.currUnit !== undefined && data.currUnit !== null ? data.currUnit : '',
                city: data.currCity,
                state: data.currState,
                zip: data.currZip,
            });
            setLoading(false);
            if(res === -1) {
                NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
                return;
            }
            if(res !== 0) {
                const errors = res[0]
                for(const key in errors) {
                    NotificationManager.error(`${key} - ${errors[key][0]}`, "Error", 7000)
                }
                return;
            }
            props.setRunBackground({ tenantID: 0, othersOnLeaseID: 0 });
            props.setUpdated(!props.updated);
        }
    }

    const renderRHAWA = () => {
        if(parseInt(leadSourceCompanyID) === 337) {
            return (
                <>
                    <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>RHAWA Customer</Alert>
                    <div className="row">
                        <div className="col-sm-3">
                            <Label for="rhawaPackage" className="mr-sm-10">Package</Label>
                            <Controller
                                name="rhawaPackage"
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} type="select" id="rhawaPackage">
                                        <option value="0">Select</option>
                                        {rhawaPackage.map((obj, idx) => 
                                            <option key={idx} value={obj.BackgroundScreeningsID}>{obj.PackageName}</option>
                                        )}
                                    </Input>
                                )}
                            />
                        </div>
                    </div>
                    <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Credit Card</Alert>
                    <div className="row">
                        <div className="col-sm-3">
                            <Label for="cardFName" className="mr-sm-10">First Name</Label>
                            <Controller
                                name="cardFName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="cardFName" style={Util.setErrorStyle(errors.cardFName)} />
                                )}
                            />
                            {errors.cardFName && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-3">
                            <Label for="cardLName" className="mr-sm-10">Last Name</Label>
                            <Controller
                                name="cardLName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="cardLName" style={Util.setErrorStyle(errors.cardLName)} />
                                )}
                            />
                            {errors.cardLName && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-4">
                            <Label for="cardNumber" className="mr-sm-10">Number</Label>
                            <Controller
                                name="cardNumber"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="cardNumber" style={Util.setErrorStyle(errors.cardNumber)} />
                                )}
                            />
                            {errors.cardNumber && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-3">
                            <Label for="cardType" className="mr-sm-10">Type</Label>
                            <Controller
                                name="cardType"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="select" id="cardType" style={Util.setErrorStyle(errors.cardType)}>
                                        <option value="amex">Amex</option>
                                        <option value="discover">Discover</option>
                                        <option value="mastercard">Mastercard</option>
                                        <option value="visa">Visa</option>
                                    </Input>
                                )}
                            />
                            {errors.cardType && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-2">
                            <Label for="expMonth" className="mr-sm-10">Expiration Month</Label>
                            <Controller
                                name="expMonth"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} placeholder="MM" type="number" id="expMonth" style={Util.setErrorStyle(errors.expMonth)} />
                                )}
                            />
                            {errors.expMonth && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-2">
                            <Label for="expYear" className="mr-sm-10">Expiration Year</Label>
                            <Controller
                                name="expYear"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} placeholder="YY" type="number" id="expYear" style={Util.setErrorStyle(errors.expYear)} />
                                )}
                            />
                            {errors.expYear && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-2">
                            <Label for="cardCVC" className="mr-sm-10">CVC</Label>
                            <Controller
                                name="cardCVC"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="cardCVC" style={Util.setErrorStyle(errors.cardCVC)} />
                                )}
                            />
                            {errors.cardCVC && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                    </div>
                    <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Billing Address</Alert>
                    <div className="row">
                        <div className="col-sm-4">
                            <Label for="billingAddress" className="mr-sm-10">Billing Address</Label>
                            <Controller
                                name="billingAddress"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="billingAddress" style={Util.setErrorStyle(errors.billingAddress)} />
                                )}
                            />
                            {errors.billingAddress && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-3">
                            <Label for="billingCity" className="mr-sm-10">Billing City</Label>
                            <Controller
                                name="billingCity"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="billingCity" style={Util.setErrorStyle(errors.billingCity)} />
                                )}
                            />
                            {errors.billingCity && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-3">
                            <Label for="billingState" className="mr-sm-10">State</Label>
                            <Controller
                                name="billingState"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="select" id="billingState" style={Util.setErrorStyle(errors.billingState)}>
                                        <option value="0">Select</option>
                                        {Constants.usStates.map((obj, idx) => {
                                            return <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                        })}
                                    </Input>
                                )}
                            />
                            {errors.billingState && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                        <div className="col-sm-2">
                            <Label for="billingZip" className="mr-sm-10">Billing Zip</Label>
                            <Controller
                                name="billingZip"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input {...field} type="number" id="billingZip" style={Util.setErrorStyle(errors.billingZip)} />
                                )}
                            />
                            {errors.billingZip && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </div>
                    </div>
                </>
            )
        }
        return <></>;
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Background Screening...`}
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
                        <span>Background and Credit Check</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
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
                                <div className="col-sm-3">
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
                                <div className="col-sm-3">
                                    <Label for="suffix" className="mr-sm-10">Suffix</Label>
                                    <Controller
                                        name="suffix"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="suffix" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="aka" className="mr-sm-10">AKA</Label>
                                    <Controller
                                        name="aka"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="aka" />
                                        )}
                                    />
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

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Current Residence</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="currHouseNumber" className="mr-sm-10">House Number</Label>
                                    <Controller
                                        name="currHouseNumber"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="currHouseNumber" style={Util.setErrorStyle(errors.currHouseNumber)} />
                                        )}
                                    />
                                    {errors.currHouseNumber && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-4">
                                    <Label for="currStreet" className="mr-sm-10">Street</Label>
                                    <Controller
                                        name="currStreet"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currStreet" style={Util.setErrorStyle(errors.currStreet)} />
                                        )}
                                    />
                                    {errors.currStreet && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="currUnit" className="mr-sm-10">Unit</Label>
                                    <Controller
                                        name="currUnit"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="currUnit" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="currCity" className="mr-sm-10">City</Label>
                                    <Controller
                                        name="currCity"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currCity" style={Util.setErrorStyle(errors.currCity)} />
                                        )}
                                    />
                                    {errors.currCity && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="currState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="currState"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="currState" style={Util.setErrorStyle(errors.currState)}>
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj, idx) =>
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                    {errors.currState && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="currZip" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="currZip"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="currZip" style={Util.setErrorStyle(errors.currZip)} />
                                        )}
                                    />
                                    {errors.currZip && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
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
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Additional Previous Residence</Alert>              
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="addPrevHouseNumber" className="mr-sm-10">House Number</Label>
                                    <Controller
                                        name="addPrevHouseNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="addPrevHouseNumber" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-4">
                                    <Label for="addPrevStreet" className="mr-sm-10">Street</Label>
                                    <Controller
                                        name="addPrevStreet"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="addPrevStreet" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="addPrevCity" className="mr-sm-10">City</Label>
                                    <Controller
                                        name="addPrevCity"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="addPrevCity" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="addPrevState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="addPrevState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="addPrevState">
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj, idx) =>
                                                    <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                )}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="addPrevZip" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="addPrevZip"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="addPrevZip" />
                                        )}
                                    />
                                </div>
                            </div>

                            <Alert severity="info" style={{marginBottom: '1rem', marginTop: '1rem'}}>Monthly Income and Rent</Alert>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="income" className="mr-sm-10">Income</Label>
                                    <Controller
                                        name="income"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="income" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.income)} />
                                        )}
                                    />
                                    {errors.income && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="currRent" className="mr-sm-10">Current Rent</Label>
                                    <Controller
                                        name="currRent"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} className="form-control" id="currRent" thousandSeparator={true} prefix={'$'} 
                                                style={Util.setErrorStyle(errors.currRent)} />
                                        )}
                                    />
                                    {errors.currRent && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
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
                            
                            {renderRHAWA()}
                            
                            <div className="row" style={{marginTop: '1.5rem'}}>
                                <div className="col-sm-12">
                                    <FormGroup>
                                        <FormControlLabel control={<Checkbox checked={!run} />} 
                                            label="Note - By clicking this checkbox your account will be charged." 
                                            onClick={() => setRun(!run)}
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '1rem'}} disabled={run}>Submit Report Request</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default RunBackgroundScreening;