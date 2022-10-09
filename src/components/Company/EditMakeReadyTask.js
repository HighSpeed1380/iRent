import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as companyAPI from '../../Api/company';

const EditMakeReadyTask = (props) => {
    const history = useHistory();
    const makeReadyTaskID = props.location.state ? props.location.state.makeReadyTaskID : null;

    const [loading, setLoading] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            if(makeReadyTaskID === null) {
                history.goBack();
                return;
            }
            setLoading(true);
            const makeReadyTask = await companyAPI.getMakeReadyTaskByID(makeReadyTaskID);
            if(makeReadyTask !== null) {
                setValue('task', makeReadyTask.Task)
            }
            setLoading(false);
        }
        fetchData()
    }, [makeReadyTaskID, history, setValue]);

    const submitForm = async (data) => {
        setLoading(true);
        const res = await companyAPI.updMakeReadyTask({
            task: data.task,
            makeReadyTaskID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Make Ready Task Updated!", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Make Ready Task..."}
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
                            <span>Edit Make Ready Task</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Company Details">
                            <Form onSubmit={handleSubmit(submitForm)}>
                                <div className="row">
                                    <div className="col-sm-5">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="task" className="mr-sm-10">Task</Label>
                                            <Controller
                                                name="task"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="task" style={Util.setErrorStyle(errors.task)} />
                                                )}
                                            />
                                            {errors.task && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Edit Make Ready Task</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default EditMakeReadyTask;