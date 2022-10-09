import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Print from '@material-ui/icons/Print';
import SweetAlert from 'react-bootstrap-sweetalert';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { Link } from 'react-router-dom';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const LeaseViolations = (props) => {
    const tenantID = props.tenantID;

    const [ loading, setLoading ] = useState(true);
    const [ leaseViolations, setLeaseViolations ] = useState([]);
    const [ updated, setUpdated ] = useState(false);
    const [ leaseViolationID, setLeaseViolationID ] = useState(0);
    const [ showDelete, setShowDelete ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const leaseViolations = await tenantAPI.getLeaseViolations(tenantID);
            let arr = [];
            for(const lv of leaseViolations) {
                arr.push({
                    leaseViolation: lv.LeaseViolationType,
                    dateSubmitted: lv.SubmitDate ? moment(lv.SubmitDate).format("MM/DD/YYYY") : '',
                    description: lv.LeaseViolationDescription,
                    submittedBy: `${lv.UserFName} ${lv.UserLName}`,
                    print: lv,
                    delete: lv.LeaseViolationID
                });
            }
            setLeaseViolations(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated]);

    const columns = [
        { name: 'leaseViolation', label: 'Lease Violation' },
        { name: 'dateSubmitted', label: 'Date Submited' },
        { name: 'description', label: 'Description' },
        { name: 'submittedBy', label: 'Submitted By' },
        { name: 'print', label: 'Print', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <Link
                            to="/printable/openForm"
                            onClick={async () => {
                                await localStorage.setItem("tenantID", tenantID);
                                await localStorage.setItem("leaseViolationID", value.LeaseViolationID);
                                await localStorage.setItem("formPrintName", "Lease_Violation");
                            }}
                            target="_blank"
                        >
                            <Print />
                        </Link>
                    );
                }
            },
        },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setLeaseViolationID(value);
                                setShowDelete(true);
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    );
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        selectableRows: "none",
    };

    const deleteLeaseViolation = async () => {
        setShowDelete(false);
        setLoading(true);
        const res = await tenantAPI.deleteLeaseViolation(leaseViolationID);
        setLoading(false);
        setLeaseViolationID(0);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.");
            return;
        }
        setUpdated(!updated);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Lease Violations..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <>
                    <SweetAlert
                        warning
                        btnSize="sm"
                        show={showDelete}
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="success"
                        title="Are you sure?"
                        onConfirm={() => deleteLeaseViolation()}
                        onCancel={() => setShowDelete(false)}
                    >
                        You will not be able to recover this lease violation!
                    </SweetAlert>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Lease Violations"}
                                    data={leaseViolations}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                </>
            )
        }
    }

    return render();
}

export default LeaseViolations;