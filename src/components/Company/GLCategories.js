import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import SweetAlert from 'react-bootstrap-sweetalert';
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as companyAPI from '../../Api/company';

const GLCategories = () => {
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [deleteID, setDeleteID] = useState(0);
    const [updated, setUpdated] = useState(false);

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const arr = [];
            const glCategories = await companyAPI.getGLCategories(propertyID);
            for(const gl of glCategories) {
                arr.push({
                    name: gl.Category,
                    delete: gl.PaymentsCategoryID,
                })
            }
            setCategories(arr);
            setLoading(false);
        }
        fetchData();
    }, [propertyID, updated])

    const columns = [
        { name: 'name', label: 'Category Name', },
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

    const deleteGLCategory = async () => {
        setLoading(true);
        const res = await companyAPI.deleteGLCategories(deleteID);
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
        const res = await companyAPI.addGLCategory({
            categoryName: data.name,
            propertyID
        })
        setLoading(false);
        if(res === -1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(res !== 0) {
            NotificationManager.error(res, "Error");
            return;
        }
        setUpdated(!updated);
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading GL Categories..."}
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
                onConfirm={() => deleteGLCategory()}
                onCancel={() => setDeleteID(0)}
            >
                You will not be able to recover this category!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>GL Categories</span>
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
                                            <Label for="name" className="mr-sm-10">Category Name</Label>
                                            <Controller
                                                name="name"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="task" style={Util.setErrorStyle(errors.name)} />
                                                )}
                                            />
                                            {errors.name && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add Category</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={`Existing Categories - ${categories.length}`}
                                data={categories}
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

export default GLCategories;