import React, { useState, useCallback } from 'react';
import { DropdownToggle, DropdownMenu, Dropdown } from 'reactstrap';
import { useSelector, useDispatch } from "react-redux";
import { Badge, Input } from 'reactstrap';
import Tooltip from '@material-ui/core/Tooltip';
import { isMobile } from 'react-device-detect';
import { bindActionCreators } from "redux";
import { actionCreators } from '../../state/index';

const PropertySelection = () => {
    const [ openDropDown, setOpenDropDown ] =  useState(false);

    const login = useSelector((state) => state.login);
    const properties = login.properties;
    const selectedProperty = login.selectedPropertyID;

    const dispatch = useDispatch();
    const { updateSelectedProperty } = bindActionCreators(actionCreators, dispatch);

    const propertyName = useCallback(() => {
        for(const p of properties) {
            if(parseInt(p.PropertyID) === parseInt(selectedProperty)) {
                return p.PropertyName;
            }
        }
        return "";
    }, [selectedProperty, properties])

    const toggle = () => setOpenDropDown(!openDropDown);

    const handlePropertyChange = (id) => {
        updateSelectedProperty(parseInt(id));
        toggle();
    }

    const renderDropDownToggle = () => {
        if (isMobile) {
            return (
                <DropdownToggle caret nav className="header-icon language-icon" >
                    <Tooltip title={propertyName()} placement="bottom">
                        <i className="zmdi zmdi-home"></i>
                    </Tooltip>
                </DropdownToggle>
            );
        }
        return (
            <DropdownToggle caret nav className="header-icon language-icon" style={{display: 'inline-block', width: '100%'}}>
                <Tooltip title={propertyName()} placement="bottom" style={{fontSize: '1.0rem'}}>
                    <span>{propertyName()}</span>
                </Tooltip>
            </DropdownToggle>
        )
    }

    return (
        <Dropdown nav className="list-inline-item language-dropdown tour-step-5" isOpen={openDropDown} toggle={toggle}>
            {renderDropDownToggle()}
            <DropdownMenu>
                <ul className="list-unstyled mb-0">
                    <li className="p-15 border-bottom user-profile-top bg-primary rounded-top">
                        <span className="text-white font-weight-bold">Properties</span>
                        {' '}
                        <Badge color="warning">{properties.length}</Badge>
                    </li>
                    <li className="p-10">
                        <Input type="select" name="selectProperty" id="selectProperty" value={parseInt(selectedProperty)}
                            onChange={(e) => handlePropertyChange(e.target.value)}
                        >
                            {properties.map((obj) => {
                                return (
                                    <option 
                                        key={obj.PropertyID} 
                                        value={obj.PropertyID}
                                    >
                                        {obj.PropertyName}
                                    </option>
                                );
                            })}
                        </Input>
                    </li>
                </ul>
            </DropdownMenu>
        </Dropdown>
    );
}

export default PropertySelection;