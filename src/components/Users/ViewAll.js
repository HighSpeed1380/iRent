import React, {useState, useEffect} from 'react';
import { NotificationManager } from 'react-notifications';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import SweetAlert from 'react-bootstrap-sweetalert';
import NumberFormat from 'react-number-format';
import { Button } from '@material-ui/core';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as usersAPI from '../../Api/users';

const GLCategories = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [userProperties, setUserProperties] = useState(new Map())
    const [deleteID, setDeleteID] = useState(0);
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const arr = [];
            const users = await usersAPI.getUsers(companyID);
            for(const u of users.users) {
                arr.push({
                    user: `${u.UserFName} ${u.UserLName}`,
                    phone: u.UserPhone,
                    email: u.UserEmail,
                    properties: u,
                    securityLevel: u.SecurityLevel,
                    edit: u.UserID,
                    delete: u.UserID
                })
            }
            setUsers(arr);
            setUserProperties(new Map(Object.entries(users.properties)));
            setLoading(false);
        }
        fetchData();
    }, [companyID, updated])

    const columns = [
        { name: 'user', label: 'User', },
        { name: 'phone', label: 'Phone', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <a href={`tel:${value}`}>
                            <NumberFormat value={value} displayType={'text'} format="+1 (###) ###-####" mask="_"/>
                        </a>
                    )
                }
            }
        },
        { name: 'email', label: 'Email', 
            options: {
                customBodyRender: (value) => {
                    return <a href={`mailto:${value}`}>{value}</a>
                }
            }
        },
        { name: 'properties', label: 'Properties', 
            options: {
                customBodyRender: (value) => {
                    let props = userProperties.get(value.UserID.toString()) || [];
                    return (
                        <ul>
                            {props.map((obj, idx) => 
                                <li key={idx}>{obj.PropertyName}</li>
                            )}
                        </ul>
                    )
                }
            }
        },
        { name: 'securityLevel', label: 'Security Level', },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/users/edit',
                                    state: { 
                                        userID: parseInt(value)
                                    }
                                }
                                history.push(location);
                            }}
                        >
                            <Edit />
                        </IconButton>
                    )
                }
            },
        },
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                setDeleteID(parseInt(value));
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    )
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: false,
        selectableRows: "none",
    }

    const deleteUser = async () => {
        setLoading(true);
        const res = await usersAPI.deactivateUser(deleteID);
        setLoading(false);
        setDeleteID(0);
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        setUpdated(!updated);
    }   

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Users..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const renderTitle = () => {
        return (
            <>
                <span style={{marginRight: '2rem'}}>Existing Users - {users.length} {' '}</span>
                <Button type="button" variant="outlined" color="primary" 
                    onClick={() => {
                        const location = {
                            pathname: '/users/add',
                        }
                        history.push(location);
                    }}
                > 
                    Add New User 
                </Button>
            </>
        )
    }

    return (
        <Main>
            <SweetAlert
                warning
                btnSize="sm"
                show={deleteID !== 0}
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                cancelBtnBsStyle="success"
                title="Are you sure?"
                onConfirm={() => deleteUser()}
                onCancel={() => setDeleteID(0)}
            >
                You will not be able to recover this user!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Users</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={renderTitle()}
                                data={users}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        </Main>
    )
}

export default GLCategories;