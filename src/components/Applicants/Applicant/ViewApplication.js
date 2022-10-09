import React, {useState, useEffect} from 'react';
import moment from 'moment';
import { Button, Label } from 'reactstrap';
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as applicantsAPI from '../../../Api/applicants';
import * as tenantsAPI from '../../../Api/tenants';

const ViewApplication = (props) => {
    const history = useHistory();
    const tenantID = props.location.state ? props.location.state.tenantID : null;

    const [loading, setLoading] = useState(false);
    const [applicantData, setApplicantData] = useState({})
    const [othersOnLease, setOthersOnLease] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [references, setReferences] = useState([]);

    useEffect(() => {  
        async function fetchData() {
            if(tenantID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            const tenant = await tenantsAPI.getTenant(tenantID);
            const background = await tenantsAPI.getTenantBackground(tenantID);
            const unitType = await applicantsAPI.getTenantUnitType(parseInt(tenant.UnitTypeID));
            const leadSource = await applicantsAPI.getTenantLeadSource(parseInt(tenant.LeadSourceID));
            let currAddress = '';
            if(background !== null) {
                currAddress += `${background.HouseNumber} ${background.StreetName}`
                if(background.Unit !== '')  currAddress += ` ${background.Unit}`;
                currAddress += `, ${background.City}, ${background.State} ${background.Zip}`
            }
            let prevAddress = '';
            if(background !== null) {
                prevAddress += `${background.HouseNumber2} ${background.StreetName2}`
                if(background.Unit2 !== '')  prevAddress += ` ${background.Unit2}`;
                prevAddress += `, ${background.City2}, ${background.State2} ${background.Zip2}`
            }
            setApplicantData({
                firstName: tenant !== null ? tenant.TenantFName : '',
                lastName: tenant !== null ? tenant.TenantLName : '',
                phone: tenant !== null ? tenant.TenantPhone : '',
                email: tenant !== null ? tenant.TenantEmail : '',
                ssn: tenant !== null ? tenant.SSN : '',
                dob: background !== null ? moment.utc(background.DOB).format("MM/DD/YYYY") : '',
                driversLicense: background !== null ? background.DriversLicense : '',
                dlState: background !== null ? background.DLState : '',
                formerName: background !== null ? background.FormerName : '',
                businessName: background !== null ? background.BusinessName : '',
                unitType: unitType !== null ? unitType.UnitType : '',
                desireMoveInDate: background !== null && background.DesiredMoveInDate !== '' ? moment.utc(background.DesiredMoveInDate).format("MM/DD/YYYY") : '',
                desireLeaseTerm: background !== null ? background.DesiredLeaseTerm : '',
                leadSource: leadSource !== null ? leadSource.LeadSource : '',
                desiredRent: background !== null && background.DesiredRent !== null ? `$${parseFloat(background.DesiredRent).toFixed(2)}` : '',
                onLease: tenant !== null ? tenant.OnLease : '',
                currAddress: currAddress,
                currOcupType: background !== null ? background.CurrentOccupancyType : '',
                currMoveIn: background !== null && background.CurrentAddressMoveIn !== '' ? moment.utc(background.CurrentAddressMoveIn).format("MM/DD/YYYY") : '',
                movingReason: background !== null ? background.LastMoveReason : '',
                currLandlordName: background !== null ? background.LastLandlordName : '',
                currLandlordPhone: background !== null ? background.LastLandlordPhone : '',
                currLandlordEmail: background !== null ? background.LastLandLordEmail : '',
                currContactLandlord: background !== null ? parseInt(background.LastLandLordContact) === 1 ? "Yes" : "No" : 'No',
                prevAddress: prevAddress,
                prevLandlordName: background !== null ? background.PreviousLandlordName : '',
                prevLandlordPhone: background !== null ? background.PreviousLandlordPhone : '',
                prevMoveIn: background !== null && background.PreviousAddressMoveIn !== null ? moment.utc(background.PreviousAddressMoveIn).format("MM/DD/YYYY") : '',
                prevMoveOut: background !== null && background.PreviousAddressMoveOUt !== null ? moment.utc(background.PreviousAddressMoveOUt).format("MM/DD/YYYY") : '',
                currEmpKind: background !== null ? background.CurrentEmployeerStatus : '',
                currEmpSelf: background !== null ? parseInt(background.CurrentSelfEmployment) === 1 ? "Yes" : "No" : 'No',
                currEmpAddress: background !== null ? background.CurrentEmployeerAddress : '',
                currEmpSupervisor: background !== null ? background.CurrentEmployer : '',
                currEmpEmail: background !== null ? background.CurrentEmployeerEmail : '',
                currEmpPhone: background !== null ? background.CurrentEmployerPhone : '',
                currEmpPosition: background !== null ? background.CurrentEmployeerPosition : '',
                currEmpStartDate: background !== null && background.CurrentEmployeerStartDate !== null ? moment.utc(background.CurrentEmployeerStartDate).format("MM/DD/YYYY") : '',
                currEmpIncome: background !== null && background.CurrentSalary !== null ? `$${parseFloat(background.CurrentSalary).toFixed(2)}` : '',
                currEmpCompName: background !== null ? background.CurrentCompanyName : '',
                prevEmpKind: background !== null ? background.PreviousEmploymentType : '',
                prevEmpSelf: background !== null ? parseInt(background.PreviousSelfEmployment) === 1 ? "Yes" : "No" : 'No',
                prevEmpAddress: background !== null ? background.PreviousEmployeerAddress : '',
                prevEmpSupervisor: background !== null ? background.PreviousEmployerContact : '',
                prevEmpEmail: background !== null ? background.PreviousEmployeerEmail : '',
                prevEmpPhone: background !== null ? background.PreviousEmployerPhone : '',
                prevEmpPosition: background !== null ? background.PreviousEmployeerPosition : '',
                prevEmpStartDate: background !== null && background.PreviousEmployeerStartDate !== null ? moment.utc(background.PreviousEmployeerStartDate).format("MM/DD/YYYY") : '',
                prevEmpEndDate: background !== null && background.PreviousEmployeerEndDate !== null ? moment.utc(background.PreviousEmployeerEndDate).format("MM/DD/YYYY") : '',
                prevEmpIncome: background !== null && background.PreviousEmployeerIncome !== null ? `$${parseFloat(background.PreviousEmployeerIncome).toFixed(2)}` : '',
                prevEmpCompName: background !== null ? background.PreviousCompanyName : '',
                incomeSources: background !== null ? background.OtherIncome : '',
                bankName: background !== null ? background.ProspectBank : '',
                bankPhone: background !== null ? background.ProspectBankPhone : '',
                accountNumber: background !== null ? background.prospectBankAccount : '',
                emergencyName: background !== null ? background.EmergencyName : '',
                emergencyRelantionship: background !== null ? background.EmergencyRelationship : '',
                emergencyPhone: background !== null ? background.EmergencyPhone : '',
                emergencyEmail: background !== null ? background.EmergencyEmail : '',
                comments: background !== null ? background.ProspectComments : '',
            });
            setOthersOnLease(await applicantsAPI.getOthersOnLease(tenantID));
            setVehicles(await applicantsAPI.getTenantVehicles(tenantID));
            setReferences(await applicantsAPI.getTenantReferences(tenantID));
            setLoading(false);
        }
        fetchData();
    }, [tenantID, history])

    const renderOthersOnLease = () => {
        if(othersOnLease.length === 0)   return <>None</>;

        return (
            <>
                <table className="table table-striped table-bordered">
                    <thead>
						<tr>
						  <th>First Name</th>
						  <th>Last Name</th>
						  <th>Phone</th>
						  <th>eMail</th>
						  <th>SSN</th>
						  <th>DOB</th>
						  <th>Drivers License</th>
						  <th>Drivers License State</th>
						</tr>
					</thead>
                    <tbody>
                        {othersOnLease.map((obj, idx) => {
                            return (
                                <tr key={idx}>
                                    <td>{obj.FirstName}</td>
									<td>{obj.LastName}</td>
									<td>{obj.Phone}</td>
									<td>{obj.eMail}</td>
									<td>{obj.SSN}</td>
									<td>{moment.utc(obj.DOB).format("MM/DD/YYYY")}</td>
									<td>{obj.DriversLicense}</td>
									<td>{obj.DLState}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </>
        )
    }

    const renderVehicles = () => {
        if(vehicles.length === 0)   return <>None</>

        return (
            <>
                <table className="table table-striped table-bordered">
                    <thead>
						<tr>
						  <th>Make</th>
						  <th>Model</th>
						  <th>Year</th>
						  <th>Color</th>
						  <th>License Plate</th>
						  <th>License Plate State</th>
						</tr>
					</thead>
                    <tbody>
                        {vehicles.map((obj, idx) => {
                            return (
                                <tr key={idx}>
                                    <td>{obj.Make}</td>
									<td>{obj.Model}</td>
									<td>{obj.Year}</td>
									<td>{obj.Color}</td>
									<td>{obj.LicensePlate}</td>
									<td>{obj.State}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </>
        )
    }

    const renderReferences = () => {
        if(references.length === 0)   return <>None</>

        return (
            <>
                <table className="table table-striped table-bordered">
                    <thead>
						<tr>
						  <th>Name</th>
						  <th>Relationship</th>
						  <th>Occupation</th>
						  <th>Address</th>
						  <th>Phone</th>
						  <th>eMail</th>
						</tr>
					</thead>
                    <tbody>
                        {references.map((obj, idx) => {
                            return (
                                <tr key={idx}>
                                    <td>{obj.Name}</td>
									<td>{obj.Relationship}</td>
									<td>{obj.Occupation}</td>
									<td>{obj.Address}</td>
									<td>{obj.Phone}</td>
									<td>{obj.Email}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </>
        )
    }

    const print = () => {
        var content = document.getElementById("contentToPrint").innerHTML;
        var mywindow = window.open('', 'Print', 'height=600,width=800');
                                        
        mywindow.document.write('<html>');
        mywindow.document.write('<head>');
        mywindow.document.write('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">');
        mywindow.document.write('</head>');
        mywindow.document.write(content);
        mywindow.document.write('</html>');
        mywindow.document.close();
        mywindow.focus()
        mywindow.print();
        //mywindow.close();
        return true;     
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Application...`}
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
                        <span>Application</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <Button type="button" color="primary" style={{marginLeft: '2rem', marginBottom: '1.5rem'}} onClick={print}>
                    Print Application
                </Button>
            </div>
            <div id="contentToPrint">
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Applicant Information">
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Prospect First Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.firstName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Prospect Last Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.lastName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.phone}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>eMail: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.email}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>SSN: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.ssn}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>DOB: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.dob}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Driver's License: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.driversLicense}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>DL State: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.dlState}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-6">
                                <Label className="mr-sm-10">
                                    <b>Former Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.formerName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-6">
                                <Label className="mr-sm-10">
                                    <b>Business Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.businessName}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Property Information">
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Interes: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.unitType}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Desire Move In: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.desireMoveInDate}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Desired Lease Term: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.desireLeaseTerm}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Lead Source: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.leadSource}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Specified Rent: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.desiredRent}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-10">
                                <Label className="mr-sm-10">
                                    <b>Others On Lease: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.onLease}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Others Responsible on Lease">
                        {renderOthersOnLease()}
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Current Address">
                        <div className="row">
                            <div className="col-sm-4">
                                <Label className="mr-sm-10">
                                    <b>Current Address: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currAddress}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Current Occupancy Type: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currOcupType}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Move In: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currMoveIn}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Reason for Moving: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.movingReason}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Landlord Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currLandlordName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Landlord Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currLandlordPhone}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Landlord Email: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currLandlordEmail}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Contact Landlord: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currContactLandlord}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Previous Address">
                        <div className="row">
                            <div className="col-sm-4">
                                <Label className="mr-sm-10">
                                    <b>Previous Residence: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevAddress}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Previous Landlord Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevLandlordName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Previous Landlord Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevLandlordPhone}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Move in: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevMoveIn}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Move out: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevMoveOut}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Current Employer">
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Kind: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpKind}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Self Employed: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpSelf}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-4">
                                <Label className="mr-sm-10">
                                    <b>Employer Address: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpAddress}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Supervisor: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpSupervisor}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Supervisor Email: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpEmail}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Supervisor Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpPhone}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Position: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpPosition}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Start Date: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpStartDate}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Income: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpIncome}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-4">
                                <Label className="mr-sm-10">
                                    <b>Company Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.currEmpCompName}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Previous Employer">
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Kind: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpKind}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Self Employed: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpSelf}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-4">
                                <Label className="mr-sm-10">
                                    <b>Employer Address: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpAddress}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Supervisor: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpSupervisor}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Supervisor Email: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpEmail}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Supervisor Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpPhone}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Position: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpPosition}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Start Date: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpStartDate}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>End Date: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpEndDate}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-2">
                                <Label className="mr-sm-10">
                                    <b>Income: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpIncome}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-4">
                                <Label className="mr-sm-10">
                                    <b>Company Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.prevEmpCompName}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Other Sources of Income">
                        <div className="row">
                            <div className="col-sm-12">
                                <Label className="mr-sm-10">
                                    <b>Income Sources: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.incomeSources}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Vehicles">
                        {renderVehicles()}
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Bank Account">
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Bank Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.bankName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Bank Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.bankPhone}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Account Number: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.accountNumber}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Personal References">
                        {renderReferences()}
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Emergency Contact">
                        <div className="row">
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Name: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.emergencyName}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Relationship: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.emergencyRelantionship}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>Phone: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.emergencyPhone}</i></span>
                                </Label>
                            </div>
                            <div className="col-sm-3">
                                <Label className="mr-sm-10">
                                    <b>eMail: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.emergencyEmail}</i></span>
                                </Label>
                            </div>
                        </div>
                        <hr />
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Prospect Comments">
                        <div className="row">
                            <div className="col-sm-12">
                                <Label className="mr-sm-10">
                                    <b>Comments: </b> <span style={{paddingLeft: '2rem', color: 'blue'}}><i>{applicantData.comments}</i></span>
                                </Label>
                            </div>
                        </div>
                    </RctCollapsibleCard>
                </div>
            </div>
            </div>
        </Main>
    )
}

export default ViewApplication;