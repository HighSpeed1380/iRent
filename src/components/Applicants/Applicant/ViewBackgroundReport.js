import React, {useState, useEffect} from 'react';
import Alert from '@material-ui/lab/Alert';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as applicantsAPI from '../../../Api/applicants';
import * as backgroundScreeningAPI from '../../../Api/backgroundScreening';

const ViewBackgroundReport = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const reportID = props.location.state ? props.location.state.reportID : null;
    const reportKey = props.location.state ? props.location.state.reportKey : null;  
    const isCIC = props.location.state ? props.location.state.isCIC : false;  

    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    useEffect(() => {
        async function fetchData() {
            if(reportID === null) {
                history.goBack();
                return;
            }
            setLoading(true)
            if(isCIC) {
                const getCICURL = await backgroundScreeningAPI.getCICReport({
                    propertyID,
                    reportID,
                    key: reportKey
                });
                if(getCICURL !== null && getCICURL !== undefined && getCICURL !== -1)
                    setReport(getCICURL);
            } else {
                const getURL = await applicantsAPI.getTazworksReportURL({propertyID: propertyID});
                if(getURL !== null) {
                    const report = await backgroundScreeningAPI.getTazworksReport({
                        USERID: getURL.UserID,
                        PASSWORD: getURL.Password,
                        ORDERID: reportID,
                        REQUESTURL: getURL.RequestURL
                    });
                    if(report !== -1)   setReport(report);
                }
            }
            setLoading(false)
        }
        fetchData();
    }, [propertyID, isCIC, reportKey, reportID, history])

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading Report...`}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const renderReport = () => {
        if(report === null || report === "") {
            return <Alert severity="error">Error opening the report. Please contact us.</Alert>
        }
        if(report === 'Report is Pending')
            return <Alert severity="error">{report}</Alert>

        return (
            <RctCollapsibleCard heading="">
                <div style={{marginLeft: '2%', marginRight: '2%'}}>
                    <iframe id="reportBGID" title="reportBGID" src={report} width="100%" height="1000" align="center" target="_self" valign="top" scrolling="yes" frameborder="no"></iframe>
                </div>
            </RctCollapsibleCard>
        )
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => {
                        history.goBack()
                    }}></i>
                    <h2>
                        <span>Background Screening</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    {renderReport()}
                </div>
            </div>
        </Main>
    )
}

export default ViewBackgroundReport;