import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import MatButton from '@material-ui/core/Button';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantsAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const previousTenantStyle = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const PreviousTenants = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiprop = user.notifications.multiProp;

    const [ loading, setLoading ] = useState(true);
    const [ previousTenants, setPreviousTenants ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const tenants = await tenantsAPI.getPreviousTenants({
                companyID,
                multiprop,
                userID,
                propertyID
            });
            let arr= [];
            for(const t of tenants) {
                arr.push({
                    unit: t,
                    tenantName: `${t.TenantFName} ${t.TenantLName}`,
                    leaseStartDate: moment(t.LeaseStartDate).format("MM/DD/YYYY"),
                    leaseEndDate: moment(t.LeaseEndDate).format("MM/DD/YYYY"),
                    moveInDate: moment(t.MoveInDate).format("MM/DD/YYYY"),
                    moveOutDate: moment(t.MoveOutDate).format("MM/DD/YYYY"),
                    moveOutReason: t.MoveOutReason,
                    sentToCollection: t.DateSent !== null ? moment(t.DateSent).format("MM/DD/YYYY") : '',
                    tenantPhone: t.TenantPhone,
                    tenantEmail: t.TenantEmail,
                    edit: t
                });
            }
            setPreviousTenants(arr);
            setLoading(false);
        }
        fetchData();
    }, [companyID, multiprop, userID, propertyID]);

    const columns = [
        { name: 'unit', label: 'Unit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton color="primary" onClick={() => {
                            const location = {
                                pathname: '/tenants/details',
                                state: { tenantID: value.TenantID }
                            }
                            history.push(location);
                        }}>
                            {value.UnitName}
                        </MatButton>
                    );
                },
            }
        },
        { name: 'tenantName', label: 'Tenant Name', },
        { name: 'leaseStartDate', label: 'Lease Start Date', },
        { name: 'leaseEndDate', label: 'Lease End Date', },
        { name: 'moveInDate', label: 'Move In Date', },
        { name: 'moveOutDate', label: 'Move Out Date', },
        { name: 'moveOutReason', label: 'Move Out Reason', },
        { name: 'sentToCollection', label: 'Sent To Collection', },
        { name: 'tenantPhone', label: 'Tenant Phone', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <a href={`tel:+${value}`}>
                            {value}
                        </a>
                    );
                },
            }
        },
        { name: 'tenantEmail', label: 'Tenant Email', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <a  href={`mailto:+${value}`}>
                            {value}
                        </a>
                    );
                },
            }
        },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Edit"
                            onClick={() => {
                                const location = {
                                    pathname: '/tenants/editTenant',
                                    state: { 
                                        tenantID: value.TenantID, 
                                        tenantName: `${value.TenantFName} ${value.TenantLName}`
                                    }
                                }
                                history.push(location);
                            }}
                        >
                            <Edit />
                        </IconButton>
                    );
                }
            },
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
                    if(element.UnitName.toString().trim().includes(searchQuery))
                        found = true;
                    if(element.TenantPhone.toString().includes(searchQuery))
                        found = true;
                    if(element.TenantEmail.toString().includes(searchQuery))
                        found = true;
                    if(element.TenantFName.toString().includes(searchQuery))
                        found = true;
                    if(element.TenantLName.toString().includes(searchQuery))
                        found = true;
                } else if(element.toString().includes(searchQuery)){
                    found = true;
                }
            });
            return found;
        }
    };

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Tenants..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {

            return (
                <Main>
                    <div style={previousTenantStyle}>
                    <div className="formelements-wrapper">
                        <div className="page-title d-flex justify-content-between align-items-center">
                            <div className="page-title-wrap">
                                <i className="ti-angle-left"
                                    onClick={() => history.push('/tenants/viewAll')}
                                ></i>
                                <h2>
                                    <span>Previous Tenants</span>
                                </h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                    <MUIDataTable
                                        title={`${previousTenants.length} Previous Tenants`}
                                        data={previousTenants}
                                        columns={columns}
                                        options={options}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                    </div>
                </Main>
            )
        }
    }

    return render();
}

export default PreviousTenants;