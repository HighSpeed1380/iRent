import React, { useState, useEffect } from 'react';
import { Avatar, Button, FormGroup } from '@material-ui/core';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';
import TransferWithinAStation from '@material-ui/icons/TransferWithinAStation';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import userIMG from '../../Assets/img/user.jpg';
import TenantLedger from './TenantLedger';
import WorkOrders from './WorkOrders';
import CommentsNotes from './CommentsNotes';
import Reminders from './Reminders';
import EmergencyContact from './EmergencyContact';
import LeaseViolations from './LeaseViolations';
import ThreeDayNoticeToVacate from './ThreeDayNoticeToVacate';

const TenantDetails = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiprop = user.notifications.multiProp;
    const admin = user.securityLevel;

    const tenantID = props.location.state ? props.location.state.tenantID : null;

    const [ tenantDetails, setTenantDetails ] = useState({
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        unit: '',
        additionalLease: [],
        moveIn: null,
        tentativeMoveOut: null,
        leaseStart: null,
        leaseEnd: null,
        rentalAmount: 0,
        housingAmount: 0,
        petRent: 0,
        utilityCharge: 0,
        parkingCharge: 0,
        storageCharge: 0,
        tvCharge: 0,
        concessionAmount: 0,
        leadSource: '',
        leaseAgent: '',
        aplicationLink: '',
        screenings: [],
        vehicles: [],
        documents: [],
        forms: []
    });

    const [ tenantPropertyID, setTenantPropertyID ] = useState(0);
    const [ printable, setPrintable ] = useState([]);
    const [ selectedDoc, setSelectedDoc ] = useState(0);
    const [ formsPDF, setFormsPDF ] = useState(new Map());
    const [ threeDayNoticeAmt, setThreeDayNoticeAmt ] = useState(0);
    const [ loading, setLoading ] = useState(false);
    const [ tenants, setTenants ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/tenants/viewAll');
            }

            const tenantData = await tenantAPI.getTenant(tenantID);
            if(!tenantData || tenantData === undefined) return;
            const tenantUnit = await tenantAPI.getTenantUnit(tenantID);
            const othersOnLease = await tenantAPI.getOthersOnLease(tenantID);
            let othersLease = [];
            for(const ol of othersOnLease) {
                othersLease.push({
                    id: ol.TenantsOthersOnLeaseID, 
                    name: `${ol.FirstName} ${ol.LastName}`
                });
            }
            const leadSource = await tenantAPI.getLeadSource(tenantData.LeadSourceID === '' ? 0 : tenantData.LeadSourceID);
            const leaseAgent = await tenantAPI.getLeaseAgent(tenantData.UserID === '' ? 0 : tenantData.UserID)
            const tenantVehicles = await tenantAPI.getVehicles(tenantID);
            let vehicles = [];
            for(const v of tenantVehicles) {
                vehicles.push({
                    id: v.TenantVehicleID,
                    description: `${v.Color} ${v.Year} ${v.Make} ${v.Model} -- License: ${v.LicensePlate}`
                })
            }
            const getApplication = await tenantAPI.getApplication({
                tenantID,
                propertyID: parseInt(tenantData.PropertyID)
            });
            const creditReports = await tenantAPI.getCreditReport({
                tenantID,
                propertyID: parseInt(tenantData.PropertyID)
            });
            const documents = await tenantAPI.getDocuments(tenantID);
            const forms = await tenantAPI.getForms(tenantID);

            setTenantPropertyID(parseInt(tenantData.PropertyID));
            setTenantDetails({
                id: tenantData.TenantID,
                firstName: tenantData.TenantFName,
                lastName: tenantData.TenantLName,
                email: tenantData.TenantEmail,
                phone: tenantData.TenantPhone,
                unit: `${tenantUnit.UnitName} ${tenantUnit.UnitType}`,
                additionalLease: othersLease,
                moveIn: moment(tenantData.MoveInDate).format("MM/DD/YYYY"),
                tentativeMoveOut: moment(tenantData.MoveOutDate).format("MM/DD/YYYY"),
                leaseStart: moment(tenantData.LeaseStartDate).format("MM/DD/YYYY"),
                leaseEnd: moment(tenantData.LeaseEndDate).format("MM/DD/YYYY"),
                rentalAmount: parseFloat(tenantData.RentalAmount === '' ? 0 : tenantData.RentalAmount).toFixed(2),
                housingAmount: parseFloat(tenantData.HousingAmount === '' ? 0 : tenantData.HousingAmount).toFixed(2),
                petRent: parseFloat(tenantData.PetRent === '' ? 0 : tenantData.PetRent).toFixed(2),
                utilityCharge: parseFloat(tenantData.UtilityCharge === '' ? 0 : tenantData.UtilityCharge).toFixed(2),
                parkingCharge: parseFloat(tenantData.ParkingCharge === '' ? 0 : tenantData.ParkingCharge).toFixed(2),
                storageCharge: parseFloat(tenantData.StorageCharge === '' ? 0 : tenantData.StorageCharge).toFixed(2),
                tvCharge: parseFloat(tenantData.TVCharge === '' ? 0 : tenantData.TVCharge).toFixed(2),
                concessionAmount: parseFloat(tenantData.ConcessionAmount === '' ? 0 : tenantData.ConcessionAmount).toFixed(2),
                leadSource: leadSource.LeadSource === undefined ? '' : leadSource.LeadSource,
                leaseAgent: leaseAgent !== null ? `${leaseAgent.UserFName} ${leaseAgent.UserLName}` : '',
                aplicationLink: getApplication,
                screenings: creditReports,
                vehicles: vehicles,
                documents: documents,
                forms: forms
            });

            const listForms = await tenantAPI.getListForms({
                companyID,
                propertyID: parseInt(tenantData.PropertyID)
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
            setThreeDayNoticeAmt(await tenantAPI.get3DayNoticeAmt(parseInt(tenantData.PropertyID)));
            setTenants(await tenantAPI.getTenants({
                companyID,
                multiprop,
                userID,
                propertyID
            }));

            setLoading(false);
        }
        fetchData();
    }, [tenantID, companyID, userID, propertyID, multiprop, history]);

    const renderTransfer = () => {
        return (
            <IconButton
                aria-label="Transfer Tenant"
                onClick={() => {
                    const location = {
                        pathname: '/tenants/transfer',
                        state: { 
                            tenantID, 
                            tenantName: `${tenantDetails.firstName} ${tenantDetails.lastName}`,
                            unitName: tenantDetails.unit
                        }
                    }
                    history.push(location);
                }}
                style={{color: 'blue', maxHeight: '10px'}}
            >
                <TransferWithinAStation />
            </IconButton>
        );
    }

    const leaseDetails = () => {
        return (
            <p>
                <u style={{color: 'green'}}>Lease Details:</u><br/>
                Monthly Rent Amount (Tenant): <NumberFormat value={parseFloat(tenantDetails.rentalAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/>
                {tenantDetails.housingAmount !== 0 ? 
                    <><span>Monthly Rent Amount (Housing):</span> <NumberFormat value={tenantDetails.housingAmount} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
                {parseFloat(tenantDetails.petRent) !== 0 ? 
                    <><span>Pet Rent:</span> <NumberFormat value={parseFloat(tenantDetails.petRent).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
                {parseFloat(tenantDetails.utilityCharge) !== 0 ? 
                    <><span>Utility Charge:</span> <NumberFormat value={parseFloat(tenantDetails.utilityCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
                {parseFloat(tenantDetails.parkingCharge) !== 0 ? 
                    <><span>Parking Charge:</span> <NumberFormat value={parseFloat(tenantDetails.parkingCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
                {parseFloat(tenantDetails.storageCharge) !== 0 ? 
                    <><span>Storage Charge:</span> <NumberFormat value={parseFloat(tenantDetails.storageCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
                {parseFloat(tenantDetails.tvCharge) !== 0 ? 
                    <><span>TV Charge:</span> <NumberFormat value={parseFloat(tenantDetails.tvCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
                {parseFloat(tenantDetails.concessionAmount) !== 0 ? 
                    <><span>Recurring Concession:</span> <NumberFormat value={parseFloat(tenantDetails.concessionAmount).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} /> <br/></>:
                    ``
                }
            </p>
        );
    }

    const renderLeadSourceAgent = () => {
        return (
            <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                {tenantDetails.leadSource !== '' ? 
                    <>
                        <span>Lead Source: {tenantDetails.leadSource} <br/> Original Leasing Agent: {tenantDetails.leaseAgent}</span><br/>
                    </> : 
                    <span>Original Leasing Agent: {tenantDetails.leaseAgent}</span>
                }
            </li>
        );
    }

    const renderDocuments = () => {
        if(tenantDetails.aplicationLink === '' && tenantDetails.screenings.length === 0)    return;
        return (
            <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                <u style={{color: 'green'}}>Documents:
                    {tenantDetails.aplicationLink !== '' ? 
                        <li><a href={tenantDetails.aplicationLink} target="_blank" rel="noreferrer">Application</a></li> : ''
                    }
                    {tenantDetails.screenings.map( (values) => {
                        return <li><a href={values.link} target="_blank" rel="noreferrer">{values.name}</a></li>
                    })}
                    {tenantDetails.documents.map( (values) => {
                        const link = `./TenantFiles/${values.PropertyID}/${tenantID}/${encodeURIComponent(values.DocumentName, 'utf-8')}`;
                        return <li><a href={link} target="_blank" rel="noreferrer">{values.DocumentType}</a></li>
                    })}
                    {tenantDetails.forms.map( (values) => {
                        const title = `Electronically Signed: ${moment(values.dateTime).format("MM/DD/YYYY")}`
                        return <li><a href={values.link} target="_blank" title={title} rel="noreferrer">{values.name}</a></li>
                    })}
                </u>
            </li>
        );
    }

    const renderAdditionalLease = () => {
        return (
            <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                <u style={{color: 'green'}}>
                    Additional Lease Holder:
                    <IconButton
                        aria-label="Print"
                        onClick={() => {
                            const location = {
                                pathname: '/tenants/addLeaseHolder',
                                state: { 
                                    tenantID, 
                                    tenantName: `${tenantDetails.firstName} ${tenantDetails.lastName}`
                                }
                            }
                            history.push(location);
                        }}
                        style={{color: 'blue', maxHeight: '10px'}}
                    >
                        <AddCircleOutline />
                    </IconButton>
                    {tenantDetails.additionalLease.map( (values) => {
                        return <li><a href={values.id} target="_blank" rel="noreferrer">{values.name}</a></li>
                    })}
                </u>
            </li>
        );
    }

    const renderVehicles = () => {
        return (
            <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                <u>
                    <span style={{color: 'green'}}>Vehicles:</span>
                    <IconButton
                        aria-label="Vehicle"
                        onClick={() => {
                            const location = {
                                pathname: '/tenants/addVehicle',
                                state: { 
                                    tenantID, 
                                    tenantName: `${tenantDetails.firstName} ${tenantDetails.lastName}`
                                }
                            }
                            history.push(location);
                        }}
                        style={{color: 'blue', maxHeight: '10px'}}
                    >
                        <AddCircleOutline />
                    </IconButton>
                    {tenantDetails.vehicles.map( (values) => {
                        return <li>{values.description}</li>
                    })}
                </u>
            </li>
        );
    }

    const renderPrintableDocs = () => {
        const renderAmt = () => {
            if(parseInt(selectedDoc) === 4) {
                return (
                    <FormGroup className="mr-10 mb-10">
                        <Input type="number" name="3DayNoticeThresholdAmount" id="3DayNoticeThresholdAmount" 
                            value={threeDayNoticeAmt} onChange={(e) => setThreeDayNoticeAmt(e.target.value)}
                        />
                    </FormGroup>
                );
            }
        }
        return (
            <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                <Form>
                    <FormGroup className="mr-10 mb-10">
                        <Label for="printableDoc" className="mr-sm-10" style={{color: 'green'}}><u>Printable Docs</u></Label>
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
                    {renderAmt()}
                    <Button className="btn btn-primary" onClick={openDoc}>Open Document</Button>
                </Form>
            </li>
        );
    }

    const openDoc = async () => {
        if(parseInt(selectedDoc) === 0) {
            NotificationManager.error("Please select a document.", "Error");
            return;
        }
        if(parseInt(selectedDoc) === 4 && (isNaN(threeDayNoticeAmt) || threeDayNoticeAmt < 0 || threeDayNoticeAmt === '')) {
            NotificationManager.error("Please enter a valid 3 Day Notice Amount.", "Error");
            return;
        }
        if(formsPDF.get(parseInt(selectedDoc))) {
            // PDF
            const url = `./RHAWA-PDF/${parseInt(selectedDoc)}`;
            window.open(url, '_blank');
        } else {
            await localStorage.setItem("tenantID", tenantID);
            await localStorage.setItem("formsCreatorID", selectedDoc);
            history.push('/printable/openForm');
        }
    }

    const updateSelecetdTenant = (id) => {
        setLoading(true);
        const location = {
            pathname: '/tenants/details',
            state: { tenantID: parseInt(id) }
        }
        history.replace(location);
        setLoading(false);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            )
        } else {
            const renderPhone = () => {
                if(tenantDetails.phone !== '') {
                    const linkPhone = `tel:${tenantDetails.phone}`;
                    return (
                        <>
                            <a href={linkPhone} className="fs-14 text-dark">
                                Phone: <u style={{color: 'blue'}}><NumberFormat displayType={'text'} value={tenantDetails.phone} format="+1 (###) ###-####" mask="_"/></u>
                            </a>
                        </>
                    );
                }
            }
            return (
                <>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard fullBlock customClasses="overflow-hidden">
                                <div className="user-profile-widget">
                                    <div className="bg-primary py-70"></div>
                                    <div className="p-20">
                                        <div className="d-flex user-avatar">
                                            <Avatar
                                                alt="user 2"
                                                src={userIMG}
                                                className="size-100 rounded-circle mr-15"
                                            />
                                            <div className="user-info text-white pt-20">
                                                <h4 className="mb-0">ID: {tenantDetails.id} Tenant: {tenantDetails.firstName} {tenantDetails.lastName}</h4>
                                                <span>
                                                    Unit: {tenantDetails.unit} <br/>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 col-md-4 col-xl-4">
                                                <ul className="list-unstyled my-25">
                                                    <li className="border-bottom py-10 d-flex align-items-center">
                                                        <i className="zmdi zmdi-email mr-10 fs-14"></i>
                                                        <a href="mail-to:phoebe@gmail.com" className="fs-14 text-dark">Email: <u style={{color: 'blue'}}>{tenantDetails.email}</u></a>
                                                        <i className="zmdi zmdi-phone mr-10 fs-14" style={{paddingLeft: '6px'}}></i>
                                                        {renderPhone()}
                                                    </li>
                                                    {renderAdditionalLease()}
                                                    <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                                                        <p>
                                                            <u style={{color: 'green'}}>Dates:</u><br/>
                                                            Move In: {tenantDetails.moveIn} <br/>
                                                            Tentative Move Out: {tenantDetails.tentativeMoveOut} <br/>
                                                            Lease Start Date: {tenantDetails.leaseStart} <br/>
                                                            Lease End Date: {tenantDetails.leaseEnd} 
                                                        </p>
                                                    </li>
                                                    {renderLeadSourceAgent()}
                                                </ul>
                                            </div>
                                            <div className="col-sm-4 col-md-4 col-xl-4">
                                                <ul className="list-unstyled my-25">
                                                    <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                                                        Transfer: {renderTransfer()} {' '} {/*Move Out: {moveOut()}*/}
                                                    </li>
                                                    <li className="border-bottom py-10 fs-14 d-flex align-items-center">
                                                        {leaseDetails()}
                                                    </li>
                                                    {renderDocuments()}
                                                </ul>
                                            </div>
                                            <div className="col-sm-4 col-md-4 col-xl-4">
                                                <ul className="list-unstyled my-25">
                                                    {renderVehicles()}
                                                    {renderPrintableDocs()}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                className="text-white mr-10 mb-10 btn-xs"
                                                onClick={() => {
                                                    const location = {
                                                        pathname: '/tenants/editTenant',
                                                        state: { 
                                                            tenantID, 
                                                            tenantName: `${tenantDetails.firstName} ${tenantDetails.lastName}`
                                                        }
                                                    }
                                                    history.push(location);
                                                }}
                                            >
                                                Edit {tenantDetails.firstName} {tenantDetails.lastName}
                                            </Button>
                                            <div style={{paddingLeft: '15px'}}>
                                                <InputLabel htmlFor="age-simple">Select another tenant</InputLabel>
                                                <Select value={parseInt(tenantDetails.id)} onChange={(event) => updateSelecetdTenant(event.target.value)}>
                                                    {tenants.map((obj) => {
                                                        return (
                                                            <MenuItem key={parseInt(obj.TenantID)} value={parseInt(obj.TenantID)}>
                                                                {obj.UnitName} - {obj.TenantFName} {obj.TenantLName}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                </>
            );
        }
    }

    const fullName = `${tenantDetails.firstName} ${tenantDetails.lastName}`;
    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" onClick={() => history.push("/tenants/viewAll")} style={{cursor: 'pointer'}}>
                        </i>
                        <h2>
                            <span>Tenant Details</span>
                        </h2>
                    </div>
                </div>
                {render()}
                
                <TenantLedger tenantID={tenantID} admin={admin} tenantName={fullName} 
                    propertyID={tenantPropertyID} userID={userID} companyID={companyID} />
                <div style={{marginTop: '20px'}}></div>
                <WorkOrders tenantID={tenantID} admin={admin} />
                <div style={{marginTop: '20px'}}></div>
                <CommentsNotes tenantID={tenantID} userID={userID} />
                <div style={{marginTop: '20px'}}></div>
                <Reminders tenantID={tenantID} userID={userID} admin={admin} />
                <div style={{marginTop: '20px'}}></div>
                <EmergencyContact tenantID={tenantID} admin={admin} />
                <div style={{marginTop: '20px'}}></div>
                <LeaseViolations tenantID={tenantID} admin={admin} />
                <div style={{marginTop: '20px'}}></div>
                <ThreeDayNoticeToVacate tenantID={tenantID} admin={admin} />
            </div>
        </Main>
    )
}

export default TenantDetails;