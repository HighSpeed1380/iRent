import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table, Badge, Collapse } from 'reactstrap';
import CurrencyFormat from 'react-currency-format';
import IconButton from '@material-ui/core/IconButton';
import EditOutlined from '@material-ui/icons/EditOutlined';
import AddCircleOutlined from '@material-ui/icons/AddCircleOutlined';
import RemoveCircleOutlined from '@material-ui/icons/RemoveCircleOutlined';
import DeleteForeverOutlined from '@material-ui/icons/DeleteForeverOutlined';
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';
import NotificationManager from 'react-notifications/lib/NotificationManager';
import { useHistory } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as helper from '../Util/myFunctions';
import * as homeAPI from '../../Api/home';
import * as Constants from '../Util/constants';

const ListItem = (props) => {
    const history = useHistory();
    const { data } = props;
    const [ showDescription, setShowDescription ] = useState(false);

    const onShowDescription = () => { setShowDescription(!showDescription) };

    const renderPaid = (paid) => {
        if(paid === 'No')
            return <Badge color="danger">No</Badge>
        else
            return <Badge color="success">yes</Badge>
    };

    return (
        <Fragment>
           <tr>
              <td className="text-center">
                <Link to={{
                    pathname: '/tenants/details',
                    state: {
                        tenantID: parseInt(data.TenantID)
                    }
                }}>
                    {data.UnitName} {data.TenantFName} {data.TenantLName}
                </Link>
              </td>
              <td className="text-center">{helper.formatDate(new Date(data.SubmitDate))}</td>
              <td className="text-center">{helper.formatDate(new Date(data.PromissDate))}</td>
              <td className="text-center">
                {data.Promiss.substring(0, 15)}...
                <IconButton onClick={() => onShowDescription()}>
                    {showDescription ?
                        <RemoveCircleOutlined />
                        :
                        <AddCircleOutlined />
                    }
                </IconButton>
              </td>
              <td className="text-center">
                <CurrencyFormat value={0.00} displayType={'text'} thousandSeparator={true} prefix={'$'} />
              </td>
              <td className="text-center">{data.UserFName} {data.UserLName}</td>
              <td className="text-center">{data.StaffComment === '0' ? "" : data.StaffComment}</td>
              <td className="text-center">{renderPaid(data.YesNo)}</td>
              <td className="text-center">
                <IconButton 
                    aria-label="Edit"
                    onClick={() => {
                        const location = {
                            pathname: '/editPromissToPay',
                            state: { 
                                promissToPayID: parseInt(data.PromissToPayID)
                            }
                        }
                        history.push(location);
                    }}
                >
                    <EditOutlined />
                </IconButton>
              </td>
              <td>
                <IconButton 
                    aria-label="Delete"
                    onClick={()=>{
                        props.setDeletePromissPayID(parseInt(data.PromissToPayID))
                    }}
                >
                    <DeleteForeverOutlined />
                </IconButton>
              </td>
           </tr>
           {showDescription &&
              <tr>
                 <td colSpan="7">
                    <Collapse isOpen={showDescription}>
                       <div className="p-10">
                          <p>{data.Promiss}</p>
                       </div>
                    </Collapse>
                 </td>
              </tr>
           }
        </Fragment>
     )
}

const MissedPromise = () => {
    const login = useSelector((state) => state.login);

    const propertyID = login.selectedPropertyID;

    const [ promisePay, setPromisePay ] = useState([]);
    const [ deletePromissPayID, setDeletePromissPayID ] = useState(0);
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setPromisePay(await homeAPI.getMissedPromissPay(propertyID));
        }
        fetchData();
    }, [updated, propertyID]);

    const msg = `Missed Promise To Pays`;

    const deletePromissPay = async () => {
        const res = await homeAPI.updatePromissToPay({
            success: 1,
            promissToPayID: deletePromissPayID
        });
        setDeletePromissPayID(0);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
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
                    <SweetAlert
                        warning
                        btnSize="sm"
                        show={deletePromissPayID !== 0 ? true : false}
                        showCancel
                        confirmBtnText="Yes, delete it!"
                        confirmBtnBsStyle="danger"
                        cancelBtnBsStyle="success"
                        title="Are you sure?"
                        onConfirm={() => deletePromissPay()}
                        onCancel={() => setDeletePromissPayID(0)}
                    >
                        You will not be able to recover this bill!
                    </SweetAlert>
                    <Table hover className="mb-0" responsive>
                        <thead>
                            <tr>
                                <th className="text-center">Unit</th>
                                <th className="text-center">Submit Date</th>
                                <th className="text-center">Target Date</th>
                                <th className="text-center">Tenant Promise</th>
                                <th className="text-center">Bal Owed</th>
                                <th className="text-center">Submit By</th>
                                <th className="text-center">Staff Comment</th>
                                <th className="text-center">Paid</th>
                                <th className="text-center">Edit</th>
                                <th className="text-center">Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promisePay && promisePay.map((data, key) => (
                                <ListItem
                                    key={key}
                                    data={data}
                                    setDeletePromissPayID={setDeletePromissPayID}
                                />
                            ))}
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default MissedPromise;