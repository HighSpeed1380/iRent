import React, {useState, useEffect} from 'react';
import { Form, Label } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import SweetAlert from 'react-bootstrap-sweetalert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import MatButton from '@material-ui/core/Button';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import HourglassFullTwoTone from '@material-ui/icons/HourglassFullTwoTone';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';
import Review from '../Applicant/Review';

const Denied = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const company = login.company
    const companyID = company.id;

    const [loading, setLoading] = useState(false);
    const [deniedApplicants, setDeniedApplicants] = useState([])
    const [screeningReports, setScreeningReports] = useState(new Map())
    const [deleteApplicant, setDeleteApplicant] = useState(0);
    const [fromDt, setFromDt] = useState(moment.utc().subtract(6, 'months').format("YYYY-MM-DD"));
    const [reviewTenantID, setReviewTenantID] = useState(0);
    const [reviewData, setReviewData] = useState({});
    const [updated, setUpdated] = useState(false);
    const [needToSignUp, setNeedToSignUp] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const deniedPros = await applicantsAPI.getDeniedProspects({propertyID, fromDt});
            setScreeningReports(new Map(Object.entries(deniedPros.backgroundScreening)));
            let arr = [];
            for(const dp of deniedPros.applicants) {
                arr.push({
                    dateEntered: moment.utc(dp.ProspectStartDate).format("MM/DD/YYYY"),
                    prospectName: dp,
                    preLeased: dp,
                    phone: dp.TenantPhone,
                    email: dp.TenantEmail,
                    interest: dp.UnitType,
                    leasingAgent: dp,
                    comments: dp.ProspectComments,
                    delete: dp.TenantID,
                    creditCheck: dp,
                    review: dp
                });
            }
                console.log(arr)
            setDeniedApplicants(arr);
            setNeedToSignUp(await applicantsAPI.companyNeedToSignUpScreening(companyID));
            setLoading(false);
        }
        fetchData();
    }, [propertyID, fromDt, companyID, updated]);

    const columns = [
        { name: 'dateEntered', label: 'Date Entered', },
        { name: 'prospectName', label: 'Prospect Name', 
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
                                                    pathname: '/applicants/addLeaseHolder',
                                                    state: { 
                                                        tenantID: parseInt(value.TenantID),
                                                        name: obj.name
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
                        if(needToSignUp) {
                            return <MatButton className="text-primary mr-10 mb-10"
                                        onClick={() => {
                                            const location = {
                                                pathname: '/applicants/signupBackground',
                                            }
                                            history.push(location);
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
                            <span style={{marginLeft: '.5rem'}}>{value.Approve}</span> <br/>
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

    const handleFromDtChange = (event) => {
        if(event === null || event === undefined)  return;
        const dt = moment.utc(event);
        if(!dt.isValid()) {
            NotificationManager.error("Please, enter a valid date.", "Error")
            return;
        }
        if(dt.isAfter(moment.utc())) {
            NotificationManager.error("Please, enter a date in the past.", "Error")
            return;
        }
        setFromDt(dt.format("YYYY-MM-DD"))
    }

    const deleteProspect = async () => {
        setLoading(true);
        const res = await applicantsAPI.removeProspect(deleteApplicant);
        setLoading(false);
        setDeleteApplicant(0);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Denied Prospects...`}
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
                onConfirm={() => deleteProspect()}
                onCancel={() => setDeleteApplicant(0)}
            >
                Prospect will be deleted. 
            </SweetAlert>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Denied Prospects</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <Form inline style={{marginLeft: '1%', marginBottom: '1%'}}>
                        <div className="row">
                            <div className="col-sm-12">
                                <Label for="fromDt" className="mr-sm-10">Denied Applicants Start Date From:</Label>
                                <DatePicker id="fromDt" value={fromDt} onChange={handleFromDtChange} />
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Current Denied Applicants - ${deniedApplicants.length}`}
                            data={deniedApplicants}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
            <Review propertyID={propertyID} reviewTenantID={reviewTenantID} setReviewTenantID={setReviewTenantID} 
                reviewData={reviewData} setUpdated={setUpdated} updated={updated} />
        </Main>
    );
}

export default Denied;