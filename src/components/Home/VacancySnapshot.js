import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table, Badge } from 'reactstrap';
import CurrencyFormat from 'react-currency-format';
import IconButton from '@material-ui/core/IconButton';
import BorderColorOutlined from '@material-ui/icons/BorderColorOutlined';
import AssignmentIndOutlined from '@material-ui/icons/AssignmentIndOutlined';
import HighlightOffOutlined from '@material-ui/icons/HighlightOffOutlined';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from 'moment';
import { NotificationManager } from 'react-notifications';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as homeAPI from '../../Api/home';
import * as tenantAPI from '../../Api//tenants';
import * as helper from '../Util/myFunctions';
import * as Constants from '../Util/constants';

const VacancySnapshot = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;
    const admin = parseInt(login.user.securityLevel);

    const [ plSnapData, setPlSnapData ] = useState([]);
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setPlSnapData(await homeAPI.getPLSnapData(propertyID));
        }
        fetchData();
    }, [propertyID, updated]);

    const msg = `Vacancy Snapshot - Total Vacant ${plSnapData.length}`;
    let totalRent = 0;
    let totalLoss = 0;

    const renderPreLease = (data) => {
        if(data.PreLeasedID !== null) {
            const fullName = `${data.tenantFName} ${data.TenantLName}`;
            return (
                <td className="text-center">
                    {fullName}
                    <IconButton 
                        aria-label="Edit"
                        onClick={async ()=> {
                            const res = await tenantAPI.deletePreLeaseProspect(parseInt(data.PreLeasedID));
                            if(res === -1) {
                                NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
                                return;
                            }
                            setUpdated(!updated);
                        }}
                    >
                        <HighlightOffOutlined style={{ color: 'red' }} />
                    </IconButton>
                </td>
            )
        } else {
            return (
                <td className="text-center">
                    <IconButton 
                        aria-label="Edit"
                        onClick={()=> {
                            const location = {
                                pathname: '/preLease',
                                state: { 
                                    unitID: data.UnitID
                                }
                            }
                            history.push(location);
                        }}
                    >
                        <AssignmentIndOutlined style={{ color: '#228B22' }} />
                    </IconButton>
                </td>
            )
        }
    }

    const renderMoveOut = (dt, unitID) => {
        if(admin in [1, 2, 5, 6]) {
            return (
                <td className="text-center">
                    {moment.utc(dt).format("MM/DD/YYYY")}
                    <IconButton 
                        aria-label="Edit"
                        onClick={()=>{
                            const location = {
                                pathname: '/editMoveOutDate',
                                state: { 
                                    unitID: unitID
                                }
                            }
                            history.push(location);
                        }}
                    >
                        <BorderColorOutlined />
                    </IconButton>
                </td>
            );
        } else {
            return (
                <td className="text-center">{helper.formatDate(new Date(dt))}</td>
            );
        }
    }

    const renderNote = (Comment, unitID) => {
        return (
            <td className="text-center">
                {Comment}
                <IconButton 
                    aria-label="Edit"
                    onClick={()=>{
                        const location = {
                                pathname: '/editNote',
                                state: { 
                                    unitID: unitID
                                }
                            }
                            history.push(location);
                    }}
                >
                    <BorderColorOutlined />
                </IconButton>
            </td>
        );
    }

    return (
        <RctCollapsibleCard
           customClasses="overflow-hidden"
           colClasses="col-sm-6 col-md-6 w-xs-half-block"
           heading={msg}
           collapsible
           closeable
           fullBlock
        >
            <Fragment>
                <Scrollbars className="rct-scroll" autoHeight autoHeightMin={100}
                    autoHeightMax={424} autoHide
                >
                    <Table hover className="mb-0" responsive>
                        <thead>
                            <tr>
                                <th className="text-center">Unit</th>
                                <th className="text-center">Unit Type</th>
                                <th className="text-center">Move Out Date</th>
                                <th className="text-center">Note</th>
                                <th className="text-center">Days On Market</th>
                                <th className="text-center">Market Rent</th>
                                <th className="text-center">Loss to Vacancy</th>
                                <th className="text-center">Pre Lease?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plSnapData && plSnapData.map((data, key) => {
                                const daysMarket = Math.abs(helper.dateDiffInDays(new Date(), new Date(data.VacantDate)));
                                const lossVacancy = (parseFloat(data.UnitCharge)/30) * daysMarket;
                                totalRent += parseFloat(data.UnitCharge);
                                totalLoss += lossVacancy;
                                return (
                                    <tr key={key}>
                                        <td className="text-center">{data.UnitName}</td>
                                        <td className="text-center">{data.UnitType}</td>
                                        {renderMoveOut(data.VacantDate, data.UnitID)}
                                        {renderNote(data.Comment, data.UnitID)}
                                        <td className="text-center">{daysMarket}</td>
                                        <td className="text-center">
                                            <CurrencyFormat value={parseFloat(data.UnitCharge).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                        </td>
                                        <td className="text-center">
                                            <Badge color="danger">
                                                <CurrencyFormat value={lossVacancy.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                            </Badge>
                                        </td>
                                        {renderPreLease(data)}
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="5" align="right"><b>Total:</b></td>
                                <td>
                                    <CurrencyFormat value={totalRent.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                </td>
                                <td>
                                    <Badge color="danger">
                                        <CurrencyFormat value={totalLoss.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                    </Badge>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default VacancySnapshot;