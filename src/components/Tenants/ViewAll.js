import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Loop from '@material-ui/icons/Loop';
import ExitToApp from '@material-ui/icons/ExitToApp';
import ThumbUp from '@material-ui/icons/ThumbUp';
import MatButton from '@material-ui/core/Button';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantsAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import MoveOutTenant from './MoveOutTenants';

const ViewAll = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiprop = user.notifications.multiProp;

    const [ loading, setLoading ] = useState(true);
    const [ tenants, setTenants ] = useState([]);
    const [ potencialRent, setPotencialRent ] = useState(0);
    const [ selectedTenant, setSelectedTenant ] = useState({});
    const [ openMoveOut, setOpenMoveOut ] = useState(false);
    const [ hasExpireLease, setHasExpireLease ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const tenants = await tenantsAPI.getTenants({
                companyID,
                multiprop,
                userID,
                propertyID
            });
            let arr = [];
            let total = 0;
            for(const t of tenants) {
                total += t.RentalAmount === '' || t.RentalAmount === null ? 0 : parseFloat(t.RentalAmount);
                if(!hasExpireLease && parseInt(t.OutOfDate) === 1) 
                    setHasExpireLease(true);
                arr.push(
                    {
                        unit: t,
                        leaseEndDate: moment(t.LeaseEndDate).format("MM/DD/YYYY"),
                        tenantName: t,
                        tenantPhone: t,
                        tenantEmail: t,
                        rentalAmount: t.RentalAmount,
                        parkingCharges: t.ParkingCharge,
                        petRent: t.PetRent,
                        housing: t.HousingAMount,
                        tvCharges: t.TVCharge,
                        utilityCharges: t.UtilityCharge,
                        edit: t,
                        moveOut: t,
                        fileEviction: t
                    }
                );
            }
            setPotencialRent(total.toFixed(2));
            setTenants(arr);
            setLoading(false);
        }
        fetchData();
    }, [companyID, multiprop, propertyID, userID, hasExpireLease]);

    const columnsTenants = [
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
        { name: 'leaseEndDate', label: 'Lease End Date', },
        { name: 'tenantName', label: 'Tenant Name', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <span style={{
                            color: parseInt(value.OutOfDate) === 1 ? 'red' : '',
                            fontWeight: parseInt(value.OutOfDate) === 1 ? 'bold' : 'normal',
                        }}>
                            {value.BusinessName} {value.TenantFName} {value.TenantLName}
                        </span>
                    );
                }
            }
        },
        { name: 'tenantPhone', label: 'Tenant Phone', 
            options: {
                customBodyRender: (value) => {
                    if(value.TenantPhone && value.TenantPhone !== '') {
                        const callTo = `tel:${value.TenantPhone}`;
                        return <a href={callTo}>{value.TenantPhone}</a>
                    } else {
                        return  (
                            <MatButton color="primary" 
                                onClick={() => {
                                    const location = {
                                        pathname: '/tenants/editTenant',
                                        state: { 
                                            tenantID: value.TenantID ,
                                            tenantName: `${value.TenantFName} ${value.TenantLName}`
                                        }
                                    }
                                    history.push(location);
                                }}
                            >
                                Please Add
                            </MatButton>
                        );
                    }
                }
            },
        },
        { name: 'tenantEmail', label: 'Tenant Email', 
            options: {
                customBodyRender: (value) => {
                    if(value.TenantEmail && value.TenantEmail !== '') {
                        const mailTo = `mailto:${value.TenantEmail}`;
                        return <a href={mailTo}>{value.TenantEmail}</a>
                    } else {
                        return  (
                            <MatButton color="primary"
                                onClick={() => {
                                    const location = {
                                        pathname: '/tenants/editTenant',
                                        state: { 
                                            tenantID: value.TenantID ,
                                            tenantName: `${value.TenantFName} ${value.TenantLName}`
                                        }
                                    }
                                    history.push(location);
                                }}
                            >
                                Please Add
                            </MatButton>
                        );
                    }
                }
            },
        },
        { name: 'rentalAmount', label: 'Rental Amount', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'parkingCharges', label: 'Parking Charges', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'petRent', label: 'Pet Rent', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'housing', label: 'Housing', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'tvCharges', label: 'TV Charges', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'utilityCharges', label: 'Utility Charges', 
            options: {
                customBodyRender: (value) => {
                    return <NumberFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                }
            },
        },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
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
        { name: 'moveOut', label: 'Move Out', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setSelectedTenant(value);
                                setOpenMoveOut(true);
                            }}
                            style={{color: 'gold'}}
                        >
                            <Loop />
                        </IconButton>
                    );
                }
            },
        },
        { name: 'fileEviction', label: 'File Eviction', 
            options: {
                customBodyRender: (value) => {
                    if(value.EvictionFiled && value.EvictionFiled.toString() === '1') {
                        return (
                            <span>
                                {moment(value.EvictionFiledDate).format("MM/DD/YYYY")}
                                <IconButton
                                    aria-label="Print"
                                    onClick={async () => {
                                        setLoading(true);
                                        await tenantsAPI.updEviction({
                                            eviction: 2,
                                            tenantID: value.TenantID
                                        });
                                        await getData();
                                        setLoading(false);
                                    }}
                                    style={{color: 'blue'}}
                                >
                                    <ThumbUp />
                                </IconButton>
                            </span>
                        )
                    } else {
                        return (
                            <IconButton
                                aria-label="Print"
                                onClick={async () => {
                                    setLoading(true);
                                    await tenantsAPI.updEviction({
                                        eviction: 1,
                                        tenantID: value.TenantID
                                    });
                                    await getData();
                                    setLoading(false);
                                }}
                                style={{color: 'red'}}
                            >
                                <ExitToApp />
                            </IconButton>
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

    const getData = async () => {
        const tenants = await tenantsAPI.getTenants({
            companyID,
            multiprop,
            userID,
            propertyID
        });
        let arr = [];
        let total = 0;
        for(const t of tenants) {
            total += t.RentalAmount === '' || t.RentalAmount === null ? 0 : parseFloat(t.RentalAmount);
            if(!hasExpireLease && parseInt(t.OutOfDate) === 1)
                setHasExpireLease(true);
            arr.push(
                {
                    unit: t.UnitName,
                    leaseEndDate: moment(t.LeaseEndDate).format("MM/DD/YYYY"),
                    tenantName: t,
                    tenantPhone: t.TenantPhone,
                    tenantEmail: t.TenantEmail,
                    rentalAmount: t.RentalAmount,
                    parkingCharges: t.ParkingCharge,
                    petRent: t.PetRent,
                    housing: t.HousingAMount,
                    tvCharges: t.TVCharge,
                    utilityCharges: t.UtilityCharge,
                    edit: t.TenantID,
                    moveOut: t,
                    fileEviction: t
                }
            );
        }
        setPotencialRent(total.toFixed(2));
        setTenants(arr);
        setLoading(false);
    }

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
            const renderTitle = () => {
                const expLease = () => {
                    if(hasExpireLease)
                        return (
                            <>
                                <br/>
                                <span style={{color: 'red', fontSize: '12px'}}>NOTICE: The tenants highlighted in RED Below have an expired lease date or move out date, please update those fields in the tenant record.</span>
                            </>
                        );
                }
                return (
                    <span>
                        Existing Tenants {tenants.length}, 
                        Gross Potential Rent {' '}
                        <NumberFormat style={{color: 'green'}} value={potencialRent} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                        {expLease()}
                    </span>
                )
            }
            return (
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={renderTitle()}
                                data={tenants}
                                columns={columnsTenants}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            );
        }
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        {/*<i className="ti-angle-left"></i>*/}
                        <h2>
                            <span>Tenants</span>
                        </h2>
                    </div>
                </div>
                {render()}
                <MoveOutTenant tenant={selectedTenant} open={openMoveOut} userID={userID}
                    setOpenMoveOut={setOpenMoveOut} companyID={companyID} getData={getData}
                />
            </div>
        </Main>
    )
}

export default ViewAll;