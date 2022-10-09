import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { useSelector } from "react-redux";
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as companyAPI from '../../Api/company';
import LinearProgress from '../Util/LinearProgress';

const ExpenseTypes = () => {
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [accountsType, setAccountTypes] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updated, setUpdated] = useState(false);
    const [deleteETID, setDeleteETID] = useState(0);
    const [mergeThis, setMergeThis] = useState(0);
    const [mergeTo, setMergeTo] = useState(0);

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            let arr= [];
            const expenses = await companyAPI.getExpenseTypes(companyID);
            for(const et of expenses) {
                arr.push({
                    expenseType: et.ExpenseType,
                    accountType: et.AccountType,
                    delete: et.ExpenseTypeID
                });
            }
            setExpenseTypes(arr);
            setAccountTypes(await companyAPI.getAccountTypes(companyID))
            setLoading(false)
        }
        fetchData()
    }, [companyID, updated]);

    const submit = async (data) => {
        setLoading(true);
        const res = await companyAPI.addExpenseType({
            expenseType: data.expenseType,
            accountTypeID: data.accountType,
            companyID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Expense Type Added.", "Success");
    }

    const deleteExpenseType = async () => {
        setLoading(true);
        const res = await companyAPI.deleteExpenseType(deleteETID);
        setLoading(false)
        setDeleteETID(0)
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Expense Type Deleted.", "Success");
    }

    const handleMerge = async () => {
        if(parseInt(mergeThis) === 0) {
            NotificationManager.warning("Please, select Merge This", "Error");
            return;
        }
        if(parseInt(mergeTo) === 0) {
            NotificationManager.warning("Please, select Merge To", "Error");
            return;
        }
        if(parseInt(mergeThis) === parseInt(mergeTo)) {
            NotificationManager.warning("Merge This and Merge To must be different", "Error");
            return;
        }
        setLoading(true);
        const res = await companyAPI.mergeExpenseTypes({
            expType1: mergeThis,
            expType2: mergeTo,
            companyID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Expense Types Merged.", "Success");
    }

    const columns = [
        { name: 'expenseType', label: 'Expense Type', },
        { name: 'accountType', label: 'Account Type', },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Delete"
                            onClick={() => {
                                setDeleteETID(parseInt(value));
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    );
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        selectableRows: "none",
        rowsPerPage: 100,
    };

    if(loading) {
        return (
            <RctCollapsibleCard
            colClasses="col-xs-12 col-sm-12 col-md-12"
            heading={"Loading Expense Types..."}
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
                show={deleteETID !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteExpenseType()}
                onCancel={() => setDeleteETID(0)}
            >
                You will not be able to recover this expense type!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Expense Types</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Add Expense Type">
                            <Form onSubmit={handleSubmit(submit)}>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="expenseType" className="mr-sm-10">Expense Type</Label>
                                            <Controller
                                                name="expenseType"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="expenseType" style={Util.setErrorStyle(errors.expenseType)} />
                                                )}
                                            />
                                            {errors.expenseType && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="accountType" className="mr-sm-10">Account Type</Label>
                                            <Controller
                                                name="accountType"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="accountType">
                                                        {accountsType.map((obj, idx) => {
                                                            return <option key={idx} value={obj.AccountTypeID}>{obj.AccountType}</option>
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" size="sm" className="w-auto">Add Expense Type</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Merge Expense Type">
                            <Form>
                            <div className="row">
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="mergeThis" className="mr-sm-10">Merge This</Label>
                                        <Input type="select" id="mergeThis" value={mergeThis} 
                                            onChange={(e) => setMergeThis(parseInt(e.target.value))}
                                        >
                                            <option value="0">Select</option>
                                            {expenseTypes.map((obj, idx) => {
                                                return <option key={idx} value={obj.edit}>{obj.expenseType}</option>
                                            })}
                                        </Input>
                                    </FormGroup>
                                </div>
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="mergeInto" className="mr-sm-10">Merge Into</Label>
                                        <Input type="select" id="mergeInto" value={mergeTo}
                                            onChange={(e) => setMergeTo(parseInt(e.target.value))}
                                        >
                                            <option value="0">Select</option>
                                            {expenseTypes.map((obj, idx) => {
                                                return <option key={idx} value={obj.edit}>{obj.expenseType}</option>
                                            })}
                                        </Input>
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="button" color="primary" size="sm" className="w-auto" onClick={handleMerge}>Merge Expense Types</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={"Existing Expense Types"}
                                data={expenseTypes}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        </Main>
    );
}

export default ExpenseTypes;