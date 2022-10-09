import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Input, Button, Form, Label } from 'reactstrap';
import { FormGroup, Switch } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import { NotificationManager } from 'react-notifications';
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from '../../state/index';

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as profileAPI from '../../Api/profile';
import * as Constants from '../Util/constants';

const Profile = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const { updateUserPreferences } = bindActionCreators(actionCreators, dispatch);
    const login = useSelector((state) => state.login);
    const uID = login.user.id;

    const [ loading, setLoading ] = useState(false);
    const [ userData, setUserData ] = useState({});
    const [ notifications, setNotifications ] = useState({
        transactionModification: false,
        missedPromissPay: false,
        chargesPosted: false,
        productUpdate: false
    })
    const [ preferences, setPreferences ] = useState({
        multiProp: false,
        singleCheckbook: false
    });
    const [ signatureName, setSignatureName ] = useState("");
    const [ signatureFont, setSignatureFont ] = useState("");
    const [ signatureStyle, setSignatureStyle ] = useState({});

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(uID === null) {
                history.goBack();
                return;
            }
            const userData = await profileAPI.getUserProfileData(uID);
            setUserData(userData);
            setNotifications({
                transactionModification: parseInt(userData.TransactionMod) === 0 ? false : true,
                missedPromissPay: parseInt(userData.MissedP2P) === 0 ? false : true,
                chargesPosted: parseInt(userData.ChargesPosted) === 0 ? false : true,
                productUpdate: parseInt(userData.ProductUpdateNotifications) === 0 ? false : true
            });
            setPreferences({
                multiProp: parseInt(userData.MultiProp) === 1 ? false : true,
                singleCheckbook: parseInt(userData.SingleCheckbook) === 1 ? false : true
            });
            setSignatureStyle({
                fontSize: '20px',
                fontFamily: `${userData.SignatureFont}, cursive`
            })
            setSignatureFont(userData.SignatureFont);
            setSignatureName(userData.SignatureName);
            setLoading(false);
        }
        fetchData();
    }, [uID, history, setValue])

    const submitChangePassword = async (data) => {
        if(userData.UserPW.trim() !== data.curPassword.trim()) {
            NotificationManager.error("Invalid current password.", "Error");
            return;
        }
        if(data.newPassword.trim() !== data.repeatNewPassword.trim()) {
            NotificationManager.error("Passwords do not match.", "Error");
            return;
        }
        if(data.newPassword.length < 6) {
            NotificationManager.error("New password must have at least 6 characters.", "Error");
            return;
        }
        const res = await profileAPI.updatePassword({
            password: data.newPassword.trim(),
            userID: uID
        });
        if(res !== 0) {
            NotificationManager.errors(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("User Password Updated.", "Success");
    }

    const updateNotifications = async () => {
        const res = await profileAPI.updateNotifications({
            transactionMod: notifications.transactionModification ? 1: 0,
            missedP2P: notifications.missedPromissPay ? 1 : 0,
            chargesPosted: notifications.chargesPosted ? 1 : 0,
            productUpdateNotifications: notifications.productUpdate ? 1 : 0,
            notificationID: userData.NotificationID
        });
        if(res !== 0) {
            NotificationManager.errors(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("User Notifications Updated.", "Success");
    }

    const updPreferences = async () => {
        const res = await profileAPI.updatePreferences({
            singleCheckbook: preferences.singleCheckbook ? 0 : 1,
            multiProp: preferences.multiProp ? 0 : 1,
            notificationID: userData.NotificationID
        });
        if(res !== 0) {
            NotificationManager.errors(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        updateUserPreferences({
            MultiProp: preferences.multiProp ? 0 : 1,
            SingleCheckbook: preferences.singleCheckbook ? 0 : 1
        });
        NotificationManager.success("User Preferences Updated.", "Success");
    }

    const handleSignatureName = (name) => {
        setSignatureName(name);
    }

    const handleSignatureFont = (font) => {
        const style = `${font}, cursive`;
        setSignatureStyle({fontFamily: style, fontSize: '20px'});
        setSignatureFont(font);
    }

    const updSignature = async () => {
        if(signatureName.trim() === '') {
            NotificationManager.error("Signature Name is required.", "Error");
            return;
        }
        if(signatureFont.trim() === '') {
            NotificationManager.error("Signature Font is requried.", "Error");
            return;
        }
        const res = await profileAPI.updateSignature({
            signatureName: signatureName,
            signatureFont: signatureFont,
            userID: uID
        });
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Signature Updated.", "Success");
    }
        
    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Profile..."}
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
                            <span>User: Test User</span>
                        </h2>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12" style={{marginLeft: '1%', marginRight: '1%'}}>
                    <RctCollapsibleCard heading={"Change Password"}>
                        <Form onSubmit={handleSubmit(submitChangePassword)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="curPassword" className="mr-sm-10">Current Password</Label>
                                        <Controller
                                            name="curPassword"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input {...field} type="password" id="curPassword" className="form-control" 
                                                    style={Util.setErrorStyle(errors.curPassword)} /> 
                                            )}
                                        />
                                        {errors.curPassword && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="newPassword" className="mr-sm-10">New Password</Label>
                                        <Controller
                                            name="newPassword"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input {...field} type="password" id="newPassword" className="form-control" 
                                                    style={Util.setErrorStyle(errors.newPassword)} /> 
                                            )}
                                        />
                                        {errors.newPassword && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="repeatNewPassword" className="mr-sm-10">Repeat New Password</Label>
                                        <Controller
                                            name="repeatNewPassword"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Input {...field} type="password" id="repeatNewPassword" className="form-control" 
                                                    style={Util.setErrorStyle(errors.newPassword)} /> 
                                            )}
                                        />
                                        {errors.repeatNewPassword && (
                                            <span style={{ color: "red" }} role="alert">required</span>
                                        )}
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="submit" color="primary" size="sm" className="w-auto">Change Password</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12" style={{marginLeft: '1%', marginRight: '1%'}}>
                    <RctCollapsibleCard heading={"Notifications"}>
                        <Form>
                            <div className="row">
                                <div className="col-sm-2">
                                    <FormGroup check className="mb-20">
                                        <Label for="transactionModification" className="mr-sm-10">Transaction Modifications</Label>
                                        <Switch name="transactionModification" checked={notifications.transactionModification} 
                                            onChange={() => setNotifications((prevState) => ({...prevState, transactionModification: !prevState.transactionModification}))} />
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup check className="mb-20">
                                        <Label for="missedPromissPay" className="mr-sm-10">Missed Promise to Pay</Label>
                                        <Switch name="missedPromissPay" checked={notifications.missedPromissPay} 
                                            onChange={() => setNotifications((prevState) => ({...prevState, missedPromissPay: !prevState.missedPromissPay}))} />
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup check className="mb-20">
                                        <Label for="chargesPosted" className="mr-sm-10">Charges Posted</Label>
                                        <Switch name="chargesPosted" checked={notifications.chargesPosted} 
                                            onChange={() => setNotifications((prevState) => ({...prevState, chargesPosted: !prevState.chargesPosted}))} />
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup check className="mb-20">
                                        <Label for="productUpdateNotifications" className="mr-sm-10">Product Update Notifications</Label>
                                        <Switch name="productUpdateNotifications" checked={notifications.productUpdate} 
                                            onChange={() => setNotifications((prevState) => ({...prevState, productUpdate: !prevState.productUpdate}))} />
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="button" color="primary" size="sm" className="w-auto" onClick={updateNotifications}>Update Notifications</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12" style={{marginLeft: '1%', marginRight: '1%'}}>
                    <RctCollapsibleCard heading={"Preferences"}>
                        <Form>
                            <div className="row">
                                <div className="col-sm-2">
                                    <FormGroup check className="mb-20">
                                        <Label for="multiProp" className="mr-sm-10">Multi-Property Options</Label>
                                        <Switch name="multiProp" checked={preferences.multiProp} 
                                            onChange={() => setPreferences((prevState) => ({...prevState, multiProp: !prevState.multiProp}))} />
                                    </FormGroup>
                                </div>
                                <div className="col-sm-2">
                                    <FormGroup check className="mb-20">
                                        <Label for="singleCheckBook" className="mr-sm-10">Single Checkbook</Label>
                                        <Switch name="singleCheckBook" checked={preferences.singleCheckbook} 
                                            onChange={() => setPreferences((prevState) => ({...prevState, singleCheckbook: !prevState.singleCheckbook}))} />
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="button" color="primary" size="sm" className="w-auto" onClick={() => updPreferences()}>Update Preferences</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12" style={{marginLeft: '1%', marginRight: '1%'}}>
                    <RctCollapsibleCard heading={"User Signature"}>
                        <Form>
                            <div className="row">
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="signatureName" className="mr-sm-10">Signature Name</Label>
                                        <Input type="text" id="signatureName" className="form-control" value={signatureName}
                                            onChange={(e) => handleSignatureName(e.target.value)} /> 
                                    </FormGroup>
                                </div>
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="signatureFont" className="mr-sm-10">Signature Font</Label>
                                        <Input type="select" id="signatureFont" className="form-control" 
                                            onChange={(e) => handleSignatureFont(e.target.value)}
                                            value={signatureFont}
                                        >
                                            <option value="0">Select</option>
                                            {Constants.signatureFonts.map((obj) => {
                                                return <option value={obj.value}>{obj.name}</option>
                                            })}
                                        </Input> 
                                    </FormGroup>
                                </div>
                                <div className="col-sm-3">
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="signature" className="mr-sm-10">Signature</Label>
                                        <Input type="text" id="signature" className="form-control" readOnly 
                                            value={signatureName} style={signatureStyle}
                                        /> 
                                    </FormGroup>
                                </div>
                            </div>
                            <Button type="button" color="primary" size="sm" className="w-auto" onClick={updSignature}>Update Signature</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default Profile;