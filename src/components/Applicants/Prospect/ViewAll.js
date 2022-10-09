import React, {useState, useEffect} from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import MatButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import SweetAlert from 'react-bootstrap-sweetalert';
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';

const ViewAll = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [loading, setLoading] = useState(false);
    const [prospects, setProspects] = useState([]);
    const [delProspectID, setDelProspectID] = useState(0);
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const getProspects = await applicantsAPI.getProspects(propertyID);
            const arr = [];
            for(const p of getProspects) {
                arr.push({
                    dateEntered: moment.utc(p.ProspectStartDate).format("MM/DD/YYYY"),
                    name: p,
                    preLeased: '',
                    phone: p.TenantPhone,
                    email: p.TenantEmail,
                    interest: p.UnitType,
                    leasingAgent: p.UserFName !== null ? `${p.UserFName} ${p.UserLName}` : 'External Applicant',
                    trafficSource: p.LeadSource !== null ? p.LeadSource : '',
                    comments: p.ProspectComments,
                    delete: p.TenantID,
                    convert: p
                });
            }
            setProspects(arr);
            setLoading(false);
        }
        fetchData();
    }, [propertyID, updated])

    const deleteProspect = async () => {
        setLoading(true);
        setDelProspectID(0)
        const res = await applicantsAPI.deniedProspect(delProspectID);
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Prospect deleted.", "Success");
    }

    const columns = [
        { name: 'dateEntered', label: 'Date Entered', },
        { name: 'name', label: 'Name', 
            options: {
                customBodyRender: (value) => {
                    if(value !== '') {
                        return (
                            <MatButton color="primary" onClick={() => {
                                const location = {
                                    pathname: '/prospects/edit',
                                    state: { 
                                        tenantID: parseInt(value.TenantID),
                                        name: "Prospect"
                                    }
                                }
                                history.push(location);
                            }}>
                                {value.TenantFName} {value.TenantMName} {value.TenantLName}
                            </MatButton>
                        );
                    }
                }
            }
        },
        { name: 'preLeased', label: 'Pre Leased', },
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
        { name: 'leasingAgent', label: 'Leasing Agent', },
        { name: 'trafficSource', label: 'Traffic Source', },
        { name: 'comments', label: 'Comments', },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                setDelProspectID(parseInt(value))
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    )
                }
            },
        },
        { name: 'convert', label: 'Convert', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton className="text-primary mr-10 mb-10"
                            onClick={() => {
                                const location = {
                                    pathname: '/prospects/convertToApplicant',
                                    state: { 
                                        tenantID: parseInt(value.TenantID)
                                    }
                                }
                                history.push(location);
                            }}
                        >
                            Convert to Applicant
                        </MatButton>
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

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Prospects..."}
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
                show={delProspectID !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteProspect()}
                onCancel={() => setDelProspectID(0)}
            >
                Prospect will be set as denied. 
            </SweetAlert>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Prospects</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Current Prospects - ${prospects.length}`}
                            data={prospects}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        </Main>
    )
}

export default ViewAll;