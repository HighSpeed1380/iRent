import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import Select from 'react-select';
import NumberFormat from 'react-number-format';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as usersAPI from '../../Api/users';
import * as ownersAPI from '../../Api/owners';
import * as Util from '../Util/util';

const EditOwner = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;
    const ownerID = props.location.state ? props.location.state.ownerID : null;
        
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([])
    const [ownerName, setOwnerName] = useState('');

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            if(ownerID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            const props = await usersAPI.getPropertiesByCompany(companyID);
            const arr = [];
            for(const p of props) {
                arr.push({ value: parseInt(p.PropertyID), label: p.PropertyName })
            }
            setProperties(arr);
            // get User
            const owner = await ownersAPI.getOwner(ownerID);
            if(owner.data !== null) {
                setValue('ownerName', owner.data.OwnerName);
                setValue('agentRep', owner.data.Rep !== null ? owner.data.Rep : '');
                setValue('email', owner.data.OwnerEmail);
                setValue('landPhone', owner.data.OwnerPhone !== null ? owner.data.OwnerPhone : '');
                setValue('cellPhone', owner.data.OwnerCell);
                setValue('address', owner.data.OwnerAddress);
                setValue('city', owner.data.OwnerCity);
                setValue('state', owner.data.OwnerState);
                setValue('zip', owner.data.OwnerZip);
                setValue('properties', owner.properties);
                setOwnerName(owner.data.OwnerName)
            }
            setLoading(false);
        }
        fetchData();
    }, [companyID, ownerID, history, setValue])

    const submitForm = async (data) => {
        if(parseInt(data.state) === 0) {
            NotificationManager.error("Please, select a State for the address.", "Error.");
            return;
        }
        if(data.properties.length === 0) {
            NotificationManager.error("Please, select properties associated to this user.", "Error.");
            return;
        }
        setLoading(true);
        const res = await ownersAPI.edit({
            name: data.ownerName,
            phone: data.landPhone !== null && data.landPhone !== undefined ? data.landPhone : '',
            cell: data.cellPhone,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            agent: data.agentRep !== null && data.agentRep !== undefined ? data.agentRep : '',
            properties: data.properties,
            ownerID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Owner updated!", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Owner..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>User: {ownerName}</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="User Details">
                            <Form onSubmit={handleSubmit(submitForm)}>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="ownerName" className="mr-sm-10">Owner Name</Label>
                                            <Controller
                                                name="ownerName"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="ownerName" style={Util.setErrorStyle(errors.ownerName)} />
                                                )}
                                            />
                                            {errors.ownerName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="agentRep" className="mr-sm-10">Agent Name / Rep</Label>
                                            <Controller
                                                name="agentRep"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="agentRep" />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="email" className="mr-sm-10">Email</Label>
                                            <Controller
                                                name="email"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="email" style={Util.setErrorStyle(errors.email)} />
                                                )}
                                            />
                                            {errors.email && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="landPhone" className="mr-sm-10">Land Phone</Label>
                                            <Controller
                                                name="landPhone"
                                                control={control}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="landPhone" format="+1 (###) ###-####" mask="_" className="form-control" />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="cellPhone" className="mr-sm-10">Cell Phone</Label>
                                            <Controller
                                                name="cellPhone"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="cellPhone" format="+1 (###) ###-####" mask="_" className="form-control" style={Util.setErrorStyle(errors.cellPhone)} />
                                                )}
                                            />
                                            {errors.cellPhone && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="address" className="mr-sm-10">Address</Label>
                                            <Controller
                                                name="address"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="address" style={Util.setErrorStyle(errors.address)} />
                                                )}
                                            />
                                            {errors.address && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="city" className="mr-sm-10">City</Label>
                                            <Controller
                                                name="city"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="city" style={Util.setErrorStyle(errors.city)} />
                                                )}
                                            />
                                            {errors.city && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="state" className="mr-sm-10">State</Label>
                                            <Controller
                                                name="state"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="state" style={Util.setErrorStyle(errors.state)}>
                                                        <option value="0">Select</option>
                                                        {Constants.usStates.map((obj, idx) =>
                                                            <option value={obj.abbreviation}>{obj.name}</option>
                                                        )}
                                                    </Input>
                                                )}
                                            />
                                            {errors.state && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="zip" className="mr-sm-10">Postal Code</Label>
                                            <Controller
                                                name="zip"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="zip" style={Util.setErrorStyle(errors.zip)} />
                                                )}
                                            />
                                            {errors.zip && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-7">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="properties" className="mr-sm-10">Properties</Label>
                                            <Controller
                                                name="properties"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Select {...field}
                                                        defaultValue={[]}
                                                        isMulti
                                                        name="properties"
                                                        options={properties}
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                    />
                                                )}
                                            />
                                            {errors.properties && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Update Owner</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default EditOwner;