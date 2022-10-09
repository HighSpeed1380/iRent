import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as checkRegisterAPI from '../../Api/checkRegister'
import * as Util from '../Util/util';
import * as MyFuncs from '../Util/myFunctions';

const EditCheckRegister = (props) => {
    const history = useHistory();
    const crID = props.location.state ? props.location.state.checkRegisterID : null;

    const [ loading, setLoading ] = useState(true);
    const [ checkRegister, setCheckRegister ] = useState({});

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(crID === null) {
                history.goBack();
                return;
            }
            setCheckRegister(await checkRegisterAPI.getByID(crID));
            setLoading(false);
        }
        fetchData();
    }, [crID, history]);

    const submitForm = async (data) => {
        setLoading(true);
        const res = await checkRegisterAPI.updateItem({
            amount: MyFuncs.getFormattedNum(data.amt),
            memo: data.memo,
            invoiceNumber: data.invoiceNumber,
            checkRegisterID: crID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.");
            return;
        }
        NotificationManager.success("Check Register Item updated.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Check Register Item..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={{marginTop: '2%'}}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => history.goBack()}></i>
                        <h2>
                            <span>Edit Check Register Item</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Check Register Item">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-2">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="amt" className="mr-sm-10">Amount</Label>
                                        <Controller
                                            name="amt"
                                            control={control}
                                            rules={{ required: true }}
                                            defaultValue={parseFloat(checkRegister.Amount).toFixed(2)}
                                            render={({ field }) => (
                                                <NumberFormat  {...field} id="amt" thousandSeparator={true} prefix={"$"}
                                                    style={Util.setErrorStyle(errors.amt)} className="form-control"
                                                />
                                            )}
                                        />
                                        {errors.amt && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-4">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="memo" className="mr-sm-10">Memo</Label>
                                        <Controller
                                            name="memo"
                                            control={control}
                                            defaultValue={checkRegister.Memo}
                                            render={({ field }) => (
                                                <Input {...field} id="memo" type="text" className="form-control" />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                                <div className="col-sm-4">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="invoiceNumber" className="mr-sm-10">Invoice Number</Label>
                                        <Controller
                                            name="invoiceNumber"
                                            control={control}
                                            defaultValue={checkRegister.InvoiceNumber}
                                            render={({ field }) => (
                                                <Input {...field} id="invoiceNumber" type="text" className="form-control" />
                                            )}
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto">Update Item</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    );
}

export default EditCheckRegister;