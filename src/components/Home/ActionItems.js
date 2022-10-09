import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table, Collapse } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import BorderColorOutlined from '@material-ui/icons/BorderColorOutlined';
import AddCircleOutlined from '@material-ui/icons/AddCircleOutlined';
import RemoveCircleOutlined from '@material-ui/icons/RemoveCircleOutlined';
import DeleteForeverOutlined from '@material-ui/icons/DeleteForeverOutlined';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as helper from '../Util/myFunctions';
import * as homeAPI from '../../Api/home';

const ListItem = (props) => {
    const history = useHistory();
    const { data, admin } = props;
    const [ showDescription, setShowDescription ] = useState(false);

    const onShowDescription = () => { setShowDescription(!showDescription) };

    const renderDelete = (id) => {
        if(admin in [1, 5]) {
            return (
                <td className="text-center">
                    <IconButton 
                        aria-label="Delete"
                        onClick={()=>{
                            const location = {
                                pathname: '/editMoveOutDate',
                                state: { 
                                    unitID: id
                                }
                            }
                            history.push(location);
                        }}
                    >
                        <DeleteForeverOutlined />
                    </IconButton>
                </td>
            );
        } else {
            return (<td className="text-center"></td>);
        }
    }

    return (
        <Fragment>
            <tr>
                <td className="text-center">{helper.formatDate(new Date(data.ActionItemDate))}</td>
                <td className="text-center">
                    {data.ActionItem.substring(0, 20)}...
                    <IconButton onClick={() => onShowDescription()}>
                        {showDescription ?
                            <RemoveCircleOutlined />
                            :
                            <AddCircleOutlined />
                        }
                    </IconButton>
                </td>
                <td className="text-center">{data.PMComment}</td>
                <td className="text-center">
                    <IconButton 
                        aria-label="Edit"
                        onClick={()=>{
                            const location = {
                                pathname: '/editActionItem',
                                state: { 
                                    actionItemID: parseInt(data.ActionItemsID)
                                }
                            }
                            history.push(location);
                        }}
                    >
                        <BorderColorOutlined />
                    </IconButton>
                </td>
                {renderDelete(data.ActionItemsID)}
            </tr>
            {showDescription &&
                <tr>
                    <td colSpan="5">
                        <Collapse isOpen={showDescription}>
                        <div className="p-10">
                            <p>{data.ActionItem}</p>
                        </div>
                        </Collapse>
                    </td>
                </tr>
            }
        </Fragment>
     )
}

const ActionItems = () => {
    const login = useSelector((state) => state.login);
    const user = login.user;
    const propertyID = login.selectedPropertyID;
    const admin = parseInt(user.securityLevel);

    const [ actionItemsData, setActionItemsData ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setActionItemsData(await homeAPI.getActionItems(propertyID));
        }
        fetchData();
    }, [propertyID]);

    return (
        <RctCollapsibleCard
           customClasses="overflow-hidden"
           colClasses="col-sm-6 col-md-6 w-xs-half-block"
           heading="Action Items"
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
                                <th className="text-center">Date</th>
                                <th className="text-center">Action</th>
                                <th className="text-center">Manager Comment</th>
                                <th className="text-center">Edit</th>
                                <th className="text-center">Del</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionItemsData && actionItemsData.map((data, key) => (
                                <ListItem
                                    key={key}
                                    data={data}
                                    admin={admin}
                                />
                            ))}
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default ActionItems;