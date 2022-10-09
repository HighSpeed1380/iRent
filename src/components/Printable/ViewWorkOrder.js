import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import NumberFormat from 'react-number-format';
import moment from 'moment';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as customFuncs from '../Util/myFunctions';
import * as propertyAPI from '../../Api/property';
import * as workOrdersAPI from '../../Api/workOrders';

const ViewWorkOrder = () => {
    const workOrderID = parseInt(localStorage.getItem("workOrderID")) || null;
    const propertyID = parseInt(localStorage.getItem("propertyID")) || null;

    const [ loading, setLoading ] = useState(true);
    const [ property, setProperty ] = useState({});
    const [ data, setData ] = useState({})

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setData(await workOrdersAPI.getPrintView(workOrderID));
            setProperty(await propertyAPI.getProperty(propertyID));
            setLoading(false);
        }
        fetchData();
    }, [workOrderID, propertyID]);

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const renderCustomer = () => {
                const renderTenantConsent = () => {
                    if(parseInt(property.DisplayTenantConsent) === 1) {
                        return (
                            <span>
                                <br/>Tenant {parseInt(data.allowMaintenanceGetIn) === 1 ? 'consented' : 'did not consent'} the maintenance personnel to enter the unit, during normal working hours, 8 AM to 5 PM.
                            </span>
                        )
                    }
                }
                if(data.UnitID && parseInt(data.UnitID) !== 0) {
                    return (
                        <p>
                            {data.TenantFName} {data.TenantLName} <br/>
                            Unit: {data.UnitName} <br />
                            {data.PropertyAddress1} {data.PropertyAddress2} <br/>
                            {data.PropertyCity} {data.PropertyState} {data.propertyZip}  <br/>
                            <NumberFormat value={data.TenantPhone} displayType={'text'} format="+1 (###) ###-####" mask="_"/>         
                            {renderTenantConsent()}
                        </p>
                    );
                } 
                return <p>General Work Order for Property.{renderTenantConsent()}</p>
            }
        
            const renderWorkPerformed = () => {
                if(data.WorkOrderComment !== '0') {
                    const completedDt = data.WorkOrderCompleteDate;
                    return (
                        <span>
                            {completedDt !== '' ? `Completed ${moment.utc(completedDt).format("MM/DD/YYYY")}. `: ''}
                            {data.WorkOrderComment}
                        </span>
                    );
                }
            }

            return (
                <>
                    <div style={{marginTop: '1%', marginLeft: '1%', marginRight: '1%', marginBottom: '1%'}}>
                        <Button color="primary" onClick={() => customFuncs.printReports('ViewPrintWorkOrderDiv')}>Print</Button>
                    </div>
                    <div id="ViewPrintWorkOrderDiv" className="row">
                        <div className="col-sm-6 offset-md-3">
                            <div className="row">
                                <div className="col-sm-4">
                                    <p>
                                        <h3>{data.PropertyName}</h3> <br/>
                                        {data.PropertyAddress1} {data.PropertyAddress2} <br/>
                                        {data.PropertyCity} {data.PropertyState} {data.propertyZip} 
                                    </p>
                                </div>
                                <div className="col-sm-8">
                                    <p style={{textAlign: 'right'}}>
                                        <h3>Work Order Details</h3> <br />
                                        <table border="1" style={{float: 'right'}}>
                                            <tr><td>Issue Number</td><td>{data.WorkOrderID}</td></tr>
                                            <tr><td>Date Ordered</td><td>{moment.utc(data.WorkOrderSubmitDate).format("MM/DD/YYYY")}</td></tr>
                                            <tr><td>Due Date</td><td>{data.WorkOrderID}</td></tr>
                                            <tr><td>Assigned To</td><td>{data.UserFName ? `${data.UserFName} ${data.UserLName}` : ''}</td></tr>
                                            <tr><td>Vendor</td><td></td></tr>
                                            <tr><td>Phone</td><td></td></tr>
                                            <tr><td>Fax</td><td></td></tr>
                                        </table>
                                    </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6" style={{backgroundColor: '#bdcada', height: '55px'}}>
                                    <p style={{fontSize: '24px', textAlign: 'center', paddingTop: '3%'}}>
                                        Customer
                                    </p>
                                </div>
                                <div className="col-sm-12">
                                    <p>
                                        {renderCustomer()}
                                    </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12" style={{backgroundColor: '#bdcada', height: '55px'}}>
                                    <p style={{fontSize: '24px', textAlign: 'center', paddingTop: '2%'}}>
                                        Issue
                                    </p>
                                </div>
                                <div className="col-sm-12">
                                    <p style={{minHeight: '90px'}}>{data.WorkOrderDescription}</p> 
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12" style={{backgroundColor: '#bdcada', height: '55px'}}>
                                    <p style={{fontSize: '24px', textAlign: 'center', paddingTop: '2%'}}>
                                        Work Performed
                                    </p>
                                </div>
                                <div className="col-sm-12">
                                    <p style={{minHeight: '90px'}}>{renderWorkPerformed()}</p> 
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
                                    <p>I hereby accept above performance and applicable charges as being satisfactory and acknowledge that equipment has been left in good condition.</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6">
                                    <p>
                                        <br/><br/>
                                        _______________________________ <br />
                                        Customer Signature
                                    </p>
                                </div>
                                <div className="col-sm-6">
                                    <p>
                                        <br/><br/>
                                        _______________________________ <br />
                                        Technician Signature / Date
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            );
        }
    }

    return render();
};

export default ViewWorkOrder;