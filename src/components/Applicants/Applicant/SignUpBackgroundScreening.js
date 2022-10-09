import React, {useState, useEffect} from 'react';
import { Button, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import Alert from '@material-ui/lab/Alert';
import { FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../../Main';
import RctCollapsibleCard from '../../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../../Util/LinearProgress';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';

const style = {
    border: '2px solid #eee',
    height: '270px',
    width: '100%',
    overflow: 'auto',
    padding: '10px'
}

const SignUpBackgroundScreening = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [loading, setLoading] = useState(false);
    const [clientServiceAgreement, setClientServiceAgreement] = useState("")
    const [clientServiceCheck, setClientServiceCheck] = useState(false);
    const [creditAddendum, setCreditAddendum] = useState("");
    const [creditAddendumCheck, setCreditAddendumCheck] = useState(false);
    const [creditReprotScoreCheck, setCreditReportScoreCheck] = useState(false);
    const [businessNature, setBusinessNature] = useState("");
    const [intentUse, setIntentUse] = useState("");
    const [anticipateVolume, setAnticipateVolume] = useState("");
    const [intentAccess, setIntentAccess] = useState("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const data = await applicantsAPI.getVicTigSignUpData(companyID);
                console.log(data)
            if(data !== null) {
                setClientServiceAgreement(data.clientService);
                setCreditAddendum(data.creditAddendum);
            }
            setLoading(false);
        }
        fetchData();
    }, [companyID])

    const handleSubmit = async () => {
        if(!clientServiceCheck || !creditAddendumCheck) {
            NotificationManager.error("You must agree with the Client Services Agreement and the Credit Addendum Tenant TU", "Error");
            return;
        }
        if(creditReprotScoreCheck){
            if(businessNature === '' || intentUse === '' || anticipateVolume === '' || intentAccess === '') {
                NotificationManager.error("All Actual Credit Report Scores fields are required if Actual Credit Report Scores is selected", "Error", 6000);
                return;
            }
        }
        setLoading(true);
        const res = await applicantsAPI.submitVicTigDocs({
            companyID,
            letterIntent: creditReprotScoreCheck,
            natureOfBusiness: businessNature,
            intentService: intentUse,
            monthlyVolume: anticipateVolume,
            accessIntent: intentAccess
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        const location = {
            pathname: '/applicants/viewAll',
        }
        history.push(location);
    }

    const renderLetterOfIntent = () => {
        if(!creditReprotScoreCheck) return <></>;

        return (
            <>
                <div className="row" style={{marginBottom: '1rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <Input type="textarea" rows={4} value={businessNature} onChange={(e) => setBusinessNature(e.target.value)} 
                            placeholder={"In this paragraph you will write the nature of your business; i.e... We are a computer resell company, specializing in selling, repairing or trading computer components including hardware, software, supplies and accessories."} />
                    </div>
                </div>
                <div className="row" style={{marginBottom: '1rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <Input type="textarea" rows={4} value={intentUse} onChange={(e) => setIntentUse(e.target.value)} 
                            placeholder={"In this paragraph list the intended use for the service; i.e... We will specialize in in-house financing; therefore will determine the stability of clients based on credit scoring/reporting."} />
                    </div>
                </div>
                <div className="row" style={{marginBottom: '1rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <Input type="textarea" rows={4} value={anticipateVolume} onChange={(e) => setAnticipateVolume(e.target.value)} 
                            placeholder={"In this paragraph list monthly anticipated volume; i.e... We anticipate running 25 to 50 reports each month."} />
                    </div>
                </div>
                <div className="row" style={{marginBottom: '1rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <Input type="textarea" rows={4} value={intentAccess} onChange={(e) => setIntentAccess(e.target.value)} 
                            placeholder={"In this paragraph list whether your intent to access local, regional or national; i.e... Our anticipation is to run local and regional however, we may possible obtain clients from our area which may put us on a national level."} />
                    </div>
                </div>
            </>
        )
    }

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={`Loading...`}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => {
                        history.goBack()
                    }}></i>
                    <h2>
                        <span>Background and Credit Check Signup</span>
                    </h2>
                </div>
            </div>
            <div style={{marginLeft: '1%', marginRight: '1%'}}>
                <div className="row" style={{marginTop: '1.5rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <Alert severity="info">
                            iRent uses 3rd party tenant screening vendors. The services you are signing up for are provided by VICTIG. There is no signup fee, but you will be charged $14 per screening report. You must agree to the following VICTIG terms and conditions to use their services
                        </Alert>
                    </div>
                </div>
                <div className="row" style={{marginTop: '1.5rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <h3>VICTIG Client Services Agreement</h3>
                        <div style={style}>
                            <div dangerouslySetInnerHTML={{__html:clientServiceAgreement}} />
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={clientServiceCheck} />} 
                                label="Agree with the Client Services Agreement." 
                                onClick={() => setClientServiceCheck(!clientServiceCheck)}
                            />
                        </FormGroup>
                    </div>
                </div>

                <div className="row" style={{marginTop: '1.5rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <h3>Credit Addendum Tenant TU</h3>
                        <div style={style}>
                            <div dangerouslySetInnerHTML={{__html:creditAddendum}} />
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={creditAddendumCheck} />} 
                                label="Agree with the Credit Addendum Tenant TU." 
                                onClick={() => setCreditAddendumCheck(!creditAddendumCheck)}
                            />
                        </FormGroup>
                    </div>
                </div>

                <div className="row" style={{marginTop: '1.5rem'}}>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <h3>Actual Credit Report Scores</h3>
                        <Alert severity="info">
                            Tenant Screening from VITIG returns a score card that represents the Credit Data.  If you need the actual credit report scores, Federal Regulations require a site inspection of your facilities.  If you would like this extra functionality, there is a one time signup fee of $100 that covers the cost of the actual inspection.
                        </Alert>
                    </div>
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={creditReprotScoreCheck} />} 
                                label="Select Actual Credit Report Scores." 
                                onClick={() => setCreditReportScoreCheck(!creditReprotScoreCheck)}
                            />
                        </FormGroup>
                    </div>
                </div>
                
                {renderLetterOfIntent()}

                <div className="row">
                    <Button type="button" color="primary" style={{marginTop: '1rem', marginLeft: '1rem'}} onClick={handleSubmit}>Submit</Button>
                </div>
            </div>
        </Main>
    )
}

export default SignUpBackgroundScreening;