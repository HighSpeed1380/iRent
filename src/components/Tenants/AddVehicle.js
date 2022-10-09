import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Form, Label, Input } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';
import * as Util from '../Util/util';

function AddVehicle(props) {
    const history = useHistory();

    let tenantID = null;
    let tenantName = null;
    if(props.location !== undefined) {
        tenantID = props.location.state ? props.location.state.tenantID : null;
        tenantName = props.location.state ? props.location.state.tenantName : null;
    }
    if(tenantID === null && props.tenantID !== undefined)
        tenantID = props.tenantID;
    if(tenantName === null && props.tenantName !== undefined)
        tenantName = props.tenantName;

    const [ loading, setLoading ] = useState(true);
    const [ updated, setUpdated ] = useState(false);
    const [ vehicles, setVehicles ] = useState([]);
    const [ editVehicleID, setEditVehicleID ] = useState(0);
    const [ deleteVehicleID, setDeleteVehicleID ] = useState(0);
    const [ openDelete, setOpenDelete ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/tenants/viewAll');
            }
            const vehicles = await tenantAPI.getVehicles(tenantID);
            let arr = [];
            for(const v of vehicles) {
                arr.push({
                    year: v.Year,
                    color: v.Color,
                    make: v.Make,
                    model: v.Model,
                    licensePlate: v.LicensePlate,
                    parkingSpace: v.ParkingSpace,
                    edit: v,
                    delete: v.TenantVehicleID
                });
            }
            setVehicles(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated, history]);

    const cleanDelete = () => {
        setValue("make", "");
        setValue("model", "");
        setValue("year", "");
        setValue("color", "");
        setValue("licensePlate", "");
        setValue("parkingSpace", "");
        setEditVehicleID(0);
    }

    const columns = [
        { name: 'year', label: 'Year' },
        { name: 'color', label: 'Color' },
        { name: 'make', label: 'Make' },
        { name: 'model', label: 'Model' },
        { name: 'licensePlate', label: 'License Plate' },
        { name: 'parkingSpace', label: 'Parking Space' },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setValue("make", value.Make, { shouldValidate: true });
                                setValue("model", value.Model, { shouldValidate: true });
                                setValue("year", value.Year, { shouldValidate: true });
                                setValue("color", value.Color, { shouldValidate: true });
                                setValue("licensePlate", value.LicensePlate, { shouldValidate: true });
                                setValue("parkingSpace", value.ParkingSpace);
                                setEditVehicleID(value.TenantVehicleID);
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
                                setDeleteVehicleID(value);
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
        let res;
        setLoading(true);
        if(editVehicleID === 0) {
            res = await tenantAPI.addVehicle({
                tenantID: tenantID,
                make: data.make,
                model: data.model,
                year: data.year,
                color: data.color,
                licensePlate: data.licensePlate,
                parkingSpace: data.parkingSpace
            });
        } else {
            res = await tenantAPI.editVehicle({
                make: data.make,
                model: data.model,
                year: data.year,
                color: data.color,
                licensePlate: data.licensePlate,
                parkingSpace: data.parkingSpace ? data.parkingSpace : '',
                id: editVehicleID
            });
        }
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "error");
            return;
        }
        cleanDelete();
        setUpdated(!updated);
    }

    const deleteVehicle = async () => {
        setLoading(true);
        const res = await tenantAPI.deleteVehicle(deleteVehicleID);
        setLoading(false);
        setDeleteVehicleID(0);
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
                heading={"Loading Add Vehicles..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const heading = `Add Vehicle for ${tenantName}`;
            const renderButtoms = () => {
                if(editVehicleID === 0) {
                    // edit
                    return (
                        <>
                            <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '10px'}}>Add Vehicle</Button>
                            {' '}
                        </>
                    );
                } else {
                    // add
                    return (
                        <>
                            <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '10px'}}>Edit Vehicle</Button>
                            {' '}
                            <Button type="button" color="danger" size="sm" className="w-auto" style={{marginTop: '10px'}}
                                onClick={cleanDelete}
                            >
                                Cancel Edit
                            </Button>
                            {' '}
                        </>
                    );
                }
            }
            const renderReturn = () => {
                if(props.location !== undefined) {
                    return (
                        <div className="page-title d-flex justify-content-between align-items-center">
                            <div className="page-title-wrap">
                                <i className="ti-angle-left" onClick={returnToDetails} style={{cursor: 'pointer'}}>
                                </i>
                                <h2>
                                    <span>{tenantName} - Vehicles</span>
                                </h2>
                            </div>
                        </div>
                    )
                }
            }
            const renderContent = () => {
                return (
                    <>
                        <SweetAlert
                            warning
                            btnSize="sm"
                            show={openDelete}
                            showCancel
                            confirmBtnText="Yes, delete it!"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="success"
                            title="Are you sure?"
                            onConfirm={() => deleteVehicle()}
                            onCancel={() => setOpenDelete(false)}
                        >
                            You will not be able to recover this vehicle!
                        </SweetAlert>
                        <div style={Constants.margins}>
                            {renderReturn()}
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-xl-12">
                                    <RctCollapsibleCard heading={heading}>
                                        <Form onSubmit={handleSubmit(submitForm)}>
                                            <div className="row">
                                                <div className="col-sm-2">
                                                    <Label for="year" className="mr-sm-10">Year</Label>
                                                    <Controller
                                                        name="year"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Input {...field} type="text" id="year" style={Util.setErrorStyle(errors.year)} />
                                                        )}
                                                    />
                                                    {errors.year && (
                                                        <span style={{ color: "red" }} role="alert">required</span>
                                                    )}
                                                </div>
                                                <div className="col-sm-3">
                                                    <Label for="color" className="mr-sm-10">Color</Label>
                                                    <Controller
                                                        name="color"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Input {...field} type="text" id="color" style={Util.setErrorStyle(errors.color)} />
                                                        )}
                                                    />
                                                    {errors.color && (
                                                        <span style={{ color: "red" }} role="alert">required</span>
                                                    )}
                                                </div>
                                                <div className="col-sm-3">
                                                    <Label for="make" className="mr-sm-10">Make</Label>
                                                    <Controller
                                                        name="make"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Input {...field} type="text" id="make" style={Util.setErrorStyle(errors.make)} />
                                                        )}
                                                    />
                                                    {errors.make && (
                                                        <span style={{ color: "red" }} role="alert">required</span>
                                                    )}
                                                </div>
                                                <div className="col-sm-3">
                                                    <Label for="model" className="mr-sm-10">Model</Label>
                                                    <Controller
                                                        name="model"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Input {...field} type="text" id="model" style={Util.setErrorStyle(errors.model)} />
                                                        )}
                                                    />
                                                    {errors.model && (
                                                        <span style={{ color: "red" }} role="alert">required</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-3">
                                                    <Label for="licensePlate" className="mr-sm-10">License Plate</Label>
                                                    <Controller
                                                        name="licensePlate"
                                                        control={control}
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <Input {...field} type="text" id="licensePlate" style={Util.setErrorStyle(errors.licensePlate)} />
                                                        )}
                                                    />
                                                    {errors.licensePlate && (
                                                        <span style={{ color: "red" }} role="alert">required</span>
                                                    )}
                                                </div>
                                                <div className="col-sm-3">
                                                    <Label for="parkingSpace" className="mr-sm-10">Parking Space</Label>
                                                    <Controller
                                                        name="parkingSpace"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} type="text" id="parkingSpace" />
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
                                            title={`Vehicles of ${tenantName}`}
                                            data={vehicles}
                                            columns={columns}
                                            options={options}
                                        />
                                    </MuiThemeProvider>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            if(props.location !== undefined)
                return <Main>{renderContent()}</Main>;
            return renderContent();
        }
    }

    return render();
}

export default AddVehicle; 