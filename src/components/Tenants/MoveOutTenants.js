import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { 
    FormGroup, Dialog, Slide, Switch,
    AppBar, Toolbar, IconButton
} from '@material-ui/core';
import { Badge } from 'reactstrap';
import NumberFormat from 'react-number-format';
import {
	Button,
	Form,
	Label,
	Input,
} from 'reactstrap';
import CloseIcon from '@material-ui/icons/Close';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { NotificationManager } from 'react-notifications';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantsAPI from '../../Api/tenants';
import * as constants from '../Util/constants';
import * as Util from '../Util/util';

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const MoveOutTenant = (props) => {
    const tenant = props.tenant;
    const tID = tenant.TenantID;
    const pID = tenant.PropertyID;
    const uID = tenant.UnitID;
    const companyID = props.companyID;
    const userID = props.userID;
    
    const [ balance, setBalance ] = useState(0);
    const [ refundDeposit, setRefundDeposit ] = useState(0);
    const [ loading, setLoading ] = useState(true);
    const [ loadingMSG, setLoadingMSG ] = useState("Loading...");
    const [ formData, setFormData ] = useState({
        moveOutDate: moment(tenant.MoveOutDate).format('YYYY-MM-DD'),
        forwardingAddress: '',
        selectedMoveOutReason: 0,
        city: '',
        state: 0,
        zip: '',
        email: '',
        phone: '',
        rentAgain: true,
        whiteList: false,
        sendSecDeposit: false,
        refundAmount: 0,
        comments: ''
    });
    const [ moveOutReason, setMoveOutReason ] = useState([]);

    const { handleSubmit, control, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tID !== undefined) {
                setBalance(parseFloat(await tenantsAPI.getTenantBalance(tID)).toFixed(2));
                setRefundDeposit(parseFloat(await tenantsAPI.getRefundableDeposit(tID)).toFixed(2));
                setMoveOutReason(await tenantsAPI.getMoveOutReasons(companyID));
            }
            setLoading(false);
        }
        fetchData();
    }, [tID, companyID]);

    const handleClose = () => props.setOpenMoveOut(false);

    const submitForm = async (data) => {
        if(formData.selectedMoveOutReason === 0) {
            NotificationManager.error("Move Out Reason is requried.", "Error");
            return;
        }
        if(parseInt(formData.state) === 0) {
            NotificationManager.error("State is requried.", "Error");
            return;
        }
        setLoadingMSG("Saving...");
        setLoading(true);
        const res = await tenantsAPI.moveOut({
            moveOutDate: formData.moveOutDate,
            whiteList: formData.whiteList ? 1 : 0,
            tenantID: tID,
            unitID: uID,
            moveOutReasonID: formData.selectedMoveOutReason,
            propertyID: pID,
            userID,
            tenantEmail: data.email,
            tenantPhone: data.phone,
            address: data.forwardingAddress,
            city: data.city,
            state: formData.state,
            zip: data.zip,
            collections: 0,
            rentAgain: formData.rentAgain ? 1 : 2,
            comment: data.comments,
            secDepositRefund: formData.sendSecDeposit,
            refundAmount: formData.refundAmount === '' ? 0 : parseFloat(formData.refundAmount),
            tenantFName: tenant.TenantFName,
            tenantLName: tenant.TenantLName
        });
        if(res !== 0) {
            setLoading(false);
            setLoadingMSG("Loading...");
            NotificationManager.error("Error processing your request. Please, contact us", "Error");
            return;
        }
        setFormData({
            moveOutDate: moment(tenant.MoveOutDate).format('YYYY-MM-DD'),
            forwardingAddress: '',
            selectedMoveOutReason: 0,
            city: '',
            state: 0,
            zip: '',
            email: '',
            phone: '',
            rentAgain: true,
            whiteList: false,
            sendSecDeposit: false,
            refundAmount: 0,
            comments: ''
        });
        await props.getData();
        props.setOpenMoveOut(false);
        setLoadingMSG("Loading...");
        setLoading(false);
    }

    const renderContent = () => {
        return (
            <p>
                Balance Owed: {' '}
                <Badge className="mb-10 mr-10" color={balance > 0 ? "danger" : "success"}>
                    <NumberFormat value={balance} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                </Badge>
                {' '} 
                Refundable Security Deposit: {' '}
                <Badge className="mb-10 mr-10" color={refundDeposit > 0 ? "danger" : "dark"}>
                    <NumberFormat value={refundDeposit} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                </Badge>
            </p>
        )
    }

    const render = () => {
        if(loading) {
            return (
                <div style={{marginTop: '80px'}}>
                    <RctCollapsibleCard
                        colClasses="col-xs-12 col-sm-12 col-md-12"
                        heading={loadingMSG}
                    >
                        <LinearProgress />
                    </RctCollapsibleCard>
                </div>
            );
        } else {
            const balanceWarning = () => {
                if(balance > 0) {
                    return (
                        <div className="col-sm-5">
                            <FormGroup check className="mb-20">
                                <div className="alert alert-danger fade show" role="alert" style={{top: '20px'}}>
                                    Do not request refund if Tenant still owes balance.
                                </div>
                            </FormGroup>
                        </div>
                    );
                }
            }
            const moveOutReasonLabel = () => {
                return (
                    <>
                        Move Out Reason: {' '}
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                window.location = `./index.cfm?P=219`;
                            }}
                            style={{color: 'blue', maxHeight: '10px'}}
                        >
                            <AddCircleOutline />
                        </IconButton>
                    </>
                );
            }
            return (
                <div style={{marginLeft: '10px'}}>
                    <div className="row" style={{marginTop: '100px'}}>
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            {renderContent()}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            
                                <div className="row">
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="moveOutDate" className="mr-sm-10">Move Out Date</Label>
                                            <Controller
                                                name="moveOutDate"
                                                control={control}
                                                defaultValue={formData.moveOutDate}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <DatePicker 
                                                        {...field}
                                                        id="moveOutDate"
                                                        innerRef={ref}
                                                        value={formData.moveOutDate}
                                                        onChange={(e) => setFormData({...formData, moveOutDate: e ? moment(e).format('YYYY-MM-DD') : ''})}
                                                        aria-invalid={!!errors.moveOutDate}
                                                        style={Util.setErrorStyle(errors.moveOutDate)}
                                                    />
                                                )}
                                            />
                                            {errors.moveOutDate && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="moveOutReason" className="mr-sm-10">{moveOutReasonLabel()}</Label>
                                            <Controller
                                                name="moveOutReason"
                                                control={control}
                                                defaultValue={formData.selectedMoveOutReason}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="select"
                                                        id="moveOutReason"
                                                        innerRef={ref}
                                                        value={formData.selectedMoveOutReason}
                                                        onChange={(e) => setFormData({...formData, selectedMoveOutReason: e.target.value})}
                                                        aria-invalid={!!errors.moveOutReason}
                                                        style={Util.setErrorStyle(errors.moveOutReason)}
                                                    >
                                                        <option value="0">Select</option>
                                                        {moveOutReason.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.MoveOutReasonID} 
                                                                    value={obj.MoveOutReasonID}
                                                                >
                                                                    {obj.MoveOutReason}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                            {errors.moveOutReason && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-6">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="forwardingAddress" className="mr-sm-10">Forwarding Address:</Label>
                                            <Controller
                                                name="forwardingAddress"
                                                control={control}
                                                defaultValue={formData.forwardingAddress}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        id="forwardingAddress"
                                                        innerRef={ref}
                                                        value={formData.forwardingAddress}
                                                        onChange={(e) => setFormData({...formData, forwardingAddress: e.target.value})}
                                                        aria-invalid={!!errors.forwardingAddress}
                                                        style={Util.setErrorStyle(errors.forwardingAddress)}
                                                    />
                                                )}
                                            />
                                            {errors.forwardingAddress && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="city" className="mr-sm-10">City:</Label>
                                            <Controller
                                                name="city"
                                                control={control}
                                                defaultValue={formData.city}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        id="city"
                                                        innerRef={ref}
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                        aria-invalid={!!errors.city}
                                                        style={Util.setErrorStyle(errors.city)}
                                                    />
                                                )}
                                            />
                                            {errors.city && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="state" className="mr-sm-10">State:</Label>
                                            <Controller
                                                name="state"
                                                control={control}
                                                defaultValue={formData.state}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="select"
                                                        id="state"
                                                        innerRef={ref}
                                                        value={formData.state}
                                                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                                                        aria-invalid={!!errors.state}
                                                        style={Util.setErrorStyle(errors.state)}
                                                    >
                                                        <option value="0">Select</option>
                                                        {constants.usStates.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.abbreviation} 
                                                                    value={obj.abbreviation}
                                                                >
                                                                    {obj.name}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                )}
                                            />
                                            {errors.state && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="zip" className="mr-sm-10">Zip:</Label>
                                            <Controller
                                                name="zip"
                                                control={control}
                                                defaultValue={formData.zip}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        id="zip"
                                                        innerRef={ref}
                                                        value={formData.zip}
                                                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                                                        aria-invalid={!!errors.zip}
                                                        style={Util.setErrorStyle(errors.zip)}
                                                    />
                                                )}
                                            />
                                            {errors.zip && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="email" className="mr-sm-10">Email:</Label>
                                            <Controller
                                                name="email"
                                                control={control}
                                                defaultValue={formData.email}
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        id="email"
                                                        innerRef={ref}
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                        aria-invalid={!!errors.email}
                                                        style={Util.setErrorStyle(errors.email)}
                                                    />
                                                )}
                                            />
                                            {errors.email && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="phone" className="mr-sm-10">Phone:</Label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                defaultValue={formData.phone}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="text"
                                                        id="phone"
                                                        innerRef={ref}
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup check className="mb-20">
                                            <Label for="rentAgain" className="mr-sm-10">Rent this person again?</Label>
                                            <Switch name="rentAgain" checked={formData.rentAgain} onChange={() => setFormData({...formData, rentAgain: !formData.rentAgain})} />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup check className="mb-20">
                                            <Label for="whiteList" className="mr-sm-10">Send to Whitelist?</Label>
                                            <Switch name="whiteList" checked={formData.whiteList} onChange={() => setFormData({...formData, whiteList: !formData.whiteList})} />
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-2">
                                        <FormGroup check className="mb-20">
                                            <Label for="sendSecDeposit" className="mr-sm-10">Refund Security Deposit?</Label>
                                            <Switch name="sendSecDeposit" checked={formData.sendSecDeposit} onChange={() => setFormData({...formData, sendSecDeposit: !formData.sendSecDeposit})} />
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-2">
                                        <FormGroup check className="mb-20">
                                            <Label for="refundAmount" className="mr-sm-10">Refund Amount</Label>
                                            <Controller
                                                name="refundAmount"
                                                control={control}
                                                defaultValue={formData.refundAmount}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <NumberFormat
                                                        {...field}
                                                        id="refundAmount"
                                                        innerRef={ref}
                                                        value={formData.refundAmount}
                                                        thousandSeparator={true}
                                                        prefix={"$"}
                                                        onValueChange={(v) => {
                                                            setFormData({...formData, refundAmount: v.floatValue === undefined ? 0 : v.floatValue})
                                                        }}
                                                        className="form-control"
                                                    />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                    {balanceWarning()}
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormGroup check className="mb-20">
                                            <Label for="comments" className="mr-sm-10">Comments</Label>
                                            <Controller
                                                name="comments"
                                                control={control}
                                                defaultValue={formData.comments}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        rows={5}
                                                        type="textarea"
                                                        id="comments"
                                                        innerRef={ref}
                                                        value={formData.comments}
                                                        onChange={(e) => setFormData({...formData, comments: e.target.value})}
                                                    />
                                                )}
                                            />
                                        </FormGroup>
                                    </div>
                                </div>
                            
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div>
            <Dialog open={props.open} onClose={handleClose} 
                fullScreen TransitionComponent={Transition}
            >
                <Form onSubmit={handleSubmit(submitForm)}>
                <AppBar className="bg-primary">
                    <Toolbar>
                        <IconButton color="inherit" onClick={handleClose} aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                        <h5 className="w-100 mb-0">Move Out Tenant - {tenant.TenantFName} {tenant.TenantLName}</h5>
                        <Button type="submit" color="inherit">Confirm</Button>
                    </Toolbar>
                </AppBar>
                {render()}
                </Form>
            </Dialog>
        </div>
    )
}

export default MoveOutTenant;