import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as companyAPI from '../../Api/company';

const MakeReadyTask = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [loading, setLoading] = useState(false);
    const [makeReadies, setMakeReadies] = useState([]);
    const [deleteID, setDeleteID] = useState(0);
    const [updated, setUpdated] = useState(false);

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const arr = [];
            const makeReadies = await companyAPI.getMakeReadyTasks(propertyID) || [];
                console.log(makeReadies)
            for(const mk of makeReadies) {
                arr.push({
                    task: mk.Task,
                    edit: mk.MakeReadyTaskID,
                    delete: mk.MakeReadyTaskID
                })
            }
            setMakeReadies(arr);
            setLoading(false);
        }
        fetchData();
    }, [propertyID, updated])

    const columns = [
        { name: 'task', label: 'Task', },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/company/makeReadyTask/edit',
                                    state: { 
                                        makeReadyTaskID: parseInt(value)
                                    }
                                }
                                history.push(location);
                            }}
                        >
                            <Edit />
                        </IconButton>
                    )
                }
            },
        },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                setDeleteID(parseInt(value));
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    )
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: false,
        selectableRows: "none",
    }

    const deleteMakeReady = async () => {
        setLoading(true);
        const res = await companyAPI.deleteMakeReady(deleteID);
        setDeleteID(0);
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
    }   

    const submitForm = async (data) => {
        setLoading(true);
        const res = await companyAPI.addMakeReadyTask({
            task: data.task,
            propertyID
        })
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
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
            <SweetAlert
                warning
                btnSize="sm"
                show={deleteID !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteMakeReady()}
                onCancel={() => setDeleteID(0)}
            >
                You will not be able to recover this task!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Make Ready Task</span>
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
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add Make Ready Task</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={`Existing Make Ready Tasks - ${makeReadies.length}`}
                                data={makeReadies}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default MakeReadyTask;