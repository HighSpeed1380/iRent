import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import NumberFormat from 'react-number-format';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as companyAPI from '../../Api/company';

const EditJournal = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const user = login.user;
    const userID = user.id;
    const journalID = props.location.state ? props.location.state.journalID : null;

    const [loading, setLoading] = useState(false);
    const [journalTypes, setJournalTypes] = useState([]);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            if(journalID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            const journal = await companyAPI.getJournalByID(journalID);
            if(journal !== null) {
                setValue('journalType', parseInt(journal.JournalTypeID))
                setValue('description', journal.JournalDescription)
                setValue('amount', parseFloat(journal.JournalAmount).toFixed(2))
            }
            setJournalTypes(await companyAPI.getJournalType());
            setLoading(false);
        }
        fetchData()
    }, [propertyID, journalID, history, setValue]);

    const submitForm = async (data) => {
        setLoading(true);
        const res = await companyAPI.editJournal({
            description: data.description,
            amount: parseFloat(data.amount).toFixed(2),
            journalTypeID: parseInt(data.journalType),
            journalID,
            userID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Journal Updated!", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Edit Journal..."}
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
                            <span>Edit Journal</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Company Details">
                            <Form onSubmit={handleSubmit(submitForm)}>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="journalType" className="mr-sm-10">Journal Type</Label>
                                            <Controller
                                                name="journalType"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="journalType" style={Util.setErrorStyle(errors.journalType)}>
                                                        <option value="0">Select</option>
                                                        {journalTypes.map((obj, idx) => 
                                                            <option key={idx} value={obj.JournalTypeID}>{obj.JournalType}</option>
                                                        )}
                                                    </Input>
                                                )}
                                            />
                                            {errors.journalType && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-7">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="description" className="mr-sm-10">Description</Label>
                                            <Controller
                                                name="description"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="description" style={Util.setErrorStyle(errors.description)} />
                                                )}
                                            />
                                            {errors.description && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="amount" className="mr-sm-10">Amount</Label>
                                            <Controller
                                                name="amount"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <NumberFormat {...field} className="form-control" id="amount" thousandSeparator={true} prefix={'$'} style={Util.setErrorStyle(errors.amount)} />
                                                )}
                                            />
                                            {errors.amount && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Edit Journal</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default EditJournal;