import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import NumberFormat from 'react-number-format';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import moment from 'moment';
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

const JournalEntry = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const user = login.user;
    const userID = user.id;

    const [loading, setLoading] = useState(false);
    const [journalTypes, setJournalTypes] = useState([]);
    const [journals, setJournals] = useState([]);
    const [deleteJournalID, setDeleteJournalID] = useState(0)
    const [updated, setUpdated] = useState(false);

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const journals = await companyAPI.getJournalEntries(propertyID) || [];
            let arr = [];
            for(const j of journals) {
                arr.push({
                    journalType: j.JournalType,
                    description: j.JournalDescription,
                    amount: j.JournalAmount,
                    dtEntered: moment.utc(j.DateEntered).format("MM/DD/YYYY"),
                    enteredBy: j.enteredFName !== null ? `${j.enteredFName} ${j.enteredLName}` : '',
                    lastModifiedBy: j.modifiedFName !== null ? `${j.modifiedFName} ${j.modifiedLName}` : '',
                    lastModified: moment.utc(j.ModifiedDate).format("MM/DD/YYYY"),
                    edit: j.JournalID,
                    delete: j.JournalID
                });
            }
            setJournals(arr);
            setJournalTypes(await companyAPI.getJournalType());
            setLoading(false);
        }
        fetchData()
    }, [propertyID, updated]);

    const columns = [
        { name: 'journalType', label: 'Journal Type', },
        { name: 'description', label: 'Description', },
        { name: 'amount', label: 'Amount', 
            options: {
                customBodyRender: (value) => {
                    if(isNaN(value))    return <span>{value}</span>
                    return (
                        <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={parseFloat(value).toFixed(2)} />
                    )
                }
            },
        },
        { name: 'dtEntered', label: 'Date Entered', },
        { name: 'enteredBy', label: 'Entered By', },
        { name: 'lastModifiedBy', label: 'Last Modified By', },
        { name: 'lastModified', label: 'Last modified', },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/company/journal/edit',
                                    state: { 
                                        journalID: parseInt(value)
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
                                setDeleteJournalID(parseInt(value));
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

    const submitForm = async (data) => {
        if(parseInt(data.journalType) === 0) {
            NotificationManager.error("Please, select a Journal Type.", "Error");
            return;
        }
        setLoading(true);
        const res = await companyAPI.addJournal({
            description: data.description,
            journalTypeID: parseInt(data.journalType),
            amount: parseFloat(data.amount.substring(1, data.amount.length)),
            propertyID,
            userID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Journal added!", "Success")
    }

    const deleteJournal = async () => {
        setLoading(true);
        const res = await companyAPI.deleteJournal(deleteJournalID);
        setLoading(false);
        setDeleteJournalID(0);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Journal deleted.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Journal Entry..."}
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
                show={deleteJournalID !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteJournal()}
                onCancel={() => setDeleteJournalID(0)}
            >
                You will not be able to recover this Journal!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Journal Entry</span>
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
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add Journal</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={`Existing Journal Entries - ${journals.length}`}
                                data={journals}
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

export default JournalEntry;