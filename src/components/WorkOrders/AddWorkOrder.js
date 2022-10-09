import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input, FormText } from 'reactstrap';
import { FormGroup, Switch } from '@material-ui/core';
import { NotificationManager} from 'react-notifications';
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as billsAPI from '../../Api/bills';
import * as workOrdersAPI from '../../Api/workOrders';
import * as Util from '../Util/util';
import ListOpenWorkOrders from './ListOpenWorkOrders';

const addWKStyles = {
    paddingLeft: '1%',
    paddingRight: '1%',
    paddingTop: '1%',
    paddingBottom: '2%',
}

const AddWorkOrder = () => {
    const login = useSelector((state) => state.login);
    const user = login.user
    const company = login.company
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const companyID = company.id;
    const multiprop = user.notifications.multiProp;

    const [ loading, setLoading ] = useState(true);
    const [ properties, setProperties ] = useState([]);
    const [ units, setUnits ] = useState([]);
    const [ assignedTo, setAssignedTo ] = useState([]);
    const [ vendors, setVendors ] = useState([]);
    const [ commonArea, setCommonArea ] = useState(false);
    const [ updFile, setUpdFile ] = useState(null);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setProperties(await billsAPI.getProperties(userID));
            setUnits(await billsAPI.getUnits(propertyID));
            setAssignedTo(await workOrdersAPI.getMaintenance(propertyID));
            setVendors(await billsAPI.getPayee(companyID));
            setLoading(false);
        }
        fetchData();
    }, [userID, propertyID, companyID]);

    const submitWorkOrder = async (data) => {
        if(data.propertyID !== undefined && parseInt(data.propertyID) === 0) {
            NotificationManager.error("Property is required.", "Error");
            return;
        }
        if(parseInt(data.unitID) === 0 && !commonArea) {
            NotificationManager.error("Unit is required if it isn't common area.", "Error");
            return;
        }
        if(parseInt(data.assignedID) === 0) {
            NotificationManager.error("Assigned To is required.", "Error");
            return;
        }
        setLoading(true);
        const res = await workOrdersAPI.add({
            unitID: data.unitID,
            description: data.description,
            submitDate: new Date(),
            propertyID: data.propertyID === undefined ? propertyID : data.propertyID,
            priorityID: data.priorityID,
            userID,
            maintenanceID: data.assignedID,
            vendorID: data.vendorID,
            submittedBy: userID,
            file: updFile
        });
        if(res <= 0) {
            setLoading(false);
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }

        if(updFile !== null){
            // upload file
            await workOrdersAPI.addFileNotification({
                workOrderID: res,
                propertyID,
                unitID: data.unitID,
                file: updFile
            });
            /*
            if(fileUpdRes <= 0) {
                setLoading(false);
                NotificationManager.error("Error updating your image. Please, contact us.", "Error");
                return;
            }
            */
        }
        setLoading(false);
        NotificationManager.success("Work Order Created.", "Success!");
    }

    const handlePropertyChange = async (id) => {
        setUnits(await billsAPI.getUnits(parseInt(id)));
        setValue("propertyID", id);
    }   

    const renderProperties = () => {
        if(multiprop) {
            return (
                <div className="col-sm-3">
                    <Label for="propertyID" className="mr-sm-10">Property</Label>
                    <Controller
                        name="propertyID"
                        control={control}
                        rules={{ required: true }}
                        defaultValue={propertyID}
                        render={({ field }) => (
                            <Input {...field} type="select" id="propertyID" style={Util.setErrorStyle(errors.propertyID)}
                                onChange={(e) => handlePropertyChange(e.target.value)}
                            >
                                <option value="XX">Select</option>
                                {properties.map((obj) => {
                                    return (
                                        <option 
                                            key={obj.PropertyID} 
                                            value={obj.PropertyID}
                                        >
                                            {obj.PropertyName}
                                        </option>
                                    );
                                })}
                            </Input>
                        )}
                    />
                    {errors.propertyID && (
                        <span style={{ color: "red" }} role="alert">required</span>
                    )}
                </div>
            )
        }
    }
    
    const handleFileChange = (event) => {
        setUpdFile(event.target.files[0]);
    }

    const handleChangeCommonArea = () => {
        setValue("unitID", 0);
        setCommonArea(!commonArea);
    }

    const handleChangeUnit = (event) => {
        if(event.target.value !== 0) {
            setCommonArea(false);
        }
        setValue("unitID", event.target.value);
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div style={addWKStyles}>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Open Work Orders</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Add Work Order">
                        <Form onSubmit={handleSubmit(submitWorkOrder)}>
                            <div className="row">
                                {renderProperties()}
                                <div className="col-sm-3">
                                    <Label for="unitID" className="mr-sm-10">Unit</Label>
                                    <Controller
                                        name="unitID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={0}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="unitID" style={Util.setErrorStyle(errors.unitID)}
                                                onChange={handleChangeUnit}
                                            >
                                                <option value="0">Select</option>
                                                {units.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.UnitID} 
                                                            value={obj.UnitID}
                                                        >
                                                            {obj.UnitName}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.unitID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="priorityID" className="mr-sm-10">Priority</Label>
                                    <Controller
                                        name="priorityID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={1}
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
                                        defaultValue={0}
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
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorID" className="mr-sm-10">Vendor</Label>
                                    <Controller
                                        name="vendorID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={0}
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
                                <div className="col-sm-2">
                                    <Label for="commonArea" className="mr-sm-10">Common Area</Label>
                                    <Switch name="commonArea" checked={commonArea} onChange={handleChangeCommonArea} />
                                </div>
                                <div className="col-sm-3">
                                    <FormGroup>
                                        <Label for="file">Image</Label>
                                        <Input type="file" id="file" onChange={handleFileChange} />
                                        <FormText color="muted">
                                            Attach image
                                        </FormText>
                                    </FormGroup>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="description" className="mr-sm-10">Description</Label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        rules={{ required: true }}
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
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Submit New Work Order</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            <ListOpenWorkOrders propertyID={propertyID} />
            </div>
        </Main>
    );
}

export default AddWorkOrder;