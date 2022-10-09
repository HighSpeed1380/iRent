import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
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
import * as Constants from '../Util/constants';
import LinearProgress from '../Util/LinearProgress';
import * as vendorsAPI from '../../Api/vendors';
import * as Util from '../Util/util';

const Vendors = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [ loading, setLoading ] = useState(false);
    const [ vendors, setVendors ] = useState([]);
    const [ delVendorID, setDelVendorID ] = useState(0);
    const [ showDelete, setShowDelete ] = useState(false);
    const [ updated, setUpdated ] = useState(false);
    const [ mergeFrom, setMergeFrom ] = useState(0);
    const [ mergeTo, setMergeTo ] = useState(0);

    const { handleSubmit, control, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const vendorsData = await vendorsAPI.getAll(companyID);
            let arr = [];
            for(const v of vendorsData) {
                let _1099 = 'No';
                if(parseInt(v.A1099) === 1) 
                    _1099 = "1099-INT";
                else if(parseInt(v.A1099) === 2)
                    _1099 = "1099-MISC";

                arr.push({
                    vendorName: v.VendorName,
                    contactInfo: v,
                    routingAccount: v,
                    address: v,
                    memo: v.Memo,
                    1099: _1099,
                    edit: v.VendorID,
                    delete: v.VendorID
                });
            }
            setVendors(arr);
            setLoading(false)
        }
        fetchData();
    }, [companyID, updated]);

    const submitForm = async (data) => {
        setLoading(true);
        const res = await vendorsAPI.add({
            name: data.vendorName,
            companyID,
            address1: data.vendorAddress1,
            address2: data.vendorAddress2 !== undefined ? data.vendorAddress2 : '',
            city: data.vendorCity,
            state: data.vendorState,
            zip: data.vendorPostalCode,
            email: data.vendorEmail,
            phone: data.vendorPhone,
            routing: data.vendorRouting !== undefined ? data.vendorRouting : '',
            account: data.vendorAccount !== undefined ? data.vendorAccount : '',
            ein: data.vendorEIN !== undefined ? data.vendorEIN : '',
            a1099: parseInt(data.vendor1099),
            memo: data.vendorMemo !== undefined ? data.vendorMemo : ''
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Vendor Added.", "Success")
    }

    const deleteVendor = async () => {
        setLoading(true);
        const res = await vendorsAPI.deactive(delVendorID);
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        setDelVendorID(0);
        setShowDelete(false);
        NotificationManager.success("Vendor deleted.", "Success");
    }

    const mergeVendors = async () => {
        if(mergeFrom === 0) {
            NotificationManager.error("Please select Merge This Vendor.");
            return;
        }
        if(mergeTo === 0) {
            NotificationManager.error("Please select Into This Vendor.");
            return;
        }
        if(mergeFrom === mergeTo) {
            NotificationManager.error("Please select different vendors to merge.");
            return;
        }
        const res = await vendorsAPI.merge({
            vendor1ID: mergeFrom,
            vendor2ID: mergeTo
        });
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Vendors merged.", "Success");
    }

    const columns = [
        { name: 'vendorName', label: 'Vendor Name'},
        { name: 'contactInfo', label: 'Contact Info',
            options: {
                customBodyRender: (value) => {
                    const Mailto = () => {
                        return (
                          <a href={`mailto:${value.VendorEmail}`}>
                            {value.VendorEmail}
                          </a>
                        );
                    }
                    return (
                        <p>
                            {value.VendorPhone} <br/>
                            <Mailto />
                        </p>
                    );
                }
            }
        },
        { name: 'routingAccount', label: 'Routing/Account Number',
            options: {
                customBodyRender: (value) => {
                    const routing = value.RoutingNumber !== '0' ? `XXXXX${value.RoutingNumber.substring(value.RoutingNumber.length-4)}` : '';
                    const account = value.AcountNumber !== '0' ? `XXXXX${value.AcountNumber.substring(value.AcountNumber.length-4)}` : '';
                    return (
                        <p>
                            {routing} <br />
                            {account}
                        </p>
                    )
                }
            }
        },
        { name: 'address', label: 'Address',
            options: {
                customBodyRender: (value) => {
                    return (
                        <p>
                            {value.VendorAddress1} {value.VendorAddress2} <br/>
                            {value.VendorCity} {value.VendorState} {value.VendorZip}
                        </p>
                    )
                }
            }
        },
        { name: 'memo', label: 'Memo'},
        { name: '1099', label: '1099'},
        { name: 'edit', label: 'Edit',
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/vendor/edit',
                                    state: { vendorID: value }
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
                                setDelVendorID(parseInt(value));
                                setShowDelete(true)
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    )
                }
            },
        }
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        rowsPerPage: 100,
        selectableRows: "none",
        customSearch: (searchQuery, currentRow, columns) => {
            let found = false;
            currentRow.forEach(element => {
                if(element === null)    found = false;
                else if(typeof element === 'object') {
                    if(element.VendorName !== null && element.VendorName.toString().trim().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorPhone !== null && element.VendorPhone.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorEmail !== null && element.VendorEmail.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorAddress1 !== null && element.VendorAddress1.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorAddress2 !== null && element.VendorAddress2.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorCity !== null && element.VendorCity.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorZip !== null && element.VendorZip.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.VendorState !== null && element.VendorState.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                } else if(element.toString().trim().toUpperCase().includes(searchQuery.toUpperCase())){
                    found = true;
                }
            });
            return found;
        }
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Vendors..."}
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
                show={showDelete}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteVendor()}
                onCancel={() => { setShowDelete(false); setDelVendorID(0); }}
            >
                You will not be able to recover this vendor!
            </SweetAlert>

            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" onClick={() => history.goBack()} style={{cursor: 'pointer'}}></i>
                    <h2>
                        <span>Vendors</span>
                    </h2>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Add Vendor">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorName" className="mr-sm-10">Name</Label>
                                    <Controller
                                        name="vendorName"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorName" style={Util.setErrorStyle(errors.vendorName)} />
                                        )}
                                    />
                                    {errors.vendorName && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorPhone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="vendorPhone"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorPhone" style={Util.setErrorStyle(errors.vendorPhone)} />
                                        )}
                                    />
                                    {errors.vendorPhone && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorEmail" className="mr-sm-10">Email</Label>
                                    <Controller
                                        name="vendorEmail"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorEmail" style={Util.setErrorStyle(errors.vendorEmail)} />
                                        )}
                                    />
                                    {errors.vendorEmail && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="vendorAddress1" className="mr-sm-10">Address 1</Label>
                                    <Controller
                                        name="vendorAddress1"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorAddress1" style={Util.setErrorStyle(errors.vendorAddress1)} />
                                        )}
                                    />
                                    {errors.vendorAddress1 && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorAddress2" className="mr-sm-10">Address 2</Label>
                                    <Controller
                                        name="vendorAddress2"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorAddress2" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorCity" className="mr-sm-10">City</Label>
                                    <Controller
                                        name="vendorCity"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorCity" style={Util.setErrorStyle(errors.vendorCity)} />
                                        )}
                                    />
                                    {errors.vendorCity && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorState" className="mr-sm-10">State</Label>
                                    <Controller
                                        name="vendorState"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="vendorState" style={Util.setErrorStyle(errors.vendorState)} >
                                                <option value="0">Select</option>
                                                {Constants.usStates.map((obj) => {
                                                    return <option value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.vendorState && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorPostalCode" className="mr-sm-10">Postal Code</Label>
                                    <Controller
                                        name="vendorPostalCode"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorPostalCode" style={Util.setErrorStyle(errors.vendorPostalCode)} />
                                        )}
                                    />
                                    {errors.vendorPostalCode && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <Label for="vendorMemo" className="mr-sm-10">Memo</Label>
                                    <Controller
                                        name="vendorMemo"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="vendorMemo" />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="vendorRouting" className="mr-sm-10">Routing Number</Label>
                                    <Controller
                                        name="vendorRouting"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorRouting" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorAccount" className="mr-sm-10">Account Number</Label>
                                    <Controller
                                        name="vendorAccount"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorAccount" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendorEIN" className="mr-sm-10">Tax ID (EIN)</Label>
                                    <Controller
                                        name="vendorEIN"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="number" id="vendorEIN" />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-3">
                                    <Label for="vendor1099" className="mr-sm-10">1099 Required?</Label>
                                    <Controller
                                        name="vendor1099"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="vendor1099">
                                                <option value="3">None Required</option>
                                                <option value="1">1099-INT</option>
                                                <option value="2">1099-MISC</option>
                                            </Input>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add Vendor</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Merge Vendors">
                        <Form>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="mergeFrom" className="mr-sm-10">Merge This Vendor</Label>
                                    <Controller
                                        name="mergeFrom"
                                        control={control}
                                        value={mergeFrom}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="mergeFrom" onChange={(e) => setMergeFrom(parseInt(e.target.value))}>
                                                <option value="0">Select</option>
                                                {vendors.map((obj) => {
                                                    return <option value={obj.vendorID}>{obj.vendorName}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                </div>
                                <div className="col-sm-4">
                                    <Label for="mergeTo" className="mr-sm-10">Into This Vendor</Label>
                                    <Controller
                                        name="mergeTo"
                                        control={control}
                                        value={mergeTo}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="mergeTo" onChange={(e) => setMergeTo(parseInt(e.target.value))}>
                                                <option value="0">Select</option>
                                                {vendors.map((obj) => {
                                                    return <option value={obj.vendorID}>{obj.vendorName}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="button" color="primary" style={{marginTop: '10px'}} onClick={mergeVendors}>Merge Vendors</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Existing Vendors`}
                            data={vendors}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        </Main>
    )
}

export default Vendors;