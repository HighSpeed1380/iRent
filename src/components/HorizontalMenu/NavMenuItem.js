import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import IntlMessages from '../Util/IntlMessages';
import Chip from '@material-ui/core/Chip';

const NavMenuItem = (props) => {
    const { menu } = props;

    return (
        <li className="nav-item">
            {menu.child_routes !== null ?
                <Fragment>
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className={menu.menu_icon}></i>
                    <IntlMessages id={menu.menu_title} />
                    {menu.new_item && menu.new_item === true ?
                        <Chip label="new" className="new-item" color="secondary" />
                        :
                        ''
                    }
                </a>
                <ul className={classnames("list-unstyled sub-menu-child", { 'deep-level': menu.child_routes.length > 10 })}>
                    {menu.child_routes.map((subMenu, subKey) => {
                        if (!subMenu.child_routes) {
                            return (
                            <li className='nav-item' key={subKey}>
                                <NavLink to={subMenu.path} className="nav-link no-arrow" activeClassName="active">
                                    <IntlMessages id={subMenu.menu_title} />
                                    {subMenu.new_item && subMenu.new_item === true ?
                                        <Chip label="new" className="new-item" color="secondary" />
                                        :
                                        ''
                                    }
                                </NavLink>
                            </li>
                            )
                        }
                        return (
                            <li className='nav-item' key={subKey}>
                            <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                                <span className="menu-title"><IntlMessages id={subMenu.menu_title} /></span>
                            </a>
                            <ul className="list-unstyled sub-menu-sub-child">
                                {subMenu.child_routes.map((nestedMenu, nestedKey) => (
                                    <li className="nav-item" key={nestedKey}>
                                        <NavLink to={nestedMenu.path} className="nav-link" activeClassName="active">
                                        <IntlMessages id={nestedMenu.menu_title} />
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                            </li>
                        );
                    })}
                </ul>
                </Fragment> :
                <NavLink to={menu.path} className="nav-link no-arrow">
                <i className={menu.menu_icon}></i>
                <IntlMessages id={menu.menu_title} />
                </NavLink>
            }
        </li>
    );
}

export default NavMenuItem;