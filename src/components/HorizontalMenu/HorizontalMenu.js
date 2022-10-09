import React from 'react';
import navLinks from './NavLinks';
import NavMenuItem from './NavMenuItem';

const HorizontalMenu = () => {

    return (
        <div className="horizontal-menu">
            <ul className="list-unstyled nav">
                <li className="nav-item">
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className="zmdi zmdi-view-dashboard"></i>
                    <span className="menu-title">Company Profile</span>
                </a>
                <ul className="list-unstyled sub-menu">
                    {navLinks && navLinks.category1.map((menu, key) => (
                        <NavMenuItem
                            menu={menu}
                            key={key}
                        />
                    ))}
                </ul>
                </li>
                <li className="nav-item">
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className="zmdi zmdi-money"></i>
                    <span className="menu-title">Financial</span>
                </a>
                <ul className="list-unstyled sub-menu">
                    {navLinks && navLinks.category2.map((menu, key) => (
                        <NavMenuItem
                            menu={menu}
                            key={key}
                        />
                    ))}
                </ul>
                </li>
                <li className="nav-item">
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className="zmdi zmdi-home"></i>
                    <span className="menu-title">Tenancy</span>
                </a>
                <ul className="list-unstyled sub-menu">
                    {navLinks && navLinks.category3.map((menu, key) => (
                        <NavMenuItem
                            menu={menu}
                            key={key}
                        />
                    ))}
                </ul>
                </li>
                <li className="nav-item">
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className="zmdi zmdi-chart"></i>
                    <span className="menu-title">Reports</span>
                </a>
                <ul className="list-unstyled sub-menu">
                    {navLinks && navLinks.category4.map((menu, key) => (
                        <NavMenuItem
                            menu={menu}
                            key={key}
                        />
                    ))}
                </ul>
                </li>
                <li className="nav-item">
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className="zmdi zmdi-assignment-check"></i>
                    <span className="menu-title">Marketing</span>
                </a>
                <ul className="list-unstyled sub-menu">
                    {navLinks && navLinks.category5.map((menu, key) => (
                        <NavMenuItem
                            menu={menu}
                            key={key}
                        />
                    ))}
                </ul>
                </li>
                <li className="nav-item">
                <a href="!#" onClick={e => e.preventDefault()} className="nav-link">
                    <i className="zmdi zmdi-info-outline"></i>
                    <span className="menu-title">Help</span>
                </a>
                <ul className="list-unstyled sub-menu">
                    {navLinks && navLinks.category6.map((menu, key) => (
                        <NavMenuItem
                            menu={menu}
                            key={key}
                        />
                    ))}
                </ul>
                </li>
            </ul>
        </div>
    );
}

export default HorizontalMenu;