import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import Update from '@material-ui/icons/Update';
import DeleteForever from '@material-ui/icons/DeleteForever';
import SweetAlert from 'react-bootstrap-sweetalert';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { Link } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const WorkOrders = (props) => {
    const tenantID = props.tenantID;

    const [ loading, setLoading ] = useState(true);
    const [ workOrders, setWorkOrders ] = useState([]);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ deleteWKID, setDeleteWKID ] = useState(0);
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const wk = await tenantAPI.getWorkOrders(tenantID);
            let arr = [];
            for(const w of wk) {
                arr.push({
                    unit: w.UnitName,
                    dtSubmitted: w.WorkOrderCompleteDate ? moment(w.WorkOrderCompleteDate).format("MM/DD/YYYY") : '',
                    description: w,
                    staffComment: w.WorkOrderComment.toString() === '0' ? '' : w.WorkOrderComment,
                    status: w.Status,
                    priority: w.Priority,
                    updBy: `${w.UserFName} ${w.UserLName}`,
                    update: w,
                    delete: w.WorkORderID
                });
            }
            setWorkOrders(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated]);

    const columns = [
        { name: 'unit', label: 'Unit', },
        { name: 'dtSubmitted', label: 'Date Submitted', },
        { name: 'description', label: 'Description', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <Link to="/printable/viewWorkOrder"
                            onClick={async () => {
                                await localStorage.setItem("workOrderID", value.WorkOrderID);
                                await localStorage.setItem("propertyID", value.PropertyID);
                            }}
                            target="_blank"
                        >
                            {value.WorkOrderDescription}
                        </Link>
                    );
                }
            }
        },
        { name: 'staffComment', label: 'Staff Comment', 
            options: {
                customBodyRender: (value) => {
                    return <span>{value}</span>
                }
            }
        },
        { name: 'commentDt', label: 'Comment Date',  },
        { name: 'status', label: 'Status', },
        { name: 'priority', label: 'Priority', },
        { name: 'updBy', label: 'Updated By', },
        { name: 'update', label: 'Update', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                const url = `./index.cfm?p=28&WOID=${value}&Ret=24`;
                                window.open(url, '_blank'); 
                            }}
                        >
                            <Update />
                        </IconButton>
                    );
                }
            },
        },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setDeleteWKID(value);
                                setShowDelete(true);
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    );
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        selectableRows: "none",
    };

    const deleteWK = async () => {
        const res = await tenantAPI.deleteWK(deleteWKID);
        setDeleteWKID(0);
        setShowDelete(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        setUpdated(!updated);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Tenant Ledger..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <>
                    <SweetAlert
                        warning
                        btnSize="sm"
                        show={showDelete}
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="success"
                        title="Are you sure?"
                        onConfirm={() => deleteWK()}
                        onCancel={() => setShowDelete(false)}
                    >
                        You will not be able to recover this work order!
                    </SweetAlert>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Work Orders"}
                                    data={workOrders}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                </>
            )
        }
    }

    return render();
}

export default WorkOrders;