import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { useHistory } from "react-router-dom";
import { NotificationManager } from 'react-notifications';

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as tenantsAPI from '../../../Api/tenants';
import * as homeAPI from '../../../Api/home';
import * as Constants from '../../Util/constants';

const EditMoveOutDate = (props) => {
    const history = useHistory();
    const uID = props.location.state ? props.location.state.unitID : null;

    const [ loading, setLoading ] = useState(false);
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
            setValue("vacantData", moment.utc(unit.VacantDate).format("YYYY-MM-DD"));
            setLoading(false);
        }
        fetchData();
    }, [uID, history, setValue])

    const submitForm = async (data) => {
        const dt = moment.utc(data.vacantData);
        if(!dt.isValid()) {
            NotificationManager.error("Please, enter a valid date.", "Error");
            return;
        }
        setLoading(true);
        const res = await homeAPI.updateVacantDate({
            vacantDate: dt,
            unitID: uID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        } 
        NotificationManager.success("Move Out Date updated.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Move Out Date..."}
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
                            <span>Edit Vacant Date</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-4 col-md-4 col-xl-4" style={{marginLeft: '1%'}}>
                    <RctCollapsibleCard heading={title}>
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="col-sm-8">
                                <FormGroup className="mr-10 mb-10">
                                    <Label for="vacantData" className="mr-sm-10">Vacant Date</Label>
                                    <Controller
                                        name="vacantData"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="vacantData" className="form-control" 
                                                style={Util.setErrorStyle(errors.vacantData)} />
                                        )}
                                    />
                                    {errors.moveOutDt && (
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

export default EditMoveOutDate;