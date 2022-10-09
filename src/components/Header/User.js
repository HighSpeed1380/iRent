/**
 * Notification Component
 */
import React, { useState } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from '../../state/index';
import { useSelector } from "react-redux";

import IntlMessages from '../Util/IntlMessages';
 
const User = () => {
    const login = useSelector((state) => state.login);
    const user = login.user
    const dispatch = useDispatch();
    const { logout } = bindActionCreators(actionCreators, dispatch);
    const [userDropdownMenu, setUserDropdownMenu] = useState(null);
    
    const toggleUserDropdownMenu = () => {
        setUserDropdownMenu(!userDropdownMenu);
    }
 
    return (
        <UncontrolledDropdown
            isOpen={userDropdownMenu}
            toggle={() => toggleUserDropdownMenu()}
        >
            <DropdownToggle
                tag="div"
                className="d-flex align-items-center"
            >
                <div className="user-profile">
                    <img
                        src={`${process.env.PUBLIC_URL}/assets/images/avatars/profile.jpg`}
                        alt="user profile"
                        className="img-fluid rounded-circle"
                        width="35"
                        height="85"
                    />
                </div>
            </DropdownToggle>
            <DropdownMenu right>
            <ul className="list-unstyled mb-0">
                <li className="p-15 border-bottom user-profile-top bg-primary rounded-top">
                    <p className="text-white mb-0 fs-14">{user.firstName} {user.lastName}</p>
                    <span className="text-white fs-14">{user.email}</span>
                </li>
                <li className="p-10">
                    <Link to={{
                        pathname: '/profile',
                        state: { activeTab: 0 }
                    }}>
                        <i className="zmdi zmdi-account text-primary mr-3"></i>
                        <span><IntlMessages id="widgets.profile" /></span>
                    </Link>
                </li>
                <li className="p-10 border-top">
                    <a href="!#" onClick={() => logout()}>
                        <i className="zmdi zmdi-power text-danger mr-3"></i>
                        <span><IntlMessages id="widgets.logOut" /></span>
                    </a>
                </li>
            </ul>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
 }
 
 export default User;
 