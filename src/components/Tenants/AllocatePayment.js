import React, { useState, useEffect, useMemo } from 'react';
import NumberFormat from 'react-number-format';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';

const AllocatePayment = (props) => {
    const tenantName = props.tenantName;
    const tenantTransactionID = props.selectedTransaction;
    const propertyID = props.propertyID;

    const [ loading, setLoading ] = useState(true);
    const [ categories, setCategories ] = useState([]);
    const [ payments, setPayments ] = useState([]);
    const [ paymentAmount, setPaymentAmount ] = useState(0);
    const [ showAddCategory, setShowAddCAtegory ] = useState(false);
    const [ updateCategory, setUpdateCategory ] = useState(false);
    
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setPaymentAmount(parseFloat(await tenantAPI.getTransactionAmount(tenantTransactionID)));
            const allocated = await tenantAPI.getAllocatedPayments(tenantTransactionID);
            setPayments(allocated);
            setCategories(await tenantAPI.getPaymentCategories(propertyID));
            setLoading(false);
        }
        fetchData();
    }, [tenantTransactionID, propertyID])

    useEffect(() => {
        console.log(payments);
    }, [payments]);

    useEffect(() => {
        async function fetchData() {
            setCategories(await tenantAPI.getPaymentCategories(propertyID));
        }
        fetchData();
    }, [propertyID, updateCategory]);

    // Perform memoized calculation on payments
    const currentTotal = useMemo(
        () => payments.reduce((sum, current) => sum + parseFloat(current.PaymentAmount), 0),
        [payments]
    );

    const handleCategoryChange = (val, index) => {
        let temp = [...payments];
        let item = {
            ...temp[index],
            CategoryID: parseInt(val)
        }
        temp[index] = item;
        setPayments(temp);
    }
    
    const handleAmountChange = (val, index) => {
        let temp = [...payments];
        let item = {
            ...temp[index],
            PaymentAmount: parseFloat(val).toFixed(2)
        }
        temp[index] = item;
        setPayments(temp);
    }

    const handleDelete = (index) => {
        let temp = [...payments];
        if(index > -1) {
            temp.splice(index, 1);
        }
        setPayments(temp);
    }

    const addPayment = () => {
        setPayments([
          ...payments,
          {
            PaymentAmount: 0,
            CategoryID: 0,
          },
        ]);
    };
    
    const setAllocatedStyle = () => {
        let color = 'red';
        if(parseFloat(currentTotal) === parseFloat(paymentAmount))      color = 'blue';
        return color;
    }

    const save = async () => {
        if(parseFloat(currentTotal) !== parseFloat(paymentAmount)) {
            NotificationManager.error("Allocated Amount must be the same as Payment Total.", "Error");
            return; 
        }
        for(let i=0; i<payments.length; i++) {
            if(payments[i].CategoryID === '' || parseInt(payments[i].CategoryID) === 0) {
                NotificationManager.error("Please select a category for all the payments or delete the payment.", "Error");
                return;
            }
            if(payments[i].PaymentAmount === '' || parseFloat(payments[i].PaymentAmount) === 0) {
                NotificationManager.error("Please enter an amount for all the payments or delete the payment.", "Error");
                return;
            }
        }
        const res = await tenantAPI.allocatePayment({
            tenantTransactionID,
            payments
        });
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        props.setOpenAllocate(false);
    }

    const addCategory = async (description) => {
        const res = await tenantAPI.addPaymentCategory({
            propertyID,
            categoryName: description.trim()
        });
        setShowAddCAtegory(false);
        if(res !== 0) {
            NotificationManager.error(res, "Error");
            return;
        }
        setUpdateCategory(!updateCategory);
    }

    const renderButtons = () => {
        if(parseFloat(currentTotal) === parseFloat(paymentAmount)) {
            return (
                <>
                    <Button color="primary" onClick={save}>Save</Button>
                    {' '}
                    <Button color="warning" onClick={() => props.setOpenAllocate(false)}>Cancel</Button>
                    {' '}
                    <Button color="primary" onClick={() => setShowAddCAtegory(true)}>Add Category</Button>
                </>
            );
        } else {
            return (
                <>
                    <Button color="warning" onClick={() => props.setOpenAllocate(false)}>Cancel</Button>
                    {' '}
                    <Button color="primary" onClick={() => setShowAddCAtegory(true)}>Add Category</Button>
                </>
            );
        }
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Allocate Payment..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const heading = `Allocating ${tenantName} payment of $${parseFloat(paymentAmount).toFixed(2)}`;
            return (
                <>
                    <SweetAlert
                        input
                        btnSize="sm"
                        show={showAddCategory}
                        showCancel
                        cancelBtnBsStyle="danger"
                        title="Enter a category description"
                        required
                        validationMsg="Category description is required!"
                        onConfirm={(e) => addCategory(e)}
                        onCancel={() => setShowAddCAtegory(false)}
                    >
                    </SweetAlert>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <RctCollapsibleCard heading={heading}>
                                <Form>
                                    {payments.map((element, index) => {
                                        return (
                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <Label className="mr-sm-10">Payment Category</Label>
                                                    <Input type="select" 
                                                        value={element.CategoryID} onChange={(e) => handleCategoryChange(e.target.value, index)}
                                                    >
                                                        <option value="0">Select</option>
                                                        {categories.map((obj) => {
                                                            return (
                                                                <option 
                                                                    key={obj.PaymentsCategoryID} 
                                                                    value={obj.PaymentsCategoryID}
                                                                >
                                                                    {obj.Category}
                                                                </option>
                                                            );
                                                        })}
                                                    </Input>
                                                </div>
                                                <div className="col-sm-2">
                                                    <Label className="mr-sm-10">Amount</Label>
                                                    <NumberFormat value={parseFloat(element.PaymentAmount).toFixed(2)} thousandSeparator={true} prefix={'$'} 
                                                        onValueChange={(e) => handleAmountChange(e.value, index)} className="form-control"
                                                    />
                                                </div>
                                                
                                                    <Button type="button" color="danger" size="sm" className="w-auto" style={{marginTop: '33px'}}
                                                        onClick={() => handleDelete(index)}
                                                    >
                                                        Delete
                                                    </Button>
                                                
                                            </div>
                                        );
                                    })}
                                    <div className="row">
                                        <div className="col-sm-2" style={{marginTop: '10px'}}>
                                            <Button type="button" className="btn" onClick={addPayment}>Add a Payment</Button>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12" style={{marginTop: '10px'}}>
                                            <p>
                                                <span>Payment Total: <NumberFormat displayType={'text'} value={paymentAmount} thousandSeparator={true} prefix={'$'} /></span>
                                                <br />
                                                <span style={{color: setAllocatedStyle()}}>Allocated Amount: <NumberFormat displayType={'text'} value={currentTotal} thousandSeparator={true} prefix={'$'} /></span>
                                            </p>
                                        </div>
                                    </div>
                                    {renderButtons()}
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                </>
            );
        }
    }

    return render();
}

export default AllocatePayment;