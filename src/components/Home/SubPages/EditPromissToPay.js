import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Input, Button, Form, Label } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import { NotificationManager } from 'react-notifications';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as homeAPI from '../../../Api/home';
import * as Constants from '../../Util/constants';

const EditPromissToPay = (props) => {
    const history = useHistory();
    const ppID = props.location.state ? props.location.state.promissToPayID : null;

    const [ loading, setLoading ] = useState(false);
    const [ userName, setUserName ] = useState("");

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(ppID === null) {
                history.goBack();
                return;
            }
            const promissPay = await homeAPI.getMissedPromisePayDetails(ppID);
                console.log(promissPay);
            setValue("submitDate", moment.utc(promissPay.SubmitDate).format("YYYY-MM-DD"));
            setValue("targetDate", moment.utc(promissPay.PromissDate).format("YYYY-MM-DD"));
            setValue("paid", parseInt(promissPay.Success));
            setValue("notes", promissPay.Promiss);
            setValue("comment", promissPay.StaffComment);
            setUserName(`${promissPay.UserFName} ${promissPay.UserLName}`);
            setLoading(false);
        }
        fetchData();
    }, [ppID, history, setValue])

    const submitForm = async (data) => {
        const dtSubmitDate = moment(data.submitDate);
        if(!dtSubmitDate.isValid()) {
            NotificationManager.error("Please enter a valid Submit Date", "Error");
            return;
        }
        const dtTargetDate = moment(data.targetDate);
        if(!dtTargetDate.isValid()) {
            NotificationManager.error("Please enter a valid Target Date", "Error");
            return;
        }
        setLoading(true);
        const res = await homeAPI.updPromissToPayDetails({
            submitDate: dtSubmitDate,
            promissDate: dtTargetDate,
            success: parseInt(data.paid),
            promiss: data.notes,
            staffComment: data.comment,
            promissToPayID: ppID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        } 
        NotificationManager.success("Promiss to pay updated.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Promiss To Pay..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const title = `Promiss To Pay - Submitted By: ${userName}`;
    return (
        <Main>
            <div className="formelements-wrapper" style={{marginTop: '2%'}}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>Edit Promiss To Pay</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12" style={{marginLeft: '1%'}}>
                    <RctCollapsibleCard heading={title}>
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-2">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="submitDate" className="mr-sm-10">Submit Date</Label>
                                        <Controller
                                            name="submitDate"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <DatePicker {...field} id="submitDate" className="form-control" 
                                                    style={Util.setErrorStyle(errors.submitDate)} />
                                            )}
                                        />
                                        {errors.submitDate && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="targetDate" className="mr-sm-10">Target Date</Label>
                                        <Controller
                                            name="targetDate"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <DatePicker {...field} id="targetDate" className="form-control" 
                                                    style={Util.setErrorStyle(errors.targetDate)} />
                                            )}
                                        />
                                        {errors.targetDate && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="paid" className="mr-sm-10">Paid</Label>
                                        <Controller
                                            name="paid"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input {...field} id="paid" type="select" className="form-control" 
                                                    style={Util.setErrorStyle(errors.paid)}>
                                                        <option value="1">Yes</option>
                                                        <option value="2">No</option>
                                                </Input>
                                            )}
                                        />
                                        {errors.paid && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="notes" className="mr-sm-10">Notes</Label>
                                        <Controller
                                            name="notes"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input {...field} id="v" type="textarea" rows={4} className="form-control" 
                                                    style={Util.setErrorStyle(errors.notes)} />
                                            )}
                                        />
                                        {errors.notes && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-6">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="comment" className="mr-sm-10">Staff Comment</Label>
                                        <Controller
                                            name="comment"
                                            control={control}
                                            render={({ field }) => (
                                                <Input {...field} id="comment" type="textarea" rows={4} className="form-control" />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto">Update</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default EditPromissToPay;