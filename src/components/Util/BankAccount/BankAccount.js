import React, {useState, useEffect} from 'react';
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup  } from '@material-ui/core';
import { Controller, useForm } from "react-hook-form";
import Alert from '@material-ui/lab/Alert';
import MatButton from '@material-ui/core/Button';
import Modal from 'react-modal';
import { NotificationManager } from 'react-notifications';

import * as Util from '../util';
import * as companyAPI from '../../../Api/company';
import * as Constants from '../../Util/constants';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';

const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-8%',
      transform: 'translate(-50%, -50%)',
    },
};

const BankAccount = (props) => {

    const [isVerified, setIsVerified] = useState(false);
    const [bankAccProvided, setBankAccProvided] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [verifyingAccount, setVerifyingAccount] = useState(false);
    const [amountValidation1, setAmountValidation1] = useState('');
    const [amountValidation2, setAmountValidation2] = useState('');
    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        setValue("accountName", props.bank.accountName !== undefined ? props.bank.accountName : '');
        setValue("accountNumber", props.bank.accountNumber !== undefined ? props.bank.accountNumber : '');
        setValue("accountRouting", props.bank.accountRouting !== undefined ? props.bank.accountRouting : '');
        setIsVerified(props.bank.verified)
        let verified = false;
        if(props.bank.accountName !== undefined && props.bank.accountName !== '')
            verified = true
        setBankAccProvided(verified);
    }, [props, setValue])

    const submitBankAccount = async (data) => {
        props.updBank(data)
    }


    const renderVerifyBankAccount = () => {
        if(!isVerified && bankAccProvided) {
            return (
                <Alert severity="warning">
                    Bank Account Not Verified.
                    <MatButton style={{height: '1.5rem'}} onClick={() => setShowVerify(true)}>Click here to verify.</MatButton>
                </Alert>
            );
        } else {
            return (
                <Alert severity="success">
                    Bank Account Verified.
                </Alert>
            );
        }
    }

    const checkBankAccount = async () => {
        if(amountValidation1 === '' || amountValidation2 === '') {
            NotificationManager.error("Please, enter both small deposits.", "Error")
            return;
        }   
        setVerifyingAccount(true);
        const res = await companyAPI.verifyBank({
            amount1: parseFloat(amountValidation1),
            amount2: parseFloat(amountValidation2),
            companyID: props.companyID
        });
        setVerifyingAccount(false);
        if(res === -1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(res !== 0) {
            NotificationManager.error(res, "Error")
            return;
        }
        props.setUpdated(!props.updated);
    }
    
    const renderModalContent = () => {
        if(verifyingAccount) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Processing..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            )
        }
        return (
            <Form>
                <p>Enter the two small deposits received in your account.</p>
                <div className="row">
                    <div className="col-sm-6">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="amount1Validation" className="mr-sm-10">First Deposit</Label>
                            <Input type="number" id="amount1Validation" name="amount1Validation" 
                                value={amountValidation1} onChange={(e) => setAmountValidation1(e.target.value)}
                            />
                        </FormGroup>
                    </div>
                    <div className="col-sm-6">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="amount2Validation" className="mr-sm-10">Second Deposit</Label>
                            <Input type="number" id="amount2Validation" name="amount2Validation" 
                                value={amountValidation2} onChange={(e) => setAmountValidation2(e.target.value)}
                            />
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <Alert severity="info" style={{marginBottom: '1%'}}>
                        Please wait 2 business days after entering your bank account to receive the confirmation deposits.
                    </Alert>
                    <Alert severity="warning" style={{marginBottom: '1%'}}>
                        There is a limit of 10 failed verification attempts. Once this limit has been crossed, the bank account will be unable to be verified.
                    </Alert>
                </div>
                <Button type="button" color="primary" size="sm" className="w-auto" onClick={checkBankAccount}>Verify Bank Account</Button>
            </Form>
        );
    }

    return (
        <>
            <Modal
                isOpen={showVerify}
                onRequestClose={() => setShowVerify(false)}
                contentLabel="Verify Bank Account"
                style={modalStyles}
            >
                {renderModalContent()}
            </Modal>
            <Form onSubmit={handleSubmit(submitBankAccount)}>
                <div className="row">
                    <div className="col-sm-10">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="accountName" className="mr-sm-10">Account Holder Name</Label>
                            <Controller
                                name="accountName"
                                control={control}
                                rules={{required: true}}
                                render={({ field }) => (
                                    <Input {...field} type="text" id="accountName" style={Util.setErrorStyle(errors.accountName)} />
                                )}
                            />
                            {errors.accountName && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="accountRouting" className="mr-sm-10">Routing Number</Label>
                            <Controller
                                name="accountRouting"
                                control={control}
                                rules={{required: true}}
                                render={({ field }) => (
                                    <Input {...field} type="tel" id="accountRouting" style={Util.setErrorStyle(errors.accountRouting)} />
                                )}
                            />
                            {errors.accountRouting && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </FormGroup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-10">
                        <FormGroup className="mr-10 mb-10">
                            <Label for="accountNumber" className="mr-sm-10">Account Number</Label>
                            <Controller
                                name="accountNumber"
                                control={control}
                                rules={{required: true}}
                                render={({ field }) => (
                                    <Input {...field} type="tel" id="accountNumber" style={Util.setErrorStyle(errors.accountNumber)} />
                                )}
                            />
                            {errors.accountNumber && (
                                <span style={{ color: "red" }} role="alert">required</span>
                            )}
                        </FormGroup>
                    </div>
                </div>
                {renderVerifyBankAccount()}
                <Button type="submit" color="primary" size="sm" className="w-auto" style={{marginTop: '1rem'}}>Update</Button>
            </Form>
        </>
    );
}

export default BankAccount;