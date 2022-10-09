import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Block from '@material-ui/icons/Block';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import DatePicker from "reactstrap-date-picker";
import NotificationManager from 'react-notifications/lib/NotificationManager';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import * as Util from '../Util/util';

const Reminders = (props) => {
    const tenantID = props.tenantID;
    const userID = props.userID;
    const admin = props.admin;

    const [ loading, setLoading ] = useState(true);
    const [ reminders, setReminders ] = useState([]);
    const [ updated, setUpdated ] = useState(false);
    const [ deletePromissPayID, setDeletePromissPayID ] = useState(0);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ editID, setEditID ] = useState(0);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const promiss = await tenantAPI.getPromissToPay(tenantID);
            let arr = [];
            for(const p of promiss) {
                arr.push({
                    submitDate: moment(p.SubmitDate).format("MM/DD/YYYY"),
                    targetDate: p.PromissDate ? moment(p.PromissDate).format("MM/DD/YYYY") : '',
                    description: p.Promiss,
                    submittedBy: `${p.UserFName} ${p.UserLName}`,
                    staffComment: p.StaffComment.toString() !== '0' ? p.StaffComment : '',
                    paid: p.YesNo,
                    edit: p,
                    delete: p.PromissToPayID
                });
            }
            setReminders(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated]);

    const columns = [
        { name: 'submitDate', label: 'Submit Date' },
        { name: 'targetDate', label: 'Target Date' },
        { name: 'description', label: 'Description' },
        { name: 'submittedBy', label: 'Submitted By' },
        { name: 'staffComment', label: 'Staff Comment' },
        { name: 'paid', label: 'Paid' },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    if(parseInt(admin) in [1,2,5]) {
                        return (
                            <IconButton
                                aria-label="Edit"
                                onClick={() => {
                                    setValue("description", value.Promiss, { shouldValidate: true });
                                    setValue("targetDate", value.PromissDate ? moment(value.PromissDate).format("YYYY-MM-DD") : '', { shouldValidate: true });
                                    setEditID(value.PromissToPayID);
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
                                    setDeletePromissPayID(value);
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

    const clearEdit = () => {
        setValue("description", "");
        setValue("targetDate", "");
        setEditID(0);
    }

    const submitForm = async (data) => {
        const dt = moment(data.targetDate);
        if(!dt.isValid()) {
            NotificationManager.warning("Please enter a valid target date.", "Warning");
            return;
        }
        setLoading(true);
        let res;
        if(editID === 0) {
            res = await tenantAPI.addPromissToPay({
                userID,
                tenantID,
                promiss: data.description,
                promissDate: dt
            });
        } else {
            res = await tenantAPI.editPromissToPay({
                userID,
                promiss: data.description,
                promissDate: dt,
                id: editID
            });
        }
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "error");
            return;
        }
        clearEdit();
        setUpdated(!updated);
    }

    const deletePromissToPay = async () => {
        const res = await tenantAPI.deletePromissToPay(deletePromissPayID);
        setDeletePromissPayID(0);
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
                heading={"Loading Reminders..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const heading = `${editID === 0 ? "Add" : "Edit"} Reminders, Notes, Promises to Pay`;
            const renderCancelEdit = () => {
                if(editID !== 0) {
                    return (
                        <>
                            {' '}
                            <Button type="submit" color="danger" size="sm" className="w-auto"
                                onClick={clearEdit}
                            >
                                Cancel Edit
                            </Button>
                        </>
                    );
                }
            }
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
                        onConfirm={() => deletePromissToPay()}
                        onCancel={() => setShowDelete(false)}
                    >
                        You will not be able to recover this promiss to pay!
                    </SweetAlert>
                    <div className="row">
                        <div className="col-sm-6 col-md-6 col-xl-6">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Reminders, Notes, Promises to Pay"}
                                    data={reminders}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                        <div className="col-sm-6 col-md-6 col-xl-6">
                            <RctCollapsibleCard heading={heading}>
                                <Form onSubmit={handleSubmit(submitForm)}>
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="description" className="mr-sm-10">Description</Label>
                                        <Controller
                                            name="description"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input {...field} type="text" id="description" style={Util.setErrorStyle(errors.description)} />
                                            )}
                                        />
                                        {errors.description && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="targetDate" className="mr-sm-10">Target Date</Label>
                                        <Controller
                                            name="targetDate"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <DatePicker {...field} id="targetDate" style={Util.setErrorStyle(errors.targetDate)} />
                                            )}
                                        />
                                        {errors.targetDate && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                    <Button type="submit" color="primary" size="sm" className="w-auto">
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

export default Reminders;