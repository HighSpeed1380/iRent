import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup, Switch, Radio, FormControlLabel, RadioGroup  } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from "react-redux";
import { NotificationManager } from 'react-notifications';
import CreditCard from '../Util/CreditCard/Creditcard';
import BankAccount from '../Util/BankAccount/BankAccount';

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as companyAPI from '../../Api/company';
import * as encrypt from '../Util/encrypt';
import LinearProgress from '../Util/LinearProgress';

const CompanyDetails = () => {
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [ companyDetails, setCompanyDetails ] = useState({});
    const [ companySettings, setCompanySettings ] = useState({});
    const [ companyBilling, setCompanyBilling ] = useState({});
    const [ currencies, setCurrencies ] = useState([]);
    const [ updated, setUpdated ] = useState(false);
    const [ loadingCard, setLoadingCard ] = useState(false);
    const [ loadingBank, setLoadingBank ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors }} = useForm();

    useEffect(() => {
        async function fetchData() {
            const getData = await companyAPI.getDetails(companyID)
            if(getData !== null) {
                setCompanyDetails(getData.details);
                setCompanySettings(getData.settings);
                setCompanyBilling({
                    ...getData.billing,
                    cardNumber: getData.billing.cardNumber !== '' ? encrypt.decrypt(getData.billing.cardNumber) : '',
                    ccv: getData.billing.ccv !== '' ? encrypt.decrypt(getData.billing.ccv) : '',
                    accountNumber: getData.billing.accountNumber !== '' ? encrypt.decrypt(getData.billing.accountNumber) : '',
                    accountRouting: getData.billing.accountRouting
                });

                setValue("companyName", getData.details.companyName);
                setValue("firstName", getData.details.firstName);
                setValue("lastName", getData.details.lastName);
                setValue("phone", getData.details.phone);
                setValue("email", getData.details.email);
                setValue("currency", getData.details.currency);
            }
            setCurrencies(await companyAPI.getCurrencies());
        }
        fetchData();
    }, [companyID, setValue, updated])

    const submitCompanyDetails = async (data) => {
        const res = await companyAPI.updateDetails({
            companyName: data.companyName,
            contactFName: data.firstName,
            contactLName: data.lastName,
            contactPhone: data.phone,
            contactEmail: data.email,
            companyID,
            currencyID: parseInt(data.currency)
        });
        if(res !== 0) {
            NotificationManager.errors(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
        NotificationManager.success("Company Destails Updated.", "Success");
    }
    
    const handleUpdateSettings = async () => {
        const res = await companyAPI.updateSettings({
            companyPayCCFee: companySettings.payCCFee ? 1: 0,
            companyPayACHFee: companySettings.payACHFee ? 1: 0,
            allPropertiesTenantPortal: companySettings.showAllPropertiesTenantPortal ? 1: 0,
            allowEvictionTenantPayOnline: companySettings.allowUnderEvictionPayRent ? 1: 0,
            turnOffOnlinePaymentsNotification: companySettings.turnOffNotificationOnlinePayment ? 1: 0,
            turnOffUpdatedTransactionNotification: companySettings.turnOffNotificationUpdTransaction ? 1: 0,
            showAllPropertiesTenants: companySettings.showAllPropsTenantTab ? 1: 0,
            turnOffSendToCollectioin: companySettings.turnOffNotificationSendCollection ? 1: 0,
            companyID
        });
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Company Settings Updated.", "Success!")
        setUpdated(!updated);
    }

    const handleSelectPaymentMethodChange = async () => {
        if(companyBilling.chagerByACH) {
            if(companyBilling.cardNumber === '') {
                NotificationManager.warning("You haven't entered a credit card.", "Error");
            } else {
                setCompanyBilling({...companyBilling, chagerByACH: false});
            }
        } else {
            if(companyBilling.accountNumber === '')
                NotificationManager.warning("You haven't entered a bank account.", "Error");
            else if(!companyBilling.bankVerified)
                NotificationManager.warning("Bank account not verified. Please, verify your bank account", "Error");
            else 
                setCompanyBilling({...companyBilling, chagerByACH: true})
        }
    }

    const updateCustomerCC = async (data) => {
        setLoadingCard(true)
        const getCompany = await companyAPI.getDetails(companyID)
        const res = await companyAPI.updateCompanyCard({
            nameOnCard: data.name,
            cardNumber: data.number,
            cardExpMonth: data.expiry.slice(0,2),
            cardExpYear: data.expiry.slice(3),
            cardCVC: data.cvc,
            cardZip: '',
            companyName: getCompany.details.companyName,
            companyEmail: getCompany.details.email,
            companyID,
        });
        setLoadingCard(false)
        if(res !== 0) {
            NotificationManager.error(res, "Error");
            return;
        }
        NotificationManager.success("Company Credit Card Updated.", "Success");
        setUpdated(!updated);
    }

    const updateCustomerBank = async (data) => {
        setLoadingBank(true);
        const getCompany = await companyAPI.getDetails(companyID)
        const res = await companyAPI.updateCompanyBank({
            accountName: data.accountName,
            routingNumber: data.accountRouting,
            accountNumber: data.accountNumber,
            companyName: getCompany.details.companyName,
            companyEmail: getCompany.details.email,
            companyID,
        });
        setLoadingBank(false)
        if(res !== 0) {
            console.log(res)
            NotificationManager.error(res, "Error", 8000);
            return;
        }
        NotificationManager.success("Almost done! You'll receive two micro-deposits into your bank account within two business days. Please enter the deposit amounts into our system to verify your account information. After the account has been verified you will be able to make payments directly from your bank account.", "Success", 8000);
        setUpdated(!updated);
    }

    const renderCreditCard = () => {
        if(loadingCard) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Processing..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        }
        return (
            <CreditCard card={{
                number: companyBilling.cardNumber,
                name: companyBilling.nameOnCard,
                expiry: companyBilling.expirationMonth !== undefined ? `${companyBilling.expirationMonth}/${companyBilling.expirationYear}` : '',
                cvc: companyBilling.ccv
            }}
                updateCard={updateCustomerCC}
            />
        );
    }

    const renderBank = () => {
        if(loadingBank) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Processing..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        }
        return (
            <BankAccount updBank={updateCustomerBank} 
                bank={{
                    accountNumber: companyBilling.accountNumber,
                    accountRouting: companyBilling.accountRouting,
                    accountName: companyBilling.accountName,
                    verified: companyBilling.bankVerified,
                }}
                companyID={companyID}
                updated={updated}
                setUpdated={setUpdated}
            />
        );
    }

    const updatePaymentMethod = async () => {
        const res = await companyAPI.updPaymentMethod({
            paymentMethod: companyBilling.chagerByACH ? 1 : 0,
            companyID
        });
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        NotificationManager.success("Payment Method Updated!", "Success");
        setUpdated(!updated);
    }

    return (
        <Main>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Company Details</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Company Details">
                            <Form onSubmit={handleSubmit(submitCompanyDetails)}>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="companyName" className="mr-sm-10">Company Name</Label>
                                            <Controller
                                                name="companyName"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="companyName" style={Util.setErrorStyle(errors.companyName)} />
                                                )}
                                            />
                                            {errors.companyName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="firstName" className="mr-sm-10">Contact First Name</Label>
                                            <Controller
                                                name="firstName"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="firstName" style={Util.setErrorStyle(errors.firstName)} />
                                                )}
                                            />
                                            {errors.firstName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="lastName" className="mr-sm-10">Contact Last Name</Label>
                                            <Controller
                                                name="lastName"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="lastName" style={Util.setErrorStyle(errors.lastName)} />
                                                )}
                                            />
                                            {errors.lastName && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="phone" className="mr-sm-10">Contact Phone</Label>
                                            <Controller
                                                name="phone"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="phone" style={Util.setErrorStyle(errors.phone)} />
                                                )}
                                            />
                                            {errors.phone && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-4">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="email" className="mr-sm-10">Contact Email</Label>
                                            <Controller
                                                name="email"
                                                control={control}
                                                rules={{required: true}}
                                                render={({ field }) => (
                                                    <Input {...field} type="text" id="email" style={Util.setErrorStyle(errors.email)} />
                                                )}
                                            />
                                            {errors.email && (
                                                <span style={{ color: "red" }} role="alert">required</span>
                                            )}
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-3">
                                        <FormGroup className="mr-10 mb-10">
                                            <Label for="currency" className="mr-sm-10">Company Currency</Label>
                                            <Controller
                                                name="currency"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="select" id="currency">
                                                        {currencies.map((obj, index) => {
                                                            return <option key={index} value={parseInt(obj.CurrenciesID)}>{obj.Name} - {obj.Country}</option>
                                                        })}
                                                    </Input>
                                                )}
                                            />                                            
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="submit" color="primary" size="sm" className="w-auto">Update Profile</Button>
                            </Form>
                        </RctCollapsibleCard>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Company Settings">
                            <div inline>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                            <Switch name="escrow" checked={!!companySettings.payCCFee} onChange={() => setCompanySettings({...companySettings, payCCFee: !companySettings.payCCFee})} aria-label="Company Pay CC Fee" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Company pays credit card convenience fee? 
                                            </Label>
                                            <Alert severity="warning" style={{marginLeft: '1rem'}}>Fee = 2.9% + $0.30</Alert>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                        <Switch name="escrow" checked={!!companySettings.payACHFee} onChange={() => setCompanySettings({...companySettings, payACHFee: !companySettings.payACHFee})} aria-label="Company Pay ACH Fee" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Company pays ACH convenience fee?
                                            </Label>
                                            <Alert severity="warning" style={{marginLeft: '1rem'}}>Fee = 0.80%, capped at $5</Alert>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                        <Switch name="escrow" checked={!!companySettings.showAllPropertiesTenantPortal} onChange={() => setCompanySettings({...companySettings, showAllPropertiesTenantPortal: !companySettings.showAllPropertiesTenantPortal})} aria-label="" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Show all Properties on Tenant Portal Link?
                                            </Label>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                        <Switch name="escrow" checked={!!companySettings.allowUnderEvictionPayRent} onChange={() => setCompanySettings({...companySettings, allowUnderEvictionPayRent: !companySettings.allowUnderEvictionPayRent})} aria-label="" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Allow tenants under eviction to pay rent online?
                                            </Label>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                        <Switch name="escrow" checked={!!companySettings.turnOffNotificationOnlinePayment} onChange={() => setCompanySettings({...companySettings, turnOffNotificationOnlinePayment: !companySettings.turnOffNotificationOnlinePayment})} aria-label="" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Turn off notifications of online payments being received?
                                            </Label>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                        <   Switch name="escrow" checked={!!companySettings.turnOffNotificationUpdTransaction} onChange={() => setCompanySettings({...companySettings, turnOffNotificationUpdTransaction: !companySettings.turnOffNotificationUpdTransaction})} aria-label="" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Turn off notifications of updated transaction?
                                            </Label>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                            <Switch name="escrow" checked={!!companySettings.showAllPropsTenantTab} onChange={() => setCompanySettings({...companySettings, showAllPropsTenantTab: !companySettings.showAllPropsTenantTab})} aria-label="" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Show all properties tenants in the Tenant tab?
                                            </Label>
                                        </FormGroup>
                                    </div>
                                    <div className="col-sm-12">
                                        <FormGroup row>
                                            <Switch name="escrow" checked={!!companySettings.turnOffNotificationSendCollection} onChange={() => setCompanySettings({...companySettings, turnOffNotificationSendCollection: !companySettings.turnOffNotificationSendCollection})} aria-label="" />
                                            <Label for="escrow" className="mr-sm-10">
                                                Turn off notifications of send to collections?
                                            </Label>
                                        </FormGroup>
                                    </div>
                                </div>
                                <Button type="button" color="primary" size="sm" className="w-auto" onClick={handleUpdateSettings}>Update</Button>
                            </div>
                        </RctCollapsibleCard>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <RctCollapsibleCard heading="Company Billing">
                            <div className="row">
                                <div className="col-sm-6 col-md-6 col-xl-6">
                                    <RctCollapsibleCard heading="Company Credit Card">
                                        {renderCreditCard()}
                                    </RctCollapsibleCard>
                                </div>
                                <div className="col-sm-6 col-md-6 col-xl-6">
                                    <RctCollapsibleCard heading="Company Bank Account">
                                        {renderBank()}
                                    </RctCollapsibleCard>
                                </div>
                            </div>
                            <div className="row">
                                <Form inline>
                                    <div className="col-sm-12">
                                        <RadioGroup aria-label="anonymous" name="anonymous" value={false} row>
                                            <Label className="mr-sm-10">Select Payment Method</Label>
                                            <FormControlLabel value="cc" control={
                                                <Radio 
                                                    checked={!companyBilling.chagerByACH}
                                                    value="CC"
                                                    name="selectedPayment"
                                                    onChange={handleSelectPaymentMethodChange}
                                                />} 
                                                label="Credit Card" 
                                            />
                                            <FormControlLabel value="ach" control={
                                                <Radio 
                                                    checked={companyBilling.chagerByACH}
                                                    value="ACH"
                                                    name="selectedPayment"
                                                    onChange={handleSelectPaymentMethodChange}
                                                />} 
                                                label="ACH" />
                                            <Button type="button" color="primary" size="sm" className="w-auto" onClick={updatePaymentMethod}>Update</Button>
                                        </RadioGroup>
                                    </div>
                                </Form>
                            </div>
                        </RctCollapsibleCard>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default CompanyDetails;