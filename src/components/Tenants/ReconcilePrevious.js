import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import MatButton from '@material-ui/core/Button';
import MailOutline from '@material-ui/icons/MailOutline';
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantsAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const reconcilePreviousStyle = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const ReconcilePrevious = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiprop = user.notifications.multiProp;
    
    const [ loading, setLoading ] = useState(true);
    const [ updated, setUpdated ] = useState(false);
    const [ tenants, setTenants ] = useState([]);
    const [ totalOwed, setTotalOwned ] = useState(0);
    const [ sendToCollection, setSendToCollection ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const tenants = await tenantsAPI.getReconcilePrevious({
                companyID,
                multiprop,
                userID,
                propertyID
            });
            let arr = [];
            let total = 0;
            for(const t of tenants) {
                const balance = parseFloat(t.TotalDebits) - parseFloat(t.TotalCredits);
                if(balance > 0) {
                    total += balance;
                    arr.push({
                        unit: t.UnitName,
                        tenantName: t,
                        leaseStartDate: moment(t.LeaseStartDate).format("MM/DD/YYYY"),
                        leaseEndDate: moment(t.LeaseEndDate).format("MM/DD/YYYY"),
                        moveInDate: moment(t.MoveInDate).format("MM/DD/YYYY"),
                        moveOutDate: moment(t.MoveOutDate).format("MM/DD/YYYY"),
                        balanceOwed: parseFloat(balance).toFixed(2),
                        tenantContact: t,
                        edit: t,
                        sendToCollection: t.TenantID
                    });
                }
            }
            setTotalOwned(total);
            setTenants(arr);
            setSendToCollection(await tenantsAPI.getSendToCollection(companyID));
            setLoading(false);
        }
        fetchData();
    }, [companyID, multiprop, userID, propertyID, updated]);

    const columns = [
        { name: 'unit', label: 'Unit', },
        { name: 'tenantName', label: 'Tenant Name', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton color="primary" onClick={() => {
                            window.location = `./index.cfm?P=190&TID=${value.TenantID}&R=24&PT=Y`;
                        }}>
                            {value.TenantFName} {value.TenantLName}
                        </MatButton>
                    );
                },
            }
        },
        { name: 'leaseStartDate', label: 'Lease Start Date', },
        { name: 'leaseEndDate', label: 'Lease End Date', },
        { name: 'moveInDate', label: 'Move In Date', },
        { name: 'moveOutDate', label: 'Move Out Date', },
        { name: 'balanceOwed', label: 'Balance Owed', 
            options: {
                customBodyRender: (value) => {
                    return <span><NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></span>;
                }
            }
        },
        { name: 'tenantContact', label: 'Tenant Contact', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <span>
                            <a href={`tel:+1${value.TenantPhone}`}><NumberFormat value={value.TenantPhone} format="+1 (###) ###-####" mask="_" displayType={'text'} /></a><br/>
                            <a href={`mailto:${value.TenantEmail}`}>{value.TenantEmail}</a>
                        </span>
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
                                window.location = `./index.cfm?P=190&TID=${value.TenantID}&R=24&PT=Y`;
                            }}
                        >
                            <Edit />
                        </IconButton>
                    );
                }
            },
        },
        { name: 'sendToCollection', label: 'Send To Collection', 
            options: {
                customBodyRender: (value) => {
                    if(sendToCollection === 1) {
                        return (
                            <IconButton
                                aria-label="Edit"
                                onClick={async () => {
                                    setLoading(true);
                                    const res = await tenantsAPI.sendToCollection(value);
                                    setLoading(false);
                                    if(res !== 0) {
                                        NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                                        return;
                                    }
                                    setUpdated(!updated);
                                }}
                            >
                                <MailOutline />
                            </IconButton>
                        );
                    } else if(sendToCollection === 2) {
                        return <span style={{color: 'red'}}>Processing your signup request.</span>
                    } else {
                        return (
                            <MatButton color="primary" onClick={() => {
                                window.location = `./index.cfm?P=368`;
                            }}>
                                Signup
                            </MatButton>
                        );
                    }
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
                    heading={"Loading Reconcile Previous..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const tableTitle = () => {
                return <span>{tenants.length} Tenants Owe: {<NumberFormat value={parseFloat(totalOwed).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />}</span>
            }
            return (
                <Main>
                    <div style={reconcilePreviousStyle}>
                    <div className="formelements-wrapper">
                        <div className="page-title d-flex justify-content-between align-items-center">
                            <div className="page-title-wrap">
                                <i className="ti-angle-left" style={{cursor: 'pointer'}} 
                                    onClick={() => history.push('/tenants/viewAll')}
                                ></i>
                                <h2>
                                    <span>Reconcile Previous Tenants</span>
                                </h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                    <MUIDataTable
                                        title={tableTitle()}
                                        data={tenants}
                                        columns={columns}
                                        options={options}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                    </div>
                </Main>
            );
        }
    }

    return render();
}

export default ReconcilePrevious;