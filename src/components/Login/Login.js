import React, { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import QueueAnim from 'rc-queue-anim';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { Form, FormGroup, Input } from 'reactstrap';
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from '../../state/index';
import { NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";

import * as LoginAPI from '../../Api/login';
import * as BillsAPI from '../../Api/bills';
import * as Util from '../Util/util';

const Login = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const { login } = bindActionCreators(actionCreators, dispatch);

    const [ forgetPassword, setForgetPassword ] = useState(false);

    const { handleSubmit, control, formState: { errors }} = useForm({
        defaultValues: { email: "", password: "" }
    });

    const submitForm = async (data) => {
        if(forgetPassword)
            await handleForgetPassword(data);
        else
            await loginUser(data);
    }

    const handleForgetPassword = async (data) => {
            console.log(data);
        const response = await LoginAPI.forgetPassword({
            email: data.email
        });
        if(response!== 0) {
            NotificationManager.error(response, "Error");
            return;
        }
        NotificationManager.success("Your password was sent via email. Please check your spam folder.", "Success!");
    }

    const loginUser = async (data) => {
        const getLogin = await LoginAPI.login({
            email: data.email,
            password: data.userPw
        });
        if(getLogin.length === 0) {
            NotificationManager.error("Invalid username/password.", "Error");
            return;
        }
        const resData = getLogin[0];
        if(parseInt(resData.Active) !== 1) {
            NotificationManager.error("Company is inactive. Please, contact us to reactivate your account", "Error");
            return;
        }
        // get user's properties
        const getProperties = await BillsAPI.getProperties(resData.UserID);
        // get user's notifications
        const notifications = await LoginAPI.getNotifications(resData.UserID);
        login(resData, getProperties, notifications);
        history.push("/");
    }

    const backToLogin = () => {
        setForgetPassword(false)
        history.push("/login");
    }

    const renderLoginForget = () => {
        if(forgetPassword) {
            return (
                <>
                    <FormGroup className="has-wrapper">
                        <span>
                            Enter your email and click on recover password.
                        </span>
                    </FormGroup>
                    <FormGroup className="mb-15">
                        <Button
                            type="button"
                            color="secondary"
                            className="btn-block text-white w-100"
                            variant="contained"
                            size="large"
                            onClick={backToLogin}
                        >
                            Back to Log In
                        </Button>
                    </FormGroup>
                    <FormGroup className="mb-15">
                        <Button
                            type="submit"
                            color="primary"
                            className="btn-block text-white w-100"
                            variant="contained"
                            size="large"
                        >
                            Recover Password
                        </Button>
                    </FormGroup>
                </>
            )
        } else {
            return (
                <>
                    <FormGroup className="has-wrapper">
                        <Controller
                            name="userPw"
                            control={control}
                            defaultValue=""
                            rules={{ required: true }}
                            render={({ field: { ref, onChange, ...field } }) => (
                                <Input
                                    {...field}
                                    type="Password"
                                    id="userPw"
                                    innerRef={ref}
                                    onChange={({ target: { value } }) => onChange(value)}
                                    className="has-input input-lg"
                                    placeholder="Password"
                                    aria-invalid={!!errors.userPw}
                                    style={Util.setErrorStyle(errors.userPw)}
                                />
                            )}
                        />
                        <span className="has-icon"><i className="ti-lock"></i></span>
                        {errors.userPw && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </FormGroup>
                    <FormGroup className="has-wrapper">
                        <Link onClick={() => setForgetPassword(true)}>
                            Forgot Password?
                        </Link>
                    </FormGroup>
                    <FormGroup className="mb-15">
                        <Button
                            type="submit"
                            color="primary"
                            className="btn-block text-white w-100"
                            variant="contained"
                            size="large"
                        >
                            Log In
                        </Button>
                    </FormGroup>
                </>
            )
        }
    }

    return (
        <QueueAnim type="bottom" duration={2000}>
            <div className="rct-session-wrapper">
                <AppBar position="static" className="session-header">
                    <Toolbar>
                        <div className="container">
                            <div className="d-flex justify-content-between">
                                <div className="session-logo">
                                <Link to="/">
                                    <img src={`${process.env.PUBLIC_URL}/assets/images/logo-white.png`} alt="session-logo" className="img-fluid" width="110" height="35" />
                                </Link>
                                </div>
                                <div>
                                <Button variant="contained" className="btn-light" onClick={() => window.open("https://myirent.com", "_blank")}>Create an Account</Button>
                                </div>
                            </div>
                        </div>
                    </Toolbar>
                </AppBar>
                <div className="session-inner-wrapper">
                    <div className="container">
                        <div className="row row-eq-height">
                            <div className="col-sm-8 offset-md-2">
                                <div className="session-body text-center">
                                    <div className="session-head mb-30">
                                        <h2 className="font-weight-bold">Log into iRent</h2>
                                        <p className="mb-0">iRent, a full featured Property Management Software</p>
                                    </div>
                                    <Form onSubmit={handleSubmit(submitForm)}>
                                        <FormGroup className="has-wrapper">
                                            <Controller
                                                name="email"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: true }}
                                                render={({ field: { ref, onChange, ...field } }) => (
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        id="email"
                                                        innerRef={ref}
                                                        onChange={({ target: { value } }) => onChange(value)}
                                                        className="has-input input-lg"
                                                        placeholder="Enter Email Address"
                                                        aria-invalid={!!errors.email}
                                                        style={Util.setErrorStyle(errors.email)}
                                                    />
                                                )}
                                            />
                                            <span className="has-icon"><i className="ti-email"></i></span>
                                            {errors.email && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                        {renderLoginForget()}
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </QueueAnim>
    );
}

export default Login;