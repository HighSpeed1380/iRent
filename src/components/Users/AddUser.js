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
import * as Util from '../Util/util';

const AddUser = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([])
    const [securityLevels, setSecurityLevels] = useState([]);

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const props = await usersAPI.getPropertiesByCompany(companyID);
            const arr = [];
            for(const p of props) {
                arr.push({ value: parseInt(p.PropertyID), label: p.PropertyName })
            }
            setProperties(arr);
            setSecurityLevels(await usersAPI.getSecurityLevels())
            setLoading(false);
        }
        fetchData();
    }, [companyID])

    const submitForm = async (data) => {
        if(parseInt(data.securityLevel) === 0) {
            NotificationManager.error("Please, select the security level.", "Error.");
            return;
        }
        if(data.properties.length === 0) {
            NotificationManager.error("Please, select properties associated to this user.", "Error.");
            return;
        }
        setLoading(true);
        const res = await usersAPI.add({
            email: data.email,
            firstName: data.userFname,
            lastname: data.userLname,
            phone: data.phone,
            securityLevelID: data.securityLevel,
            companyID,
            properties: data.properties,
        });
        setLoading(false);
        if(res === 1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(res !== 0) {
            NotificationManager.error(res, "Error.");
            return;
        }
        NotificationManager.success("User added!", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Add User..."}
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
                            <span>Users</span>
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
                                            <Label for="userFname" className="mr-sm-10">First Name</Label>
                                            <Controller
                                                name="userFname"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="userFname" style={Util.setErrorStyle(errors.userFname)} />
                                                )}
                                            />
                                            {errors.userFname && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="userLname" className="mr-sm-10">Last Name</Label>
                                            <Controller
                                                name="userLname"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="userLname" style={Util.setErrorStyle(errors.userLname)} />
                                                )}
                                            />
                                            {errors.userLname && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
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
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="phone" className="mr-sm-10">Phone</Label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} id="phone" format="+1 (###) ###-####" mask="_" className="form-control" style={Util.setErrorStyle(errors.phone)} />
                                                )}
                                            />
                                            {errors.phone && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="securityLevel" className="mr-sm-10">Security Level</Label>
                                            <Controller
                                                name="securityLevel"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="securityLevel" style={Util.setErrorStyle(errors.securityLevel)}>
                                                        <option value="0">Select</option>
                                                        {securityLevels.map((obj, idx) =>
                                                            <option key={idx} value={obj.SecurityLevelID}>{obj.SecurityLevel}</option>
                                                        )}
                                                    </Input>
                                                )}
                                            />
                                            {errors.securityLevel && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
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
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add User</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default AddUser;