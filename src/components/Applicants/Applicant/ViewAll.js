import React, {useState, useEffect} from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import MatButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import HourglassFullTwoTone from '@material-ui/icons/HourglassFullTwoTone';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import DeleteForever from '@material-ui/icons/DeleteForever';
import SweetAlert from 'react-bootstrap-sweetalert';
import { NotificationManager } from 'react-notifications';
import Alert from '@material-ui/lab/Alert';
import { Input } from 'reactstrap';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';
import * as tenantsAPI from '../../../Api/tenants';
import Review from './Review';

const ViewAll = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const company = login.company
    const companyID = company.id;

    const [loading, setLoading] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [deleteApplicant, setDeleteApplicant] = useState(0);
    const [reviewTenantID, setReviewTenantID] = useState(0);
    const [reviewData, setReviewData] = useState({});
    const [screeningReports, setScreeningReports] = useState(new Map())
    const [unitName, setUnitName] = useState("");
    const [updated, setUpdated] = useState(false);
    const [vacantUnits, setVacantUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(0);
    const [needToSignUp, setNeedToSignUp] = useState(true);
    const [leadSourceCompanyID, setLeadSourceCompanyID] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const getApplicants = await applicantsAPI.getApplicants(propertyID);
            setScreeningReports(new Map(Object.entries(getApplicants.backgroundScreening)));
            const arr = [];
            for(const a of getApplicants.applicants) {
                arr.push({
                    dateEntered: moment.utc(a.ProspectStartDate).format("MM/DD/YYYY"),
                    name: a,
                    preLeased: a,
                    phone: a.TenantPhone,
                    email: a.TenantEmail,
                    interest: a.UnitType,
                    leasingAgent: a,
                    comments: a.ProspectComments,
                    delete: a.TenantID,
                    creditCheck: a,
                    review: a,
                    convert: a
                });
            }
            setApplicants(arr);
            const vacantU = await tenantsAPI.getVacantUnitsByProperty(propertyID);
            if(vacantU.length > 0) {
                setSelectedUnit(vacantU[0].UnitID);
                setUnitName(vacantU[0].UnitName)
            }
            setVacantUnits(vacantU);
            setNeedToSignUp(await applicantsAPI.companyNeedToSignUpScreening(companyID));
            const getCompany = await applicantsAPI.getCompanyDetails(companyID);
            if(getCompany)
                setLeadSourceCompanyID(parseInt(getCompany.LeadSourceCompanyID));
            setLoading(false);
        }
        fetchData();
    }, [propertyID, companyID, updated])

    const columns = [
        { name: 'dateEntered', label: 'Date Entered', },
        { name: 'name', label: 'Name', 
            options: {
                customBodyRender: (value) => {
                    const leaseHodlers = screeningReports.get(value.TenantID.toString()) || [];
                    if(value !== '') {
                        return (
                            <ul>
                                {(leaseHodlers).map((obj, idx) => {
                                    const renderName = () => {
                                        if(obj.name === null) {
                                            return (
                                                <MatButton color="primary" onClick={() => {
                                                    const location = {
                                                        pathname: '/prospects/edit',
                                                        state: { 
                                                            tenantID: parseInt(value.TenantID),
                                                            name: "Applicant"
                                                        }
                                                    }
                                                    history.push(location);
                                                }}>
                                                    {value.TenantFName} {value.TenantMName} {value.TenantLName}
                                                </MatButton>
                                            )
                                        }
                                        return (
                                            <MatButton color="primary" onClick={() => {
                                                const location = {
                                                    pathname: '/applicants/viewReport',
                                                    state: { 
                                                        tenantID: parseInt(value.TenantID),
                                                        name: `${value.TenantFName} ${value.TenantLName}`
                                                    }
                                                }
                                                history.push(location);
                                            }} style={{height: '1rem'}}>
                                                {obj.name}
                                            </MatButton>
                                        );
                                    }
                                    return (
                                        <li key={idx}>
                                            {renderName()}
                                        </li>
                                    );
                                })}
                            </ul>
                        )
                    }
                }
            }
        },
        { name: 'preLeased', label: 'Pre Leased', 
            options: {
                customBodyRender: (value) => {
                    if(value.UnitName !== null) {
                        return `${value.UnitName} - ${moment.utc(value.PMoveInDate).format("MM/DD/YYYY")}`
                    }
                }
            }
        },
        { name: 'phone', label: 'Phone', 
            options: {
                customBodyRender: (value) => {
                    if(value !== '') {
                        return (
                            <a href={`tel:${value}`}>
                                <NumberFormat value={value} format="(###) ###-####" displayType={'text'} />
                            </a>
                        );
                    }
                }
            }
        },
        { name: 'email', label: 'Email', 
            options: {
                customBodyRender: (value) => {
                    if(value !== '')
                        return <a href={`mailto:${value}`}>{value}</a>;
                }
            },
        },
        { name: 'interest', label: 'Interest', },
        { name: 'leasingAgent', label: 'Leasing Agent', 
            options: {
                customBodyRender: (value) => {
                    const name = value.UserFName !== null ? `${value.UserFName} ${value.UserLName}` : 'External Applicant'
                    return (
                        <>
                            {name}
                            <MatButton className="text-primary mr-10 mb-10"
                                onClick={() => {
                                    const location = {
                                        pathname: '/applicants/viewApplication',
                                        state: { 
                                            tenantID: parseInt(value.TenantID),
                                        }
                                    }
                                    history.push(location);
                                }}
                            >
                                View Application
                            </MatButton>
                        </>
                    )
                }
            }
        },
        { name: 'comments', label: 'Comments', },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                setDeleteApplicant(parseInt(value))
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    )
                }
            },
        },
        { name: 'creditCheck', label: 'Credit Check', 
            options: {
                customBodyRender: (value) => {
                    const renderCreditCheck = () => {
                        // check if need to SignUp
                        if(needToSignUp) {
                            return <MatButton className="text-primary mr-10 mb-10"
                                        onClick={() => {
                                            console.log(leadSourceCompanyID);
                                            if(leadSourceCompanyID && leadSourceCompanyID === 19) {
                                                // navigate to 
                                                const url = `http://zipreports.com/zipapp.php?apptype=pg_company&promocode=TENANTFILE`;
                                                window.open(url, '_blank');
                                            } else {
                                                const location = {
                                                    pathname: '/applicants/signupBackground',
                                                }
                                                history.push(location);
                                            }
                                        }}
                                    >
                                        Signup
                                    </MatButton>
                        }

                        let reports = screeningReports.get(value.TenantID.toString()) || [];
                        return (
                            <ul>
                                {reports.map((obj, idx) => {
                                    const name = obj.name === null ? `${value.TenantFName} ${value.TenantLName}` : obj.name
                                    const renderAction = () => {
                                        if(obj.report === null) {
                                            return (
                                                <IconButton 
                                                    onClick={() => {
                                                        if(obj.name === null) {
                                                            const location = {
                                                                pathname: '/applicants/runBackgroundScreening',
                                                                state: { 
                                                                    tenantID: parseInt(value.TenantID),
                                                                    othersOnLeaseID: 0
                                                                }
                                                            }
                                                            history.push(location);
                                                        } else {
                                                            const location = {
                                                                pathname: '/applicants/runBackgroundScreening',
                                                                state: { 
                                                                    tenantID: parseInt(value.TenantID),
                                                                    othersOnLeaseID: parseInt(obj.othersOnLeaseID)
                                                                }
                                                            }
                                                            history.push(location);
                                                        }
                                                    }}
                                                    style={{height: '1.5rem'}}
                                                >
                                                    <FindInPageOutlinedIcon />
                                                </IconButton>
                                            )
                                        }
                                        if(obj.report[0].StatusCode !== undefined && parseInt(obj.report[0].StatusCode) === 0) {
                                            return (
                                                <IconButton style={{height: '1.5rem'}}
                                                    onClick={() => NotificationManager.warning("Report is pending!")}
                                                >
                                                    <HourglassFullTwoTone style={{color: 'blue'}} />
                                                </IconButton>
                                            )
                                        }
                                        return (
                                            <IconButton 
                                                onClick={() => {
                                                    if(obj.report[0].OrderID === undefined) {
                                                        const location = {
                                                            pathname: '/applicants/viewReport',
                                                            state: { 
                                                                isCIC: true,
                                                                key: obj.report[0].Key,
                                                                reportID: obj.report[0].ReportID
                                                            }
                                                        }
                                                        history.push(location);
                                                    } else {
                                                        const location = {
                                                            pathname: '/applicants/viewReport',
                                                            state: { 
                                                                isCIC: false,
                                                                key: '',
                                                                reportID: obj.report[0].OrderID
                                                            }
                                                        }
                                                        history.push(location);
                                                    }
                                                }}
                                                style={{height: '1.5rem'}}
                                            >
                                                <CheckOutlinedIcon style={{color: 'green'}} />
                                            </IconButton>
                                        )
                                    }
                                    return (
                                        <span key={idx} style={{display: 'inline-block'}}>
                                            {name} {renderAction()}
                                        </span>
                                    )
                                })}
                            </ul>
                        )
                    }

                    return renderCreditCheck();
                }
            }
        },
        { name: 'review', label: 'Review', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <>
                            {value.Approve}
                            <MatButton className="text-primary mr-10 mb-10"
                                onClick={() => {
                                    setReviewTenantID(parseInt(value.TenantID))
                                    setReviewData({
                                        name: `${value.TenantFName} ${value.TenantMName} ${value.TenantLName}`,
                                        approveID: parseInt(value.ApproveID),
                                        backgroundID: parseInt(value.BackgroundID)
                                    });
                                }}
                            >
                                Review
                            </MatButton>
                        </>
                    )
                }
            }
        },
        { name: 'convert', label: 'Convert', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(value.ApproveID) !== 1)
                        return <Alert severity="error">Application not Approved.</Alert>
                    if(vacantUnits.length === 0)
                        return <Alert severity="warning">Property does not have vacant units.</Alert>

                    return (
                        <>
                            <Input type="select" value={selectedUnit} onChange={(e) => {
                                setSelectedUnit(parseInt(e.target.value))
                                setUnitName(vacantUnits[e.nativeEvent.target.selectedIndex].UnitName)
                            }}>
                                {vacantUnits.map((obj, idx) =>
                                    <option key={idx} value={obj.UnitID}>{obj.UnitName}</option>
                                )}
                            </Input>
                            <MatButton className="text-primary mr-10 mb-10"
                                onClick={() => {
                                    const location = {
                                        pathname: '/applicants/convertToTenant',
                                        state: { 
                                            tenantID: parseInt(value.TenantID),
                                            tenantName: `${value.TenantFName} ${value.TenantLName}`,
                                            unitID: selectedUnit,
                                            unitName: unitName
                                        }
                                    }
                                    history.push(location);
                                }}
                            >
                                Convert
                            </MatButton>
                        </>
                    )
                }
            }
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: false,
        selectableRows: "none",
        customSearch: (searchQuery, currentRow, columns) => {
            let found = false;
            currentRow.forEach(element => {
                if(element === null)    found = false;
                else if(typeof element === 'object') {
                    if(element.TenantFName !== null && element.TenantFName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.TenantLName !== null && element.TenantLName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.UserFName !== null && element.UserFName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.UserLName !== null && element.UserLName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                } else if(element.toString().toUpperCase().includes(searchQuery.toUpperCase())){
                    found = true;
                }
            });
            return found;
        }
    }

    const deleteApplicantFunc = async () => {
        setLoading(true);
        setDeleteApplicant(0)
        const res = await applicantsAPI.deniedProspect(deleteApplicant);
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Applicant deleted.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Applicants..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <SweetAlert
                warning
                btnSize="sm"
                show={deleteApplicant !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteApplicantFunc()}
                onCancel={() => setDeleteApplicant(0)}
            >
                Applicant will be set as denied. 
            </SweetAlert>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Applicants</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Current Applicants - ${applicants.length}`}
                            data={applicants}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
            <Review propertyID={propertyID} reviewTenantID={reviewTenantID} setReviewTenantID={setReviewTenantID} 
                reviewData={reviewData} setUpdated={setUpdated} updated={updated} />
            
        </Main>
    )
}

export default ViewAll;