import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import NumberFormat from 'react-number-format';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MatButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Flag from '@material-ui/icons/Flag';
import Print from '@material-ui/icons/Print';
import MailOutline from '@material-ui/icons/MailOutline';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import MUIDataTable from "mui-datatables";
import SweetAlert from 'react-bootstrap-sweetalert';
import Swal from 'sweetalert2';
import * as EmailValidator from 'email-validator';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as billsAPI from '../../Api/bills';
import * as depositsAPI from '../../Api/deposits';

const Deposits = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const multiprop = user.notifications.multiProp;

    const [ loading, setLoading ] = useState(true);
    const [ depositSources, setDepositSources ] = useState([]);
    const [ lenders, setLenders ] = useState([]);
    const [ prospects, setProspects ] = useState([]);
    const [ formerTenantUnits, setFormerTenantUnits ] = useState([]);
    const [ paymentTypes, setPaymentTypes ] = useState([]);
    const [ units, setUnits ] = useState([]);
    const [ deposits, setDeposits ] = useState([]);
    const [ depositSourceID, setDepositSourceID ] = useState(1); // default depositSourceID is 1. Then, the Payment Type dropdwon can change it.
    const [ showDeleteDeposit, setShowDeleteDeposit ] = useState(false);
    const [ delDepositID, setDelDepositID ] = useState(0);
    const [ totalCash, setTotalCash ] = useState(0);
    const [ totalDeposit, setTotalDeposit ] = useState(0);
    const [ update, setUpdate ] = useState(false);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            //setProperties(await billsAPI.getProperties(userID));
            setDepositSources(await depositsAPI.getAllDepositSources());
            setPaymentTypes(await depositsAPI.getPaymentTypes());
            const getUnits = await depositsAPI.getCurrentTenants(propertyID);
            setUnits(getUnits);
            setLenders(await billsAPI.getLenders(companyID));
            setProspects(await depositsAPI.getProspects(propertyID));
            setFormerTenantUnits(await depositsAPI.getFormerTenants(propertyID));
            
            const pendingTransactions = await depositsAPI.pendingTransactions({
                multiprop,
                userID,
                propertyID
            });
            let arr = [];
            let i = 0;
            let total = 0;
            let cash = 0;
            for(const t of pendingTransactions.transactions) {
                const cur = parseFloat(t.TenantAmount) + parseFloat(t.HousingAmount) + parseFloat(t.OtherAmount);
                total += cur;
                if(parseInt(t.PaymentTypeID) === 3) {
                    cash += cur;
                }
                arr.push({
                    depositFrom: t,
                    depositTo: t.PropertyName !== undefined ? t.PropertyName : '',
                    tenantOwes: pendingTransactions.tenantBalance[i],
                    tenantRent: t.TenantAmount,
                    housingPayment: t.HousingAmount,
                    otherIncome: t.OtherAmount,
                    currency: t.PaymentType,
                    creditDate: moment.utc(t.TransactionDate).format("MM/DD/YYYY"),
                    edit: t.TempTransactionID,
                    delete: t.TempTransactionID,
                    receipt: t
                });
                i++;
            }
            setTotalCash(cash.toFixed(2));
            setTotalDeposit(total.toFixed(2));
            setDeposits(arr);
            setValue("currencyID", 2);
            setLoading(false);
        }
        fetchData();
    }, [multiprop, userID, propertyID, companyID, update, setValue]);

    useEffect(() => {
        switch(parseInt(depositSourceID)) {
            case 3:
                setValue("transactionComment", "");
                break;
            case 5:
                setValue("transactionComment", "");
                break;
            case 11:
                setValue("transactionComment", "Laundry Room");
                break;
            case 6:
                setValue("lenderID", 0);
                break;
            case 4:
                setValue("prospectID", 0);
                break;
            case 7:
                setValue("unitID", 0);
                break;
            default:
                setValue("unitID", 0);
                break;
        }
    }, [depositSourceID, setValue])

    const submitForm = async (data) => {
        if(parseInt(data.paymentType) === 0) {
            NotificationManager.error("Payment Type is required.", "Error");
            return;
        }  
        if([3, 5, 11].includes(depositSourceID) && data.transactionComment === '') {
            NotificationManager.error("Transaction Comment is required.", "Error");
            return;
        }
        if(depositSourceID === 6 && parseInt(data.lenderID) === 0) {
            NotificationManager.error("Lender is required.", "Error");
            return;
        }
        if(depositSourceID === 4 && parseInt(data.prospectID) === 0) {
            NotificationManager.error("Prospect is required.", "Error");
            return;
        }
        // default deposit soruce, the unit is required
        const reserved = [3,5,4,6,11];
        if(!reserved.includes(depositSourceID) && parseInt(data.unitID) === 0) {
            NotificationManager.error("Unit is required.", "Error");
            return;
        }
        if(parseInt(data.currencyID) === 0) {
            NotificationManager.error("Currency is required.", "Error");
            return;
        }
        const amt = parseFloat(data.paymentAmount.toString().replace(/\$|,/g, '')).toFixed(2);
        if(amt <= 0) {
            NotificationManager.error("Please enter a valid payment amount.", "Error");
            return;
        }
        const dtTransaction = moment.utc(data.dateCredit);
        if(!dtTransaction.isValid()) {
            NotificationManager.error("Please enter a valid transaction date.", "Error");
            return;
        }
        const res = await depositsAPI.addTemp({
            depositSourceID: parseInt(depositSourceID),
            amount: parseFloat(amt).toFixed(2),
            tenantID: data.unitID !== undefined ? parseInt(data.unitID) : 0, // name of the field is unit, but uses tenant
            prospectID: data.prospectID !== undefined ? parseInt(data.prospectID) : 0,
            propertyID,
            transactionDate: dtTransaction,
            paymentTypeID: parseInt(data.currencyID),
            checkNumber: data.memo,
            comment: data.transactionComment !== undefined ? data.transactionComment : '',
            lenderID: data.lenderID !== undefined ? parseInt(data.lenderID) : 0
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us", "Error");
            return;
        }
        resetFields();
        setUpdate(!update);
    }

    const resetFields = () => {
        setValue("transactionComment", "");
        setValue("dateCredit", moment.utc().format("YYYY-MM-DD"));
        setValue("paymentAmount", "");
        setValue("memo", "");
        setValue("lenderID", 0);
        setValue("prospectID", 0);
        setValue("unitID", 0);
        setValue("prospectID", 0);
        setValue("currencyID", 0);
        //setValue("propertyID", propertyID === 0 ? pID : propertyID);
    }

    const renderDepositSource = () => {
        switch(parseInt(depositSourceID)) {
            case 3:
                return (
                    <div className="col-sm-3">
                        <Label for="transactionComment" className="mr-sm-10">Comment</Label>
                        <Controller
                            name="transactionComment"
                            control={control}
                            rules={{ required: true }}
                            value={''}
                            render={({ field }) => (
                                <Input {...field} type="text" id="transactionComment" style={Util.setErrorStyle(errors.transactionComment)} />
                            )}
                        />
                        {errors.transactionComment && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 5:
                return (
                    <div className="col-sm-3">
                        <Label for="transactionComment" className="mr-sm-10">Comment</Label>
                        <Controller
                            name="transactionComment"
                            control={control}
                            rules={{ required: true }}
                            defaultValue={''}
                            render={({ field }) => (
                                <Input {...field} type="text" id="transactionComment" style={Util.setErrorStyle(errors.transactionComment)} />
                            )}
                        />
                        {errors.transactionComment && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 11:
                return (
                    <div className="col-sm-3">
                        <Label for="transactionComment" className="mr-sm-10">Comment</Label>
                        <Controller
                            name="transactionComment"
                            control={control}
                            value={"Laundry Room"}
                            render={({ field }) => (
                                <Input {...field} type="text" id="transactionComment" readOnly />
                            )}
                        />
                    </div>
                );
            case 6:
                return (
                    <div className="col-sm-3">
                        <Label for="lenderID" className="mr-sm-10">
                            Lender - 
                            <IconButton
                                aria-label="Add Lender"
                                onClick={() => {
                                    const location = {
                                        pathname: '/deposits/addLender',
                                    }
                                    history.push(location);
                                }}
                                style={{color: 'blue', maxHeight: '10px'}}
                            >
                                <AddCircleOutline />
                            </IconButton>
                        </Label>
                        <Controller
                            name="lenderID"
                            control={control}
                            rules={{ required: true }}
                            defaultValue={0}
                            render={({ field }) => (
                                <Input {...field} type="select" id="lenderID" style={Util.setErrorStyle(errors.lenderID)}
                                    onChange={(e) => setValue("lenderID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {lenders.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.LenderID} 
                                                value={obj.LenderID}
                                            >
                                                {obj.Lender}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.lenderID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="col-sm-3">
                        <Label for="prospectID" className="mr-sm-10">Prospect</Label>
                        <Controller
                            name="prospectID"
                            control={control}
                            rules={{ required: true }}
                            defaultValue={0}
                            render={({ field }) => (
                                <Input {...field} type="select" id="prospectID" style={Util.setErrorStyle(errors.prospectID)}
                                    onChange={(e) => setValue("prospectID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {prospects.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.TenantID} 
                                                value={obj.TenantID}
                                            >
                                                {obj.Combo}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.prospectID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            case 7:
                return (
                    <div className="col-sm-3">
                        <Label for="unitID" className="mr-sm-10">Unit</Label>
                        <Controller
                            name="unitID"
                            control={control}
                            rules={{ required: true }}
                            defaultValue={0}
                            render={({ field }) => (
                                <Input {...field} type="select" id="unitID" style={Util.setErrorStyle(errors.unitID)}
                                    onChange={(e) => setValue("unitID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {formerTenantUnits.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.TenantID} 
                                                value={obj.TenantID}
                                            >
                                                {obj.Combo}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.unitID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="col-sm-3">
                        <Label for="unitID" className="mr-sm-10">Unit</Label>
                        <Controller
                            name="unitID"
                            control={control}
                            rules={{ required: true }}
                            defaultValue={0}
                            render={({ field }) => (
                                <Input {...field} type="select" id="unitID" style={Util.setErrorStyle(errors.unitID)}
                                    onChange={(e) => setValue("unitID", e.target.value)}
                                >
                                    <option value="0">Select</option>
                                    {units.map((obj) => {
                                        return (
                                            <option 
                                                key={obj.TenantID} 
                                                value={obj.TenantID}
                                            >
                                                {obj.Combo}
                                            </option>
                                        );
                                    })}
                                </Input>
                            )}
                        />
                        {errors.unitID && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                );
        }
    }

    const handleChangeDeposit = (id) => {
        setValue("paymentType", parseInt(id));
        setDepositSourceID(parseInt(id))
    }

    const deleteDeposit = async () => {
        const res = await depositsAPI.deleteTransaction(delDepositID);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.")
            return;
        }
        setDelDepositID(0);
        setShowDeleteDeposit(false);
        setUpdate(!update);
    }

    const postDeposit = async () => {
        setLoading(true);
        const res = await depositsAPI.postDeposits({
            multiProp: multiprop,
            userID,
            propertyID
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.");
            return;
        }
        setUpdate(!update);
    }

    const columns = [
        { name: 'depositFrom', label: 'Deposit From', 
            options: {
                customBodyRender: (value) => {
                    const tenantName = value.TenantFName === null ? '' : `${value.TenantFName} ${value.TenantLName}`;
                    const comment = value.TransactionComment !== null && parseInt(value.TransactionComment) !== 0 ? value.TransactionComment : '';
                    if(value.UnitName === null) {
                        switch (parseInt(value.DepositSourceID)) {
                            case 6:
                                return <span>Loan {tenantName} {comment}</span>
                            case 5:
                                return <span>Escrow Refund {tenantName} {comment}</span>
                            case 4:
                                return <span>Prospect {tenantName} {comment}</span>
                            case 3:
                                return <span>Other Income {tenantName} {comment}</span>
                            default:
                                return <span>{tenantName} {comment}</span>
                        }
                    } else {
                        const renderEvictionFiled = () => {
                            if(parseInt(value.EvictionFiled) === 1) {
                                return <Flag style={{color: 'red'}} />
                            }
                        }
                        return (
                            <>
                                <MatButton className="text-primary mr-10 mb-10"
                                    onClick={() => {
                                        window.location = `./index.cfm?P=38&TID=${value.TenantID}`;
                                    }}
                                >
                                    {value.UnitName} {tenantName}
                                </MatButton>
                                {renderEvictionFiled()}
                                {comment}
                            </>
                        );
                    }
                }
            },
        },
        { name: 'tenantOwes', label: 'Tenant Owes (Exclude Housing)', 
            options: {
                customBodyRender: (value) => {
                    if(isNaN(value))    return <span>{value}</span>
                    return (
                        <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={parseFloat(value).toFixed(2)} />
                    )
                }
            },
        },
        { name: 'tenantRent', label: 'Tenant Rent', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={parseFloat(value).toFixed(2)} />
                    )
                }
            },
        },
        { name: 'housingPayment', label: 'Housing Payment', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={parseFloat(value).toFixed(2)} />
                    )
                }
            },
        },
        { name: 'otherIncome', label: 'Other Income', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={parseFloat(value).toFixed(2)} />
                    )
                }
            },
        },
        { name: 'currency', label: 'Currency', },
        { name: 'creditDate', label: 'Credit Date', },
        { name: 'edit', label: 'Edit',
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/deposits/edit',
                                    state: { 
                                        depositID: parseInt(value)
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
                                setDelDepositID(value);
                                setShowDeleteDeposit(true);
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    )
                }
            },
        },
        { name: 'receipt', label: 'Receipt',
            options: {
                customBodyRender: (value) => {
                    return (
                        <>
                        <IconButton onClick={() => {
                            window.open(`./printable.cfm?P=7&TTID=${value.TempTransactionID}`, "_blank");
                        }}>
                            <Print />
                        </IconButton>
                        <IconButton onClick={async () => {
                            Swal.fire({
                                title: 'Email Receipt to Tenant',
                                input: 'text',
                                inputValue: value.TenantEmail ? value.TenantEmail.trim() : '',
                                inputAttributes: {
                                    autocapitalize: 'off'
                                },
                                showCancelButton: true,
                                confirmButtonText: 'Submit',
                                showLoaderOnConfirm: true,
                                preConfirm: async (email) => {
                                    if(!EmailValidator.validate(email.trim())) {
                                        Swal.showValidationMessage(
                                            `A valid email is required.`
                                        );
                                        return;
                                    }
                                    return( await depositsAPI.emailReceipt({id: value.TempTransactionID, email: email.trim()}))
                                },
                                allowOutsideClick: () => !Swal.isLoading()
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    if(result.value === 0) {
                                        Swal.fire({
                                            icon: 'success',
                                            text: 'Email sent successfully.',
                                        })
                                    } else {
                                        Swal.fire({
                                            icon: 'error',
                                            text: 'Error processing your request. Please, contact us.',
                                        })
                                    }
                                }
                            });
                        }}>
                            <MailOutline />
                        </IconButton>
                        </>
                    )
                }
            },
        },
    ];

    if(multiprop) {
        columns.splice(1, 0, 
            { name: 'depositTo', label: 'Deposit From', }
        );
    }

    const options = {
        filterType: 'dropdown',
        pagination: false,
        selectableRows: "none",
        customSearch: (searchQuery, currentRow, columns) => {
            let found = false;
            currentRow.forEach(element => {
                if(element === null)    found = false;
                else if(typeof element === 'object') {
                    if(element.TenantFName !== null && element.TenantFName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                    if(element.TenantLName !== null && element.TenantLName.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                } else if(element.toString().toUpperCase().includes(searchQuery.toUpperCase())){
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
                heading={"Loading Deposits..."}
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
                show={showDeleteDeposit}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteDeposit()}
                onCancel={() => { setShowDeleteDeposit(false); setDelDepositID(0); }}
            >
                You will not be able to recover this deposit!
            </SweetAlert>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Deposits</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="Add Deposit">
                        <Form onSubmit={handleSubmit(submitForm)}>
                            <div className="row">
                                <div className="col-sm-3">
                                    <Label for="paymentType" className="mr-sm-10">Payment Type</Label>
                                    <Controller
                                        name="paymentType"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={1}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="paymentType" style={Util.setErrorStyle(errors.paymentType)}
                                                onChange={(e) => handleChangeDeposit(e.target.value)}
                                            >
                                                <option value="0">Select</option>
                                                {depositSources.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.DepositSourceID} 
                                                            value={obj.DepositSourceID}
                                                        >
                                                            {obj.DepositSource}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.paymentType && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                {renderDepositSource()}
                                <div className="col-sm-3">
                                    <Label for="currencyID" className="mr-sm-10">Currency</Label>
                                    <Controller
                                        name="currencyID"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={0}
                                        render={({ field }) => (
                                            <Input {...field} type="select" id="currencyID" style={Util.setErrorStyle(errors.currencyID)}>
                                                <option value="0">Select</option>
                                                {paymentTypes.map((obj) => {
                                                    return (
                                                        <option 
                                                            key={obj.PaymentTypeID} 
                                                            value={obj.PaymentTypeID}
                                                        >
                                                            {obj.PaymentType}
                                                        </option>
                                                    );
                                                })}
                                            </Input>
                                        )}
                                    />
                                    {errors.currencyID && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-2">
                                    <Label for="paymentAmount" className="mr-sm-10">Payment Amount</Label>
                                    <Controller
                                        name="paymentAmount"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <NumberFormat {...field} id="paymentAmount" placeholder="100.99" thousandSeparator={true} prefix={"$"} 
                                                className="form-control" style={Util.setErrorStyle(errors.paymentAmount)} />
                                        )}
                                    />
                                    {errors.paymentAmount && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                                <div className="col-sm-5">
                                    <Label for="memo" className="mr-sm-10">Memo</Label>
                                    <Controller
                                        name="memo"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} type="text" name="memo" placeholder="12345" style={Util.setErrorStyle(errors.memo)} />
                                        )}
                                    />
                                </div>
                                <div className="col-sm-2">
                                    <Label for="dateCredit" className="mr-sm-10">Date of Credit</Label>
                                    <Controller
                                        name="dateCredit"
                                        control={control}
                                        rules={{ required: true }}
                                        defaultValue={moment.utc().format("YYYY-MM-DD")}
                                        render={({ field }) => (
                                            <DatePicker {...field} id="dateCredit"  style={Util.setErrorStyle(errors.dateCredit)} />
                                        )}
                                    />
                                    {errors.dateCredit && (
                                        <span style={{ color: "red" }} role="alert">required</span>
                                    )}
                                </div>
                            </div>
                            <Button type="submit" color="primary" style={{marginTop: '10px'}}>Add Payment to Deposit</Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Pending Deposits - ${deposits.length}`}
                            data={deposits}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <div className="row">
                            <div className="col-sm-12">
                                <p style={{textAlign: 'right'}}>
                                    Total Cash: <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={totalCash} /><br />
                                    Total Other: <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={(totalDeposit-totalCash).toFixed(2)} /><br />
                                    <b>Total Deposit: <NumberFormat displayType={"text"} thousandSeparator={true} prefix={"$"} value={totalDeposit} /></b> <br /><br/>
                                    <Button color="success" onClick={postDeposit}>Post Deposit</Button>
                                    {' '}
                                    <Button color="warning"
                                        onClick={() => {
                                            window.open(`./printable.cfm?P=5&pid=${propertyID}`, "_blank");
                                        }}
                                    >
                                        Print Slip
                                    </Button>
                                </p>
                            </div>
                        </div>
                    </RctCollapsibleCard>
                </div>
            </div>
            <NotificationContainer />
        </Main>
    );
}

export default Deposits;