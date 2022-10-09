import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import NumberFormat from 'react-number-format';
import Print from '@material-ui/icons/Print';
import { Link } from 'react-router-dom';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const ThreeDayNoticeToVacate = (props) => {
    const tenantID = props.tenantID;

    const [ loading, setLoading ] = useState(true);
    const [ threeDayNotices, setThreeDayNotices ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const threeDay = await tenantAPI.getThreeDayNotices(tenantID);
            let arr = [];
            for(const t of threeDay) {
                arr.push({
                    balanceOwed: <NumberFormat value={parseFloat(t.BalanceOwed).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />,
                    dateSubmitted: t.SubmitDate ? moment(t.SubmitDate).format("MM/DD/YYYY") : "",
                    submittedBy: `${t.UserFName} ${t.UserLName}`,
                    print: t.ThreeDayNoticeID
                });
            }
            setThreeDayNotices(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID]);

    const columns = [
        { name: 'balanceOwed', label: 'Balance Owed' },
        { name: 'dateSubmitted', label: 'Date Submited' },
        { name: 'submittedBy', label: 'Submitted By' },
        { name: 'print', label: 'Print', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <Link
                            to="/printable/openForm"
                            onClick={async () => {
                                await localStorage.setItem("tenantID", tenantID);
                                await localStorage.setItem("threeDayNoticeID", value);
                                await localStorage.setItem("formPrintName", "3_Day_Notice");
                            }}
                            target="_blank"
                        >
                            <Print />
                        </Link>
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

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Three Day Notice To Vacate..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-xl-12">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Three Day Notice to Vacate"}
                                    data={threeDayNotices}
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

export default ThreeDayNoticeToVacate;