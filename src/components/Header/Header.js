import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { IconButton, AppBar, Toolbar, Tooltip } from '@material-ui/core';
import screenfull from 'screenfull';

import Search from './Search';
import MobileSearchForm from './MobileSearchForm';
import Notifications from './Notifications';
import PropertySelection from './PropertySelection';
import User from './User';

const Header = () => {
    const [ isMobileSearchFormVisible, setIsMobileSearchFormVisible ] = useState(false);
    //const [ openChat, setOpenChat ] = useState(false);

    const openMobileSearchForm = () => {
        setIsMobileSearchFormVisible(true);
    }

    const toggleScreenFull = () => {
		screenfull.toggle();
	}

    return (
        <div className="app-header">
            <AppBar position="static" className="rct-header">
                <Toolbar className="d-flex justify-content-between w-100 pl-0">
                    <div className="d-inline-flex align-items-center">
                        <div className="site-logo">
                            <Link to="/" className="logo-mini">
                            <img src={`${process.env.PUBLIC_URL}/assets/images/img/logo-white.png`} className="mr-15" alt="site logo"  height="35" />
                            </Link>
                        </div>
                        <ul className="list-inline mb-0 navbar-left">
                            <li className="list-inline-item search-icon d-inline-block">
                                <Search />
                                <IconButton mini="true" className="search-icon-btn" onClick={() => openMobileSearchForm()}>
                                <i className="zmdi zmdi-search"></i>
                                </IconButton>
                                <MobileSearchForm
                                isOpen={isMobileSearchFormVisible}
                                    onClose={() => setIsMobileSearchFormVisible(false)}
                                />
                            </li>
                        </ul>
                    </div>
                    <ul className="navbar-right list-inline mb-0">
                        <PropertySelection />
                        <Notifications />
                        <li className="list-inline-item setting-icon">
                            <Tooltip title="Chat" placement="bottom">
                                <IconButton aria-label="settings" onClick={() => alert('Open iRent Chat')}>
                                    <i className="zmdi zmdi-comment"></i>
                                </IconButton>
                            </Tooltip>
                        </li>
                        <li className="list-inline-item">
                            <Tooltip title="Full Screen" placement="bottom">
                                <IconButton aria-label="settings" onClick={() => toggleScreenFull()}>
                                    <i className="zmdi zmdi-crop-free"></i>
                                </IconButton>
                            </Tooltip>
                        </li>
                        <li className="list-inline-item" style={{display: "inline-block"}}>
                            <User />
                        </li>
                    </ul>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default withRouter(Header);