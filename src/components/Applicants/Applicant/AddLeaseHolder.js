import React, {useState, useEffect} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import NumberFormat from 'react-number-format';
import SweetAlert from 'react-bootstrap-sweetalert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';

const AddLeaseHolder = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const user = login.user;
    const userID = user.id;
    const tenantID = props.location.state ? props.location.state.tenantID : null;
    const name = props.location.state ? props.location.state.name : null;

    const [loading, setLoading] = useState(false);
    const [deleteAdditonalLeaseHolderID, setDeleteAdditionalLeaseHodlerID] = useState(0);
    const [editLeaseHolderID, setEditLeaseHodlerID] = useState(0)
    const [additionalLeaseHodlers, setAdditionalLeaseHolders] = useState([]);
    const [update, setUpdate] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            if(tenantID === null) {
                history.goBack();
                return;
            }
            setLoading(true)
            const othersOnLease = await applicantsAPI.getOthersOnLease(tenantID);
            let arr = [];
            for(const ool of othersOnLease) {
                arr.push({
                    name: `${ool.FirstName} ${ool.LastName}`,
                    phone: ool.Phone,
                    email: ool.eMail,
                    ssn: ool.SSN,
                    dob: moment.utc(ool.DOB).format("MM/DD/YYYY"),
                    edit: ool,
                    delete: ool.TenantsOthersOnLeaseID
                });
            }
            setAdditionalLeaseHolders(arr);
            setLoading(false)
        }
        fetchData();
    }, [tenantID, update, history])

    const columns = [
        { name: 'name', label: 'Name', },
        { name: 'phone', label: 'Phone', 
            options: {
                customBodyRender: (value) => {
                    if(value !== '') {
                        return (
                            <a href={`tel:${value}`}>
                                <NumberFormat value={value} format="(###) ###-####" displayType={'text'} />
                            </a>
                        );
                    }
                }
            }
        },
        { name: 'email', label: 'Email', },
        { name: 'ssn', label: 'SSN', 
            options: {
                customBodyRender: (value) => {
                    if(value !== '') {
                        const res = value.length > 4 ? '***-***-' + value.substring(value.length - 4) : value;
                        return <span>{res}</span>
                    }
                }
            }
        },
        { name: 'dob', label: 'Dob', },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                setValue('firstName', value.FirstName);
                                setValue('lastName', value.LastName);
                                setValue('phone', value.Phone);
                                setValue('email', value.eMail);
                                setValue('ssn', value.SSN);
                                setValue('dob', moment.utc(value.DOB).format("YYYY-MM-DD"));
                                setValue('driversLicense', value.DriversLicense !== null && value.DriversLicense !== 'null' ? value.DriversLicense : '');
                                setValue('dlState', value.DLState !== null && value.DLState !== 'null' ? value.DLState : '');
                                setEditLeaseHodlerID(parseInt(value.TenantsOthersOnLeaseID))
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
                                setDeleteAdditionalLeaseHodlerID(parseInt(value));
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
        customSearch: (searchQuery, currentRow, columns) => {
            let found = false;
            currentRow.forEach(element => {
                if(element === null)    found = false;
                else if(typeof element === 'object') {
                    if(element.FirstName !== null && element.FirstName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.LastName !== null && element.LastName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.Phone !== null && element.Phone.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                } else if(element.toString().toUpperCase().includes(searchQuery.toUpperCase())){
                    found = true;
                }
            });
            return found;
        }
    }

    const submitForm = async (data) => {
        if(editLeaseHolderID !== 0) {
            setLoading(true)
            const res = await applicantsAPI.updateLeaseHolder({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                email: data.email,
                ssn: data.ssn,
                dob: data.dob,
                userID,
                driverslicense: data.driversLicense !== undefined ? data.driversLicense : '',
                dlState: data.dlState !== undefined ? data.dlState : '',
                tenantsOthersOnLeaseID: parseInt(editLeaseHolderID)
            });
            setLoading(false);
            if(res !== 0) {
                NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
                return
            }
            setUpdate(!update);
            NotificationManager.success("Lease Holder Updated.", "Success");
        } else {
            setLoading(true)
            const res = await applicantsAPI.addLeaseHolder({
                tenantID,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                email: data.email,
                ssn: data.ssn,
                dob: data.dob,
                userID,
                driverslicense: data.driversLicense !== undefined ? data.driversLicense : '',
                dlState: data.dlState !== undefined ? data.dlState : ''
            });
            setLoading(false);
            if(res !== 0) {
                NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
                return
            }
            setUpdate(!update);
            NotificationManager.success("Lease Holder Added.", "Success");
        }
    }

    const deleteAddLeaseHolder = async () => {

    }

    const cancelEdit = () => {
        setValue('firstName', '');
        setValue('lastName', '');
        setValue('phone', '');
        setValue('email', '');
        setValue('ssn', '');
        setValue('dob', '');
        setValue('driversLicense', '');
        setValue('dlState', '');
        setEditLeaseHodlerID(0);
    }

    const renderButtons = () => {
        return (
            <>
                <Button type="submit" color="primary" style={{marginTop: '1rem'}}>
                    {editLeaseHolderID !== 0 ? 'Edit Lease Holder' : 'Add Lease Holder'}
                </Button>
                {editLeaseHolderID !== 0 ?
                    <>
                        {' '}
                        <Button type="button" color="warning" style={{marginTop: '1rem'}} onClick={cancelEdit}> Cancel </Button> 
                    </>
                    : 
                    ''
                }
            </>
        )
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Add Additional Lease Holders...`}
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
                show={deleteAdditonalLeaseHolderID !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteAddLeaseHolder()}
                onCancel={() => setDeleteAdditionalLeaseHodlerID(0)}
            >
                You won't be able to recover the lease holder. 
            </SweetAlert>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => {
                        history.goBack()
                    }}></i>
                    <h2>
                        <span>Add/Edit Additional Lease Holders onto Lease of {name}</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="firstName" className="mr-sm-10">First Name</Label>
                                    <Controller
                                        name="firstName"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="firstName" style={Util.setErrorStyle(errors.firstName)} />
                                        )}
                                    />
                                    {errors.firstName && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-3">
                                    <Label for="lastName" className="mr-sm-10">Last Name</Label>
                                    <Controller
                                        name="lastName"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="lastName" style={Util.setErrorStyle(errors.lastName)} />
                                        )}
                                    />
                                    {errors.lastName && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>   
                                <div className="col-sm-3">
                                    <Label for="phone" className="mr-sm-10">Phone</Label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="phone" style={Util.setErrorStyle(errors.phone)} />
                                        )}
                                    />
                                    {errors.phone && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>        
                            </div>
                            <div className="row">
                                <div className="col-sm-4">
                                    <Label for="email" className="mr-sm-10">Email</Label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="email" style={Util.setErrorStyle(errors.email)} />
                                        )}
                                    />
                                    {errors.email && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>  
                                <div className="col-sm-3">
                                    <Label for="ssn" className="mr-sm-10">ssn</Label>
                                    <Controller
                                        name="ssn"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="ssn" style={Util.setErrorStyle(errors.ssn)} />
                                        )}
                                    />
                                    {errors.ssn && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div> 
                                <div className="col-sm-2">
                                    <Label for="dob" className="mr-sm-10">DOB</Label>
                                    <Controller
                                        name="dob"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="dob" style={Util.setErrorStyle(errors.dob)} />
                                        )}
                                    />
                                    {errors.dob && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div> 
                            </div>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="driversLicense" className="mr-sm-10">Driver's License</Label>
                                    <Controller
                                        name="driversLicense"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" id="driversLicense" />
                                        )}
                                    />
                                </div> 
                                <div className="col-sm-3">
                                    <Label for="dlState" className="mr-sm-10">Driver's License State</Label>
                                    <Controller
                                        name="dlState"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="dlState">
                                                <option value="">Select</option>
                                                {Constants.usStates.map((obj, idx) => {
                                                    return <option key={idx} value={obj.abbreviation}>{obj.name}</option>
                                                })}
                                            </Input>
                                        )}
                                    />
                                </div> 
                            </div>
                            {renderButtons()}
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Current On Lease Of - ${name}`}
                            data={additionalLeaseHodlers}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        </Main>
    );
}

export default AddLeaseHolder;