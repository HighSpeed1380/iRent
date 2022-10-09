import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table, Badge } from 'reactstrap';
import CurrencyFormat from 'react-currency-format';
import IconButton from '@material-ui/core/IconButton';
import EditOutlined from '@material-ui/icons/EditOutlined';
import { useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as helper from '../Util/myFunctions';
import * as homeAPI from '../../Api/home';

const DelinquenciesOver = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [ delinquencies, setDelinquencies ] = useState([]);
    const [ totalDel, setTotalDel ] = useState(0);
    const [ threshold, setThreshold ] = useState(0);
    const [ evictionThreshold, setEvictionThreshold ] = useState(0);
    const [ total, setTotal ] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const data = await homeAPI.getDelinquenciesOver(propertyID);
            setDelinquencies(data.data);
            setTotalDel(data.delinquentTenants);
            setThreshold(data.Threshold);
            setEvictionThreshold(data.EvictionThreshold);
            setTotal(data.totalOverThreshold);
        }
        fetchData();
    }, [propertyID]);

    const renderTitle = () => {
        return (
            <p>
                ({totalDel}) Delinquencies Over ${parseFloat(threshold).toFixed(2)} - ${parseFloat(total).toFixed(2)}.
                {' '}<Link onClick={() => alert('Open Delinquencies Report')}>View All</Link>
            </p>
        );
    }

    const renderFileEviction = (data) => {
        if(data.TenantBalance > evictionThreshold) {
            if(data.EvictionFiledDate !== null) {
                return (
                    <td className="text-center">{helper.formatDate(new Date(data.EvictionFiledDate))}</td>
                );
            } else {
                return (
                    <td className="text-center">
                        <Badge 
                            color="danger"
                            onClick={() => {
                                document.location.href = `./index.cfm?P=54&TID=${data.TenantID}&R=30`;
                            }}
                            style={{cursor:'pointer'}}
                        >
                            File Eviction
                        </Badge>
                    </td>
                );
            }
        }
        return <td className="text-center"></td>;
    }

    return (
        <RctCollapsibleCard
           customClasses="overflow-hidden"
           colClasses="col-sm-6 col-md-6 w-xs-half-block"
           heading={renderTitle()}
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
                                <th className="text-center">Tenant</th>
                                <th className="text-center">Tenant Owes</th>
                                <th className="text-center">Delinquency Comments</th>
                                <th className="text-center">Edit</th>
                                <th className="text-center">Eviction?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delinquencies && delinquencies.map((data, key) => {
                                return (
                                    <tr key={key}>
                                        <td className="text-center">{data.Unit}</td>
                                        <td className="text-center">
                                            <Link to={{
                                                pathname: '/tenants/details',
                                                state: {
                                                    tenantID: parseInt(data.TenantID)
                                                }
                                            }}>
                                                {data.Tenant}
                                            </Link>
                                        </td>
                                        <td className="text-center">
                                            <CurrencyFormat value={data.TenantBalance.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                        </td>
                                        <td className="text-center">{data.DelinquencyComments}</td>
                                        <td className="text-center">
                                            <IconButton 
                                                aria-label="Edit"
                                                onClick={() => {
                                                    const location = {
                                                        pathname: '/editDelinquencyComment',
                                                        state: { 
                                                            tenantID: parseInt(data.TenantID)
                                                        }
                                                    }
                                                    history.push(location);
                                                }}
                                            >
                                                <EditOutlined />
                                            </IconButton>
                                        </td>
                                        {renderFileEviction(data)}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default DelinquenciesOver;