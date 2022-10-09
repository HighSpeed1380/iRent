import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { Switch } from '@material-ui/core';
import DatePicker from "reactstrap-date-picker";
import { NotificationManager } from 'react-notifications';
import moment from 'moment';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as workOrdersAPI from '../../Api/workOrders';
import * as billsAPI from '../../Api/bills';

const updRecurringWKStyles = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const UpdateRecurring = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;
    const id = props.location.state ? props.location.state.id : null;

    const [ loading, setLoading ] = useState(true);
    const [ workOrder, setWorkOrder ] = useState({});
    const [ assignedTo, setAssignedTo ] = useState([]);
    const [ vendors, setVendors ] = useState([]);
    const [ unlimited, setUnlimited ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(id === null) history.push('/workOrders/recurring');
            const wk = await workOrdersAPI.getRecurringByID(id);
            setWorkOrder(wk);
            setUnlimited(wk.unlimited === 1 ? true : false);
            setAssignedTo(await workOrdersAPI.getMaintenance(parseInt(wk.propertyID)));
            setVendors(await billsAPI.getPayee(companyID));
            setLoading(false);
        }
        fetchData();
    }, [id, companyID, history]);

    const submitWorkOrder = async (data) => {
        const sDate = moment(data.startDate);
        const eDate = moment(data.endDate);

        if(!sDate.isValid() || moment().isSameOrAfter(sDate)) {
            NotificationManager.error("Start Date must be greater than today's date.", "Error.");
            return;
        }
        if(!eDate.isValid() && !unlimited) {
            NotificationManager.error("Please enter a valid End Date or select unlimited.", "Error");
            return;
        }
        if(eDate.isSameOrBefore(sDate)) {
            NotificationManager.error("End Date must be greater than Start Date.", "Error");
            return;
        }
        if(parseInt(data.assignedID) === 0) {
            NotificationManager.error("Assigned To is required.", "Error");
            return;
        }

        setLoading(true);
        const res = await workOrdersAPI.updateRecurring({
            priorityID: parseInt(data.priorityID),
            maintenanceID: parseInt(data.assignedID),
            vendorID: parseInt(data.vendorID),
            description: data.description,
            startDate: sDate,
            endDate: eDate === '' ? null : eDate,
            unlimited,
            frequencyID: parseInt(data.frequencyID),
            id
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.");
        }
        NotificationManager.success("Recurring Work Order updated.", "Success");
    }

    const handleChangeUnlimited = () => {
        if(!unlimited) {
            setValue("endDate", "");
        }
        setUnlimited(!unlimited);
    }

    const handleChangeEndDate = (event) => {
        if(moment(event).isValid()) setUnlimited(false);
        setValue("endDate", moment(event).format("YYYY-MM-DD"));
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Recurring Work Order..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }
        
    return (
        <Main>
            <div style={updRecurringWKStyles}>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.push('/workOrders/recurring')}></i>
                    <h2>
                        <span>Update Recurring Work Order</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Update Recurring Work Order">
                        <Form onSubmit={handleSubmit(submitWorkOrder)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="priorityID" className="mr-sm-10">Priority</Label>
                                    <Controller
                                        name="priorityID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.priorityID}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="priorityID" style={Util.setErrorStyle(errors.priorityID)}>
                                                <option value="1">High</option>
                                                <option value="3">Low</option>
                                            </Input>
                                        )}
                                    />
                                    {errors.priorityID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="assignedID" className="mr-sm-10">Assigned To</Label>
                                    <Controller
                                        name="assignedID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.maintenanceID}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="assignedID" style={Util.setErrorStyle(errors.assignedID)}>
                                                <option value="0">Select</option>
                                                {assignedTo.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.UserID} 
                                                            value={obj.UserID}
                                                        >
                                                            {obj.UserFName} {obj.UserLName}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.assignedID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorID" className="mr-sm-10">Vendor</Label>
                                    <Controller
                                        name="vendorID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.vendorID}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="vendorID" style={Util.setErrorStyle(errors.vendorID)}>
                                                <option value="0">Select</option>
                                                {vendors.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.VendorID} 
                                                            value={obj.VendorID}
                                                        >
                                                            {obj.VendorName}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.vendorID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="description" className="mr-sm-10">Description</Label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.description}
                                        render={({ field }) => (
                                            <Input {...field} type="textarea" name="description" rows={3} 
                                                style={Util.setErrorStyle(errors.description)}
                                            />
                                        )}
                                    />
                                    {errors.description && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="startDate" className="mr-sm-10">Start Date</Label>
                                    <Controller
                                        name="startDate"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={moment.utc(workOrder.startDate).format("YYYY-MM-DD")}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="startDate"  style={Util.setErrorStyle(errors.startDate)} />
                                        )}
                                    />
                                    {errors.startDate && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="endDate" className="mr-sm-10">End Date</Label>
                                    <Controller
                                        name="endDate"
                                        control={control}
                                        defaultValue={workOrder.endDate !== null ? moment.utc(workOrder.endDate).format("YYYY-MM-DD") : null}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="endDate" onChange={handleChangeEndDate} />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="unlimited" className="mr-sm-10">Unlimited</Label>
                                    <Switch name="unlimited" checked={unlimited} onChange={handleChangeUnlimited} />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="frequencyID" className="mr-sm-10">Frequency</Label>
                                    <Controller
                                        name="frequencyID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.frequencyID}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="priorityID" style={Util.setErrorStyle(errors.frequencyID)}>
                                                <option value="1">Everyday</option>
                                                <option value="2">Once a week</option>
                                                <option value="3">Once a month</option>
                                            </Input>
                                        )}
                                    />
                                    {errors.frequencyID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Update Recurring Work Order</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            </div>
        </Main>
    )
}

export default UpdateRecurring;