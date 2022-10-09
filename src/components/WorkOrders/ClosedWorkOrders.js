import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import MatButton from '@material-ui/core/Button';
import { NotificationManager } from 'react-notifications';
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as workOrdersAPI from '../../Api/workOrders';
import * as Constants from '../Util/constants';

const closedWKStyles = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const ClosedWorkOrders = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [ loading, setLoading ] = useState(true);
    const [ workOrders, setWorkOrders ] = useState([]);

    useEffect(() => {
        async function fetchData() {    
            setLoading(true);
            const openWKs = await workOrdersAPI.getClosed(propertyID)
            let wks = [];
            for(const wk of openWKs) {
                wks.push({
                    unit: wk.UnitName === null ? 'Common Area' : wk.UnitName,
                    tenant: wk.TenantFName === null ? '' : `${wk.TenantFName} ${wk.TenantLName}`,
                    dateSubmitted: moment(wk.WorkOrderSubmitDate).format("MM/DD/YYYY"),
                    submittedBy: wk.UserFName === null ? '' : `${wk.UserFName} ${wk.UserLName}`,
                    description: wk,
                    staffComment: wk.WorkOrderComment !== null && wk.WorkOrderComment !== '0' ? wk.WorkOrderComment : '',
                    commentDate: wk.WorkOrderComment !== null && wk.WorkOrderComment !== '0' ? moment(wk.WorkOrderCompleteDate).format("MM/DD/YYYY") : '',
                    staffAssigned: wk.MainFName === null ? '' : `${wk.MainFName} ${wk.MainLName}`,
                    status: wk.Status,
                    priority: wk.Priority,
                    tenantConsent: parseInt(wk.allowMaintenanceGetIn) === 1 ? "Yes" : "No",
                    image: wk,
                    update: wk.WOrkOrderID
                });
            }
            setWorkOrders(wks);
            setLoading(false);
        }
        fetchData();
    }, [propertyID])

    const getImgLink = async (val) => {
        setLoading(true);
        const res = await workOrdersAPI.getImage({
            propertyID: val.PropertyID,
            unitID: val.UnitID,
            workOrderID: val.WOrkOrderID
        });
        setLoading(false);
        if(res === '') {
            NotificationManager.warning("No image associated to this work order.", "Warning!");
            return;
        }
        window.open(res, '_blank')
    }

    const columns = [
        { name: 'unit', label: 'Unit', },
        { name: 'tenant', label: 'Tenant', },
        { name: 'dateSubmitted', label: 'Date Submitted', },
        { name: 'submittedBy', label: 'Submitted By', },
        { name: 'description', label: 'Description', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <Link to="/printable/viewWorkOrder"
                            onClick={async () => {
                                await localStorage.setItem("workOrderID", value.WOrkOrderID);
                                await localStorage.setItem("propertyID", propertyID);
                            }}
                            target="_blank"
                        >
                            {value.WorkOrderDescription}
                        </Link>
                    )
                }
            },
        },
        { name: 'staffComment', label: 'Staff Comment', },
        { name: 'commentDate', label: 'Comment Date', },
        { name: 'staffAssigned', label: 'Staff Assigned', },
        { name: 'status', label: 'Status', },
        { name: 'priority', label: 'Priority', },
        { name: 'tenantConsent', label: 'Tenant Consent', },
        { name: 'image', label: 'Image',
            options: {
                customBodyRender: (value) => {
                    if(value === '')    return <span>No Image</span>
                    return (
                        <MatButton color="primary"
                            onClick={async () => getImgLink(value)}
                        >
                            Image
                        </MatButton>
                    )
                }
            },
        },
        { name: 'update', label: 'Update',
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton color="primary"
                            onClick={() => {
                                const location = {
                                    pathname: '/workOrders/update',
                                    state: { 
                                        workOrderID: value,
                                        return: '/workOrders/closed'
                                    }
                                }
                                history.push(location);
                            }}
                        >
                            Update
                        </MatButton>
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
                    if(element.UnitName !== null && element.UnitName.toString().trim().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.TenantFName !== null && element.TenantFName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.TenantLName !== null && element.TenantLName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.WorkOrderDescription !== null && element.WorkOrderDescription.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                } else if(element.toString().toUpperCase().includes(searchQuery.toUpperCase())){
                    found = true;
                }
            });
            return found;
        }
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Work Orders..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <Main>
                    <div style={closedWKStyles}>
                    <div className="page-title d-flex justify-content-between align-items-center">
                        <div className="page-title-wrap">
                            <h2>
                                <span>Closed Work Order</span>
                            </h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Closed Work Orders"}
                                    data={workOrders}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                    </div>
                </Main>
            );
        }
    }

    return render();
}

export default ClosedWorkOrders;