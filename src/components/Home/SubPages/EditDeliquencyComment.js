import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Input, Button, Form, Label } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import { NotificationManager } from 'react-notifications';

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as tenantAPI from '../../../Api/tenants';
import * as Constants from '../../Util/constants';

const EditDelinquencyComment = (props) => {
    const history = useHistory();
    const tID = props.location.state ? props.location.state.tenantID : null;

    const [ loading, setLoading ] = useState(false);
    const [ tenantName, setTenantName ] = useState({});

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tID === null) {
                history.goBack();
                return;
            }
            const tenant = await tenantAPI.getTenant(tID);
            setTenantName(`${tenant.TenantFName} ${tenant.TenantLName}`);
            setValue("comment", tenant.DelinquencyComments !== null ? tenant.DelinquencyComments : "");
            setLoading(false);
        }
        fetchData();
    }, [tID, history, setValue])

    const submitForm = async (data) => {
        setLoading(true);
        const res = await tenantAPI.updateDelinquencyComment({
            delinquencyComments: data.comment,
            tenantID: tID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        } 
        NotificationManager.success("Comment updated.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Delinquency Comment..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const title = `Tenant: ${tenantName}`
    return (
        <Main>
            <div className="formelements-wrapper" style={{marginTop: '2%'}}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>Edit Delinquency Comment</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6 col-md-6 col-xl-6" style={{marginLeft: '1%'}}>
                    <RctCollapsibleCard heading={title}>
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="col-sm-12">
                                <FormGroup className="mr-10 mb-10">
                                    <Label for="comment" className="mr-sm-10">Comment</Label>
                                    <Controller
                                        name="comment"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="textarea" rows={4} id="comment" className="form-control" 
                                                style={Util.setErrorStyle(errors.comment)} /> 
                                        )}
                                    />
                                    {errors.comment && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </FormGroup>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto">Update</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default EditDelinquencyComment;