import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Form, Label, Input } from 'reactstrap';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import NumberFormat from 'react-number-format';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import * as Util from '../Util/util';

function AddLeaseHolder(props) {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const userID = user.id;

    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const tenantName = props.location.state ? props.location.state.tenantName : null;

    const [ loading, setLoading ] = useState(true);
    const [ updated, setUpdated ] = useState(false);
    const [ leaseHodlers, setLeaseHolders ] = useState([]);
    const [ editLeaseHolder, setEditLeaseHolder ] = useState(0);
    const [ deleteLeaseHolderID, setDeleteLeaseHolderID ] = useState(0);
    const [ openDelete, setOpenDelete ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/tenants/viewAll');
            }
            const othersOnLease = await tenantAPI.getOthersOnLease(tenantID);
            let arr = [];
            for(const others of othersOnLease) {
                arr.push({
                    name: `${others.FirstName} ${others.LastName}`,
                    phone: <NumberFormat displayType={'text'} value={others.Phone} format="+1 (###) ###-####" mask="_"/>,
                    email: others.eMail,
                    ssn: `XXXXX${others.SSN.substring(others.SSN.length - 4)}`,
                    dob: others.DOB ? moment(others.DOB).format("MM/DD/YYYY") : '',
                    edit: others,
                    delete: others.TenantsOthersOnLeaseID
                });
            }
            setLeaseHolders(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated, history]);

    const clearEdit = () => {
        setValue("firstName", "");
        setValue("lastName", "");
        setValue("ssn", "");
        setValue("phone", "");
        setValue("email", "");
        setValue("driversLicense", "");
        setValue("dlState", "");
        setValue("dob", "");
        setEditLeaseHolder(0);
    }

    const columns = [
        { name: 'name', label: 'Name' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'ssn', label: 'SSN' },
        { name: 'dob', label: 'DOB' },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setValue("firstName", value.FirstName, { shouldValidate: true });
                                setValue("lastName", value.LastName, { shouldValidate: true });
                                setValue("ssn", value.SSN, { shouldValidate: true });
                                setValue("phone", value.Phone);
                                setValue("email", value.eMail, { shouldValidate: true });
                                setValue("driversLicense", value.DriversLicense);
                                setValue("dlState", value.DLState);
                                setValue("dob", value.DOB ? moment(value.DOB).format("YYYY-MM-DD") : '', { shouldValidate: true });
                                setEditLeaseHolder(value.TenantsOthersOnLeaseID);
                            }}
                        >
                            <Edit />
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
                                setDeleteLeaseHolderID(value);
                                setOpenDelete(true);
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

    const submitForm = async (data) => {
        const dt = moment(data.dob);
        if(!dt.isValid()) {   
            NotificationManager.warning("Please enter a valid DOB.", "Warning");
            return;
        }
        setLoading(true);
        let res;
        if(editLeaseHolder === 0) {
            res = await tenantAPI.addOthersOnLease({
                tenantID: tenantID,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone ? data.phone.toString().replace(/[^0-9]/g, '') : '',
                email: data.email,
                ssn: data.ssn,
                dob: dt,
                userID: userID,
                driverslicense: data.driversLicense,
                dlState: data.dlState
            });
        } else {
            res = await tenantAPI.updateOthersOnLease({
                id: editLeaseHolder,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone ? data.phone.toString().replace(/[^0-9]/g, '') : '',
                email: data.email,
                ssn: data.ssn,
                dob: dt,
                userID: userID,
                driverslicense: data.driversLicense,
                dlState: data.dlStates
            });
        }
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        clearEdit();
        setUpdated(!updated);
    }

    const deleteLeaseHolder = async () => {
        setLoading(true);
        const res = await tenantAPI.deleteOthersOnLease(deleteLeaseHolderID);
        setLoading(false);
        setDeleteLeaseHolderID(0);
        setOpenDelete(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "error");
            return;
        }
        setUpdated(!updated);
    }

    const returnToDetails = () => {
        const location = {
            pathname: '/tenants/details',
            state: { tenantID }
        }
        history.push(location);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Add Lease Holders..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const heading = `Add Additional Lease Holders onto Lease of ${tenantName}`;
            const renderButtoms = () => {
                if(editLeaseHolder === 0) {
                    // edit
                    return (
                        <>
                            <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '10px'}}>Add Lease Holder</Button>
                            {' '}
                        </>
                    );
                } else {
                    // add
                    return (
                        <>
                            <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '10px'}}>Edit Lease Holder</Button>
                            {' '}
                            <Button type="button" color="danger" size="sm" className="w-auto" style={{marginTop: '10px'}}
                                onClick={clearEdit}
                            >
                                Cancel Edit
                            </Button>
                            {' '}
                        </>
                    );
                }
            }
                
            return (
                <Main>
                    <SweetAlert
                        warning
                        btnSize="sm"
                        show={openDelete}
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="success"
                        title="Are you sure?"
                        onConfirm={() => deleteLeaseHolder()}
                        onCancel={() => setOpenDelete(false)}
                    >
                        You will not be able to recover this lease holder!
                    </SweetAlert>
                    <div style={Constants.margins}>
                        <div className="page-title d-flex justify-content-between align-items-center">
                            <div className="page-title-wrap">
                                <i className="ti-angle-left" onClick={returnToDetails} style={{cursor: 'pointer'}}>
                                </i>
                                <h2>
                                    <span>{tenantName} - Additional Lease Holders</span>
                                </h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <RctCollapsibleCard heading={heading}>
                                    <Form onSubmit={handleSubmit(submitForm)}>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <Label for="firstName" className="mr-sm-10">First Name</Label>
                                                <Controller
                                                    name="firstName"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="firstName" style={Util.setErrorStyle(errors.firstName)} />
                                                    )}
                                                />
                                                {errors.firstName && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </div>
                                            <div className="col-sm-4">
                                                <Label for="lastName" className="mr-sm-10">Last Name</Label>
                                                <Controller
                                                    name="lastName"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="lastName" style={Util.setErrorStyle(errors.lastName)} />
                                                    )}
                                                />
                                                {errors.lastName && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </div>
                                            <div className="col-sm-4">
                                                <Label for="email" className="mr-sm-10">Email</Label>
                                                <Controller
                                                    name="email"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Input {...field} type="email" id="email" style={Util.setErrorStyle(errors.email)} />
                                                    )}
                                                />
                                                {errors.email && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3">
                                                <Label for="ssn" className="mr-sm-10">SSN</Label>
                                                <Controller
                                                    name="ssn"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="ssn" style={Util.setErrorStyle(errors.ssn)} />
                                                    )}
                                                />
                                                {errors.ssn && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </div>
                                            <div className="col-sm-3">
                                                <Label for="phone" className="mr-sm-10">Phone</Label>
                                                <Controller
                                                    name="phone"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="ssn" />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-sm-3">
                                                <Label for="dob" className="mr-sm-10">DOB</Label>
                                                <Controller
                                                    name="dob"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <DatePicker {...field} id="dob" style={Util.setErrorStyle(errors.dob)} />
                                                    )}
                                                />
                                                {errors.dob && (
                                                    <span style={{ color: "red" }} role="alert">required</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3">
                                                <Label for="driversLicense" className="mr-sm-10">Driver's License</Label>
                                                <Controller
                                                    name="driversLicense"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} type="text" id="driversLicense" />
                                                    )}
                                                />
                                            </div>
                                            <div className="col-sm-3">
                                                <Label for="dlStates" className="mr-sm-10">DL State</Label>
                                                <Controller
                                                    name="dlStates"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} type="select" id="dlStates">
                                                            <option value="0">Select</option>
                                                            {Constants.usStates.map((obj) => {
                                                                return (
                                                                    <option 
                                                                        key={obj.abbreviation} 
                                                                        value={obj.abbreviation}
                                                                    >
                                                                        {obj.name}
                                                                    </option>
                                                                );
                                                            })}
                                                        </Input>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        {renderButtoms()}
                                        <Button type="button" color="warning" size="sm" className="w-auto" style={{marginTop: '10px'}}
                                            onClick={returnToDetails}
                                        >
                                            Return to {tenantName}
                                        </Button>
                                    </Form>
                                </RctCollapsibleCard>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                    <MUIDataTable
                                        title={`Others Currently on Lease of ${tenantName}`}
                                        data={leaseHodlers}
                                        columns={columns}
                                        options={options}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                </Main>
            )
        }
    }

    return render();
}

export default AddLeaseHolder 