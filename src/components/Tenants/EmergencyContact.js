import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Block from '@material-ui/icons/Block';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Button, Form, Label, Input } from 'reactstrap';
import NotificationManager from 'react-notifications/lib/NotificationManager';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import * as Util from '../Util/util';

const EmergencyContact = (props) => {
    const tenantID = props.tenantID;
    const admin = props.admin;

    const [ loading, setLoading ] = useState(true);
    const [ emergencyContacts, setEmergencyContacts ] = useState([]);
    const [ updated, setUpdated ] = useState(false);
    const [ emergencyContactID, setEmergencyContactID ] = useState(0);
    const [ editID, setEditID ] = useState(0);
    const [ showDelete, setShowDelete ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const emerContacts = await tenantAPI.getEmergencyContacts(tenantID);
            let arr = [];
            for(const c of emerContacts) {
                arr.push({
                    firstName: c.firstName,
                    lastName: c.lastName,
                    phone: c.phone,
                    email: c.email,
                    relationship: c.relationship,
                    edit: c,
                    delete: c.tenantEmergencyContactID
                });
            }
            setEmergencyContacts(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated]);

    const columns = [
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'relationship', label: 'Relationship' },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(admin) in [1,2,5]) {
                        return (
                            <IconButton
                                aria-label="Print"
                                onClick={() => {
                                    setValue("firstName", value.firstName, { shouldValidate: true });
                                    setValue("lastName", value.lastName, { shouldValidate: true });
                                    setValue("phone", value.phone, { shouldValidate: true });
                                    setValue("email", value.email, { shouldValidate: true });
                                    setValue("relationship", value.relationship, { shouldValidate: true });
                                    setEditID(value.tenantEmergencyContactID);
                                }}
                            >
                                <Edit />
                            </IconButton>
                        );
                    } else
                        return <IconButton style={{color: 'red'}}><Block /></IconButton>;
                }
            },
        },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(admin) in [1,2,5]) {
                        return (
                            <IconButton
                                aria-label="Print"
                                onClick={() => {
                                    setEmergencyContactID(value);
                                    setShowDelete(true);
                                }}
                            >
                                <DeleteForever />
                            </IconButton>
                        );
                    } else
                        return <IconButton style={{color: 'red'}}><Block /></IconButton>;
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        selectableRows: "none",
    };

    const cleanEditData = () => {
        setValue("firstName", "");
        setValue("lastName", "");
        setValue("phone", "");
        setValue("email", "");
        setValue("relationship", "");
        setEditID(0);
    }

    const submitForm = async (data) => {
        setLoading(true);
        let res;
        if(editID === 0) {
            res = await tenantAPI.addEmergencyContact({
                tenantID,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                email: data.email,
                relationship: data.relationship
            });
        } else {
            res = await tenantAPI.updateEmergencyContact({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                email: data.email,
                relationship: data.relationship,
                id: editID
            });
        }
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        cleanEditData();
        setUpdated(!updated);
    }

    const deleteEmergencyContact = async () => {
        setShowDelete(false);
        setEmergencyContactID(0);
        setLoading(true);
        const res = await tenantAPI.deleteEmergencyContacts(emergencyContactID);
        setLoading(false);
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
                heading={"Loading Emergency Contacts..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const renderCancelEdit = () => {
                if(editID !== 0) {
                    return (
                        <>
                            {' '}<Button type="button" color="danger" size="sm" className="w-auto" style={{marginTop: '10px'}}
                                onClick={() => cleanEditData()}
                            >
                                Cancel Edit
                            </Button>
                        </>
                    )
                }
            }
            const heading = `${editID === 0 ? "Add" : "Edit"} Emergency Contact`;
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
                        onConfirm={() => deleteEmergencyContact()}
                        onCancel={() => setShowDelete(false)}
                    >
                        You will not be able to recover this contact!
                    </SweetAlert>
                    <div className="row">
                        <div className="col-sm-6 col-md-6 col-xl-6">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Emergency Contact"}
                                    data={emergencyContacts}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                        <div className="col-sm-6 col-md-6 col-xl-6">
                            <RctCollapsibleCard heading={heading}>
                                <Form onSubmit={handleSubmit(submitForm)}>
                                    <div className="row">
                                        <div className="col-sm-6">
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
                                        <div className="col-sm-6">
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
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <Label for="phone" className="mr-sm-10">Phone</Label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="phone" style={Util.setErrorStyle(errors.phone)} />
                                                )}
                                            />
                                            {errors.phone && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                        <div className="col-sm-8">
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
                                        <div className="col-sm-10">
                                            <Label for="relationship" className="mr-sm-10">Relationship</Label>
                                            <Controller
                                                name="relationship"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="relationship" style={Util.setErrorStyle(errors.relationship)} />
                                                )}
                                            />
                                            {errors.relationship && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '10px'}}>
                                        {editID === 0 ? "Add" : "Edit"}
                                    </Button>
                                    {renderCancelEdit()}
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                </>
            )
        }
    }

    return render();
}

export default EmergencyContact;