import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Input, Button, Form, Label } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as tenantsAPI from '../../../Api/tenants';
import * as Constants from '../../Util/constants';

const PreLease = (props) => {
    const history = useHistory();
    const uID = props.location.state ? props.location.state.unitID : null;
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const userID = login.user.id;

    const [ loading, setLoading ] = useState(false);
    const [ prospects, setPropspects ] = useState([]);
    const [ unit, setUnit ] = useState({});

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(uID === null) {
                history.goBack();
                return;
            }
            const tenant = await tenantsAPI.getByUnit(parseInt(uID));
            const unit = await tenantsAPI.getTenantUnit(parseInt(tenant.TenantID));
            setUnit(unit);
            setPropspects(await tenantsAPI.getPreLeaseProspects(propertyID));
            setValue("moveInDt", moment.utc().format("YYYY-MM-DD"));
            setLoading(false);
        }
        fetchData();
    }, [uID, propertyID, history, setValue])

    const submitForm = async (data) => {
        const dt = moment.utc(data.moveInDt);
        if(!dt.isValid()) {
            NotificationManager.error("Please, enter a valid move in date.", "Error");
            return;
        }
        if(parseInt(data.tenantID) === 0) {
            NotificationManager.error("Please, select a prospect.", "Error");
            return;
        }
        setLoading(true);
        const res = await tenantsAPI.setPreLeased({
            userID,
            moveInDt: dt,
            tenantID: parseInt(data.tenantID),
            unitID: uID
        });
        setLoading(false);
        if(res === -1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        } 
        history.push('/');
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Pre Lease..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const title = `Unit: ${unit.UnitName}`
    return (
        <Main>
            <div className="formelements-wrapper" style={{marginTop: '2%'}}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>Pre Lease</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12" style={{marginLeft: '1%', marginRight: '1%'}}>
                    <RctCollapsibleCard heading={title}>
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="col-sm-3">
                                <FormGroup className="mr-10 mb-10">
                                    <Label for="tenantID" className="mr-sm-10">Select Prospect</Label>
                                    <Controller
                                        name="tenantID"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="tenantID" className="form-control" 
                                                style={Util.setErrorStyle(errors.tenantID)}
                                            >
                                                <option value="0">Select</option>
                                                ${prospects.map((obj) => {
                                                    return <option value={obj.TenantID}>{obj.TenantFName} {obj.TenantLName}</option>
                                                })}
                                            </Input> 
                                        )}
                                    />
                                    {errors.tenantID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </FormGroup>
                            </div>
                            <div className="col-sm-2">
                                <FormGroup className="mr-10 mb-10">
                                    <Label for="moveInDt" className="mr-sm-10">Move In Date</Label>
                                    <Controller
                                        name="moveInDt"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="moveInDt" className="form-control" 
                                                style={Util.setErrorStyle(errors.moveInDt)} />
                                        )}
                                    />
                                    {errors.moveInDt && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </FormGroup>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto" disabled={prospects.length === 0}>Update</Button>
                            {prospects.length === 0 ? <p className="text-danger">You do not have a prospect</p> : <p></p>}
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default PreLease;