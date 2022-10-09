import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import NumberFormat from 'react-number-format';
//import { NotificationManager } from 'react-notifications';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as checkRegisterAPI from '../../Api/checkRegister'
import * as depositsAPI from '../../Api/deposits';
import * as tenantAPI from '../../Api/tenants';
import * as Util from '../Util/util';

const EditTransaction = (props) => {
    const history = useHistory();
    const ttID = props.location.state ? props.location.state.tenantTransactionID : null;

    const [ loading, setLoading ] = useState(false);
    const [ transaction, setTransaction ] = useState({});
    const [ transactionTypes, setTransactionTypes ] = useState([]);
    const [ tenants, setTenants ] = useState([]);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
                console.log('here');
            if(ttID === null) {
                history.goBack();
                return;
            }
            const data = await checkRegisterAPI.getEditTransactionData(ttID);
            const tenant = await tenantAPI.getTenant(parseInt(data.TenantID));
            if(parseInt(tenant.Prospect) === 2)
                setTenants(await depositsAPI.getCurrentTenants(parseInt(tenant.PropertyID)));
            else
                setTenants(await depositsAPI.getFormerTenants(parseInt(tenant.PropertyID)));

            if(data !== null) {
                setValue("transactionType", parseInt(data.DepositSourceID));
                setValue("amt", parseFloat(data.TransactionAmount).toFixed(2));
                setValue("tenantID", parseInt(data.TenantID));
                setValue("creditDt", moment.utc(data.TenantTransactionDate).format("YYYY-MM-DD"));
            }
            setTransaction(data);
            setTransactionTypes(await depositsAPI.getAllDepositSources());
            setLoading(false);
        }
        fetchData();
    }, [ttID, history, setValue]);

    const submitForm = async (data) => {

    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Transaction..."}
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
                            <span>Edit Transaction</span>
                        </h2>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Check Register Item">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="transactionType" className="mr-sm-10">Transaction Type {transaction.TransactionType}</Label>
                                        <Controller
                                            name="transactionType"
                                            control={control}
                                            rules={{ required: true }}
                                            defaultValue={parseInt(transaction.TransactionTypeID)}
                                            render={({ field }) => (
                                                <Input {...field} id="transactionType" type="select" className="form-control">
                                                    <option value="0">Select</option>
                                                    {transactionTypes.map((obj) => {
                                                        return (<option key={obj.DepositSourceID} value={obj.DepositSourceID}>{obj.DepositSource}</option>);
                                                    })}
                                                </Input>
                                            )}
                                        />
                                        {errors.transactionType && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="amt" className="mr-sm-10">Amount</Label>
                                        <Controller
                                            name="amt"
                                            control={control}
                                            rules={{ required: true }}
                                            defaultValue={parseFloat(transaction.TransactionAmount).toFixed(2)}
                                            render={({ field }) => (
                                                <NumberFormat  {...field} name="amt" thousandSeparator={true} prefix={"$"}
                                                    style={Util.setErrorStyle(errors.amt)} className="form-control"
                                                />
                                            )}
                                        />
                                        {errors.amt && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="creditDt" className="mr-sm-10">Date of Credit</Label>
                                        <Controller
                                            name="creditDt"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <DatePicker {...field} id="creditDt" className="form-control" />
                                            )}
                                        />
                                        {errors.creditDt && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="tenantID" className="mr-sm-10">Tenant</Label>
                                        <Controller
                                            name="tenantID"
                                            control={control}
                                            rules={{ required: true }}
                                            defaultValue={parseInt(transaction.TenantID)}
                                            render={({ field }) => (
                                                <Input {...field} id="tenantID" type="select" className="form-control">
                                                    <option value="">Select</option>
                                                    {tenants.map((obj) => {
                                                        return (<option key={obj.TenantID} value={obj.TenantID}>{obj.Combo}</option>);
                                                    })}
                                                </Input>
                                            )}
                                        />
                                        {errors.tenantID && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto">Update Transaction</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    );
}

export default EditTransaction;