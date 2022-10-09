import React, { useState, useEffect, Fragment } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { Table, Collapse } from 'reactstrap';
import { Badge } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import EditOutlined from '@material-ui/icons/EditOutlined';
import AddCircleOutlined from '@material-ui/icons/AddCircleOutlined';
import RemoveCircleOutlined from '@material-ui/icons/RemoveCircleOutlined';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as helper from '../Util/myFunctions';
import * as homeAPI from '../../Api/home';

const ListItem = (props) => {
    const history = useHistory();
    const { data } = props;
    const [ showDescription, setShowDescription ] = useState(false);

    const onShowDescription = () => { setShowDescription(!showDescription) };

    const renderStatus = (status) => {
        if(status === 'Open') 
            return <Badge color="success">{status}</Badge>;
        else if(status === 'Closed')
            return <Badge color="grey">{status}</Badge>;
        else
            return <Badge color="warning">{status}</Badge>;
    };

    return (
        <Fragment>
           <tr>
              <td className="text-center">{data.UnitName}</td>
              <td className="text-center">{helper.formatDate(new Date(data.WorkOrderSubmitDate))}</td>
              <td className="text-center">
                {data.WorkOrderDescription.substring(0, 15)}...
                <IconButton onClick={() => onShowDescription()}>
                    {showDescription ?
                        <RemoveCircleOutlined />
                        :
                        <AddCircleOutlined />
                    }
                </IconButton>
              </td>
              <td className="text-center">{data.WorkOrderComment === "0" ? "" : data.WorkOrderComment}</td>
              <td className="text-center">{helper.formatDate(new Date(data.WorkOrderCompleteDate))}</td>
              <td className="text-center">{renderStatus(data.Status)}</td>
              <td className="text-center">
                <IconButton 
                    aria-label="Edit"
                    onClick={()=>{
                        const location = {
                            pathname: '/workOrders/update',
                            state: { 
                                workOrderID: parseInt(data.WorkOrderID),
                                return: '/'
                            }
                        }
                        history.push(location);
                    }}
                >
                    <EditOutlined />
                </IconButton>
              </td>
           </tr>
           {showDescription &&
              <tr>
                 <td colSpan="7">
                    <Collapse isOpen={showDescription}>
                       <div className="p-10">
                          <p>{data.WorkOrderDescription}</p>
                       </div>
                    </Collapse>
                 </td>
              </tr>
           }
        </Fragment>
     )
}

const WorkOrdersSnapshot = () => {
    const login = useSelector((state) => state.login);
    const propertyID = login.selectedPropertyID;

    const [ wkSnapdata, setWkSnapdata ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setWkSnapdata(await homeAPI.getSnapWorkOrders(propertyID));
        }
        fetchData();
    }, [propertyID]);

    const msg = `Work Orders snapshot - Total Open: ${wkSnapdata.length}`

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
                                <th className="text-center">Date Submited</th>
                                <th className="text-center">Description</th>
                                <th className="text-center">Staff Comment</th>
                                <th className="text-center">Comment Date</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wkSnapdata && wkSnapdata.map((data, key) => (
                                <ListItem
                                    key={key}
                                    data={data}
                                />
                            ))}
                        </tbody>
                    </Table>
                </Scrollbars>
            </Fragment>
        </RctCollapsibleCard>
    );
}

export default WorkOrdersSnapshot;