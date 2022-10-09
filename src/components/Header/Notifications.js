/**
 * Notification Component
 */
 import React, { useState, useEffect } from 'react';
 import { Scrollbars } from 'react-custom-scrollbars';
 import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
 import { Badge } from 'reactstrap';
 import IconButton from '@material-ui/core/IconButton';
 import Tooltip from '@material-ui/core/Tooltip';
 import { useSelector } from "react-redux";
 
import * as homeAPI from '../../Api/home';

 function Notifications(){
   const login = useSelector((state) => state.login);
   const propertyID = login.selectedPropertyID;
    
   const [notifications, setNotifications] = useState(null);

    useEffect(() => {
       async function fetchData() {
         setNotifications(await homeAPI.getNotifications(propertyID));   
       }      
       fetchData();
    },[propertyID])
 
    return (
       <UncontrolledDropdown nav className="list-inline-item notification-dropdown">
          <DropdownToggle nav className="p-0">
             <Tooltip title="Notifications" placement="bottom">
                <IconButton className="shake" aria-label="bell">
                   <i className="zmdi zmdi-notifications-active"></i>
                   <Badge color="danger" className="badge-xs badge-top-right rct-notify"></Badge>
                </IconButton>
             </Tooltip>
          </DropdownToggle>
          <DropdownMenu right>
             <div className="dropdown-content">
                <div className="dropdown-top d-flex justify-content-between rounded-top bg-primary">
                   <span className="text-white font-weight-bold">
                     <h2>Notifications</h2>
                   </span>
                </div>
                <Scrollbars className="rct-scroll" autoHeight autoHeightMin={100} autoHeightMax={280}>
                   <ul className="list-unstyled dropdown-list">
                      {notifications && notifications.map((notification, key) => (
                         <li key={key}>
                            <div className="media">
                               <div className="mr-10">
                                  {/*<img src={notification.userAvatar} alt="user profile" className="media-object rounded-circle" width="50" height="50" />*/}
                               </div>
                               <div className="media-body pt-5">
                                  <div className="d-flex justify-content-between">
                                     <h5 className="mb-5 text-primary">{notification.name}</h5>
                                     <span className="text-muted fs-12"><Badge color="danger">{notification.value}</Badge></span>
                                  </div>
                               </div>
                            </div>
                         </li>
                      ))}
                   </ul>
                </Scrollbars>
             </div>
          </DropdownMenu>
       </UncontrolledDropdown>
    );
 }
 
 export default Notifications;
 