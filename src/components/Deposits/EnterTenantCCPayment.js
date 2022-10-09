import React, {useState, useEffect} from 'react';
import { Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import NumberFormat from 'react-number-format';
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as depositsAPI from '../../Api/deposits';
import CreditCard from '../Util/CreditCard/Creditcard';

const EnterTenantCCPayment = (props) => {
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const user = login.user
    const userID = user.id;

    const [ loading, setLoading ] = useState(true);
    const [ tenants, setTenants ] = useState([]);
    const [ selectedTenant, setSelectedTenant ] = useState(0);
    const [ paymentAmount, setPaymentAmount ] = useState(0)

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setTenants(await depositsAPI.getTenantsByProperty(propertyID));
            setLoading(false)
        }
        fetchData()
    }, [propertyID])

    const processPayment = async (data) => {
        if(parseInt(selectedTenant) === 0) {
            NotificationManager.error("Please, select a tenant.", "Error");
            return;
        }
        if(parseFloat(paymentAmount) <= 0) {
            NotificationManager.error("Please, enter a payment amount greater than 0.", "Error");
            return;
        }
        // try to process the payment
        setLoading(true);
        const res = await depositsAPI.processTenantCCPayment({
            propertyID,
            amount: paymentAmount,
            userID,
            tenantID: parseInt(selectedTenant),
            cardNUmber: data.number.split(' ').join(''),
            cardName: data.name,
            cardExpMonth: data.expiry.substring(0, 2),
            cardExpYear: data.expiry.substring(3, data.expiry.length),
            cardCVC: data.cvc,
            cardZip: '00000'
        });
        setLoading(false);
        if(res === -1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(res !== 0) {
            NotificationManager.error(res, "Error");
            return;
        }
        NotificationManager.success("Payment Processed.", "Success");
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Enter Tenant CC Payment..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>Enter Tenant Credit Card Payment</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6 col-md-6 col-xl-6">
                    <RctCollapsibleCard heading="">                        
                        <div className="row">
                            <div className="col-sm-12">
                                <CreditCard card={{
                                    number: '',
                                    name: '',
                                    expiry: '',
                                    cvc: ''
                                }}
                                    updateCard={processPayment}
                                />
                            </div>
                        </div>
                    </RctCollapsibleCard>
                </div>
                <div className="col-sm-6 col-md-6 col-xl-6">
                    <RctCollapsibleCard heading="">
                        <div className="row">
                            <div className="col-sm-6">
                                <Label for="selectTenant" className="mr-sm-10">Select a Tenant</Label>
                                <Input type="select" value={selectedTenant} id="selectTenant" name="selectTenant"
                                    onChange={(e) => setSelectedTenant(parseInt(e.target.value))}
                                >
                                    <option value="0">Select</option>
                                    {tenants.map((obj, idx) =>
                                        <option key={idx} value={obj.TenantID}>{obj.UnitName} - {obj.TenantFName} {obj.TenantLName}</option>
                                    )}
                                </Input>
                            </div>
                            <div className="col-sm-4">
                                <Label for="paymentAmt" className="mr-sm-10">Payment Amount</Label>
                                <NumberFormat id="paymentAmt" placeholder="100.99" thousandSeparator={true} prefix={"$"} 
                                    className="form-control" value={parseFloat(paymentAmount).toFixed(2)} 
                                    onValueChange={(values) => setPaymentAmount(values.value )} />
                            </div>
                        </div>
                    </RctCollapsibleCard>
                </div>
            </div>
        </Main>
    )
}

export default EnterTenantCCPayment;