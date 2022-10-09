import React, {useEffect, useState} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as Constants from '../Util/constants';
import LinearProgress from '../Util/LinearProgress';
import * as vendorsAPI from '../../Api/vendors';
import * as Util from '../Util/util';

const EditVendor = (props) => {
    const history = useHistory();
    const vendorID = props.location.state ? props.location.state.vendorID : null;

    const [ loading, setLoading ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(!vendorID) {
                history.goBack();
                return;
            }
            const vendor = await vendorsAPI.getByID(vendorID);
            console.log(vendor)
            if(vendor) {
                setValue("vendorName", vendor.VendorName);
                setValue("vendorPhone", vendor.VendorPhone);
                setValue("vendorEmail", vendor.VendorEmail);
                setValue("vendorAddress1", vendor.VendorAddress1);
                setValue("vendorAddress2", vendor.VendorAddress2 || '');
                setValue("vendorCity", vendor.VendorCity);
                setValue("vendorState", vendor.VendorState);
                setValue("vendorPostalCode", vendor.VendorZip);
                setValue("vendorMemo", vendor.Memo || '');
                setValue("vendorRouting", vendor.RoutingNumber || '');
                setValue("vendorAccount", vendor.AcountNumber || '');
                setValue("vendorEIN", vendor.VendorEIN || '');
                setValue("vendor1099", vendor.A1099);
            }
            setLoading(false);
        }
        fetchData();
    }, [vendorID, setValue, history]);

    const submitForm = async (data) => {
        setLoading(true);
        const res = await vendorsAPI.update({
            name: data.vendorName,
            address1: data.vendorAddress1,
            address2: data.vendorAddress2 !== undefined ? data.vendorAddress2 : '',
            city: data.vendorCity,
            state: data.vendorState,
            zip: data.vendorPostalCode,
            email: data.vendorEmail,
            phone: data.vendorPhone,
            routing: data.vendorRouting !== undefined ? data.vendorRouting : '',
            account: data.vendorAccount !== undefined ? data.vendorAccount : '',
            ein: data.vendorEIN !== undefined ? data.vendorEIN : '',
            a1099: parseInt(data.vendor1099),
            memo: data.vendorMemo !== undefined ? data.vendorMemo : '',
            vendorID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Vendor Updated.", "Success")
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Vendor..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                    <h2>
                        <span>Edit Vendor</span>
                    </h2>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Edit Vendor">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorName" className="mr-sm-10">Name</Label>
                                    <Controller
                                        name="vendorName"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorName" style={Util.setErrorStyle(errors.vendorName)} />
                                        )}
                                    />
                                    {errors.vendorName && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorPhone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="vendorPhone"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorPhone" style={Util.setErrorStyle(errors.vendorPhone)} />
                                        )}
                                    />
                                    {errors.vendorPhone && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorEmail" className="mr-sm-10">Email</Label>
                                    <Controller
                                        name="vendorEmail"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorEmail" style={Util.setErrorStyle(errors.vendorEmail)} />
                                        )}
                                    />
                                    {errors.vendorEmail && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="vendorAddress1" className="mr-sm-10">Address 1</Label>
                                    <Controller
                                        name="vendorAddress1"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorAddress1" style={Util.setErrorStyle(errors.vendorAddress1)} />
                                        )}
                                    />
                                    {errors.vendorAddress1 && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorAddress2" className="mr-sm-10">Address 2</Label>
                                    <Controller
                                        name="vendorAddress2"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorAddress2" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorCity" className="mr-sm-10">City</Label>
                                    <Controller
                                        name="vendorCity"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorCity" style={Util.setErrorStyle(errors.vendorCity)} />
                                        )}
                                    />
                                    {errors.vendorCity && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="vendorState"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="vendorState" style={Util.setErrorStyle(errors.vendorState)} >
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj) => {
                                                    return <option value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.vendorState && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorPostalCode" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="vendorPostalCode"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorPostalCode" style={Util.setErrorStyle(errors.vendorPostalCode)} />
                                        )}
                                    />
                                    {errors.vendorPostalCode && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="vendorMemo" className="mr-sm-10">Memo</Label>
                                    <Controller
                                        name="vendorMemo"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorMemo" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorRouting" className="mr-sm-10">Routing Number</Label>
                                    <Controller
                                        name="vendorRouting"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorRouting" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorAccount" className="mr-sm-10">Account Number</Label>
                                    <Controller
                                        name="vendorAccount"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorAccount" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorEIN" className="mr-sm-10">Tax ID (EIN)</Label>
                                    <Controller
                                        name="vendorEIN"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorEIN" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendor1099" className="mr-sm-10">1099 Required?</Label>
                                    <Controller
                                        name="vendor1099"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="vendor1099">
                                                <option value="3">None Required</option>
                                                <option value="1">1099-INT</option>
                                                <option value="2">1099-MISC</option>
                                            </Input>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Update Vendor</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default EditVendor;