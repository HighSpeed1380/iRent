import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { Switch } from '@material-ui/core';
import DatePicker from "reactstrap-date-picker";
import { NotificationManager } from 'react-notifications';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as billsAPI from '../../Api/bills';
import * as workOrdersAPI from '../../Api/workOrders';
import * as tenantsAPI from '../../Api/tenants';
import * as Util from '../Util/util';
import * as MyFuncs from '../Util/myFunctions';

const editWKStyles = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const UpdateWorkOrder = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const userID = user.id;
    const companyID = company.id;
    const workOrderID = props.location.state ? props.location.state.workOrderID : null;

    const [ loading, setLoading ] = useState(true);
    const [ workOrder, setWorkOrder ] = useState({});
    const [ assignedTo, setAssignedTo ] = useState([]);
    const [ vendors, setVendors ] = useState([]);
    const [ escrow, setEscrow ] = useState(false);
    const [ unit, setUnit ] = useState("Common Area");
    const [ tenantID, setTenantID ] = useState(null);

    const { handleSubmit, control, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(workOrderID === null)    history.push('/workOrders/add');
            const wk = await workOrdersAPI.getbyID(workOrderID);
            setWorkOrder(wk)
            setAssignedTo(await workOrdersAPI.getMaintenance(parseInt(wk.PropertyID)));
            setVendors(await billsAPI.getPayee(companyID));
            const unit = await workOrdersAPI.getUnit(parseInt(wk.UnitID));
            if(unit !== null) {
                setUnit(unit.UnitName);
                const tenant = await tenantsAPI.getByUnit(parseInt(unit.UnitID));
                if(tenant !== null) setTenantID(parseInt(tenant.TenantID));
            }
            setLoading(false);
        }
        fetchData();
    }, [workOrderID, companyID, history]);

    const submitWorkOrder = async (data) => {
        if(parseInt(data.assignedID) === 0) {
            NotificationManager.error("Assigned To is required.", "Error");
            return;
        }
        const dt = moment(data.completionDt);
        if(!dt.isValid()) {
            NotificationManager.error("Please enter a valid Completion Date.", "Error");
            return;
        }
        setLoading(true);
        const res = await workOrdersAPI.update({
            comment: data.comment,
            status: data.statusID,
            completeDt: dt,
            maintenance: data.assignedID,
            vendorID: data.vendorID,
            escrow: escrow,
            escrowHours: data.totalHours === undefined ? 0 : data.totalHours ,
            priorityID: data.priorityID,
            userID,
            workOrderID,
            tenantID,
            tenantCharge: data.billTenant === undefined ? 0 : MyFuncs.getFormattedNum(data.billTenant),
            propertyID: parseInt(workOrder.PropertyID)
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        NotificationManager.success("Work Order updated successfully!", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Work Order..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div style={editWKStyles}>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.push(props.location.state.return)}></i>
                    <h2>
                        <span>Update Work Order</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <p>
                            Unit: {unit} <br />
                            Submitted: {moment.utc(workOrder.WorkOrderSubmitDate).format("MM/DD/YYYY")} <br />
                            Description: {workOrder.WorkOrderDescription}
                        </p>
                    </RctCollapsibleCard>
                </div>
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Update Work Order">
                        <Form onSubmit={handleSubmit(submitWorkOrder)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="priorityID" className="mr-sm-10">Priority</Label>
                                    <Controller
                                        name="priorityID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.PriorityID}
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
                                        defaultValue={workOrder.MaintenanceID}
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
                                        defaultValue={workOrder.VendorID}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="vendorID">
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
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="statusID" className="mr-sm-10">Status</Label>
                                    <Controller
                                        name="statusID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.WorkOrderComplete}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="statusID" style={Util.setErrorStyle(errors.statusID)}>
                                                <option value="1">Open</option>
                                                <option value="2">In Progress</option>
                                                <option value="3">Closed</option>
                                            </Input>
                                        )}
                                    />
                                    {errors.statusID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-2">
                                    <Label for="completionDt" className="mr-sm-10">Completion Date</Label>
                                    <Controller
                                        name="completionDt"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={moment.utc().format("YYYY-MM-DD")}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="completionDt"  style={Util.setErrorStyle(errors.completionDt)} />
                                        )}
                                    />
                                    {errors.completionDt && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="comment" className="mr-sm-10">Comment</Label>
                                    <Controller
                                        name="comment"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={workOrder.WorkOrderComment}
                                        render={({ field }) => (
                                            <Input {...field} type="textarea" name="comment" rows={3} 
                                                style={Util.setErrorStyle(errors.comment)}
                                            />
                                        )}
                                    />
                                    {errors.comment && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="escrow" className="mr-sm-10">Escrow Reimbursable?</Label>
                                    <Switch name="escrow" checked={escrow} onChange={() => setEscrow(!escrow)} />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="totalHours" className="mr-sm-10">Total Hours</Label>
                                    <Controller
                                        name="totalHours"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" name="totalHours" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="billTenant" className="mr-sm-10">Bill Tenant</Label>
                                    <Controller
                                        name="billTenant"
                                        control={control}
                                        render={({ field }) => (
                                            <NumberFormat {...field} id="billTenant" thousandSeparator={true} prefix={"$"} className="form-control" />
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Update Work Order</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            </div>
        </Main>
    )
}

export default UpdateWorkOrder;