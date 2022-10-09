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
import * as ownersAPI from '../../Api/owners';

const Owners = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState([]);
    const [userProperties, setUserProperties] = useState(new Map())
    const [deleteID, setDeleteID] = useState(0);
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const arr = [];
            const owners = await ownersAPI.getOwners(companyID);
            for(const o of owners.owners) {
                arr.push({
                    owner: o.OwnerName,
                    contact: o,
                    address: o,
                    properties: o,
                    rep: o.Rep,
                    edit: o.OwnerID,
                    delete: o.OwnerID
                })
            }
            setOwners(arr);
            setUserProperties(new Map(Object.entries(owners.properties)));
            setLoading(false);
        }
        fetchData();
    }, [companyID, updated])

    const columns = [
        { name: 'owner', label: 'Owner', },
        { name: 'contact', label: 'Contact', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <>
                            <a href={`tel:${value.OwnerPhone}`}>
                                <NumberFormat value={value.OwnerPhone} displayType={'text'} format="+1 (###) ###-####" mask="_"/>
                            </a>
                            <br/>
                            <a href={`tel:${value.OwnerCell}`}>
                                <NumberFormat value={value.OwnerCell} displayType={'text'} format="+1 (###) ###-####" mask="_"/>
                            </a>
                            <br/>
                            <a href={`mailto:${value.OwnerEmail}`}>{value.OwnerEmail}</a>
                        </>
                    )
                }
            }
        },
        { name: 'address', label: 'Address', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <span>
                            {value.OwnerAddress} <br/>
                            {value.OwnerCity} {value.OwnerState} {value.OwnerZip}
                        </span>
                    )
                }
            }
        },
        { name: 'properties', label: 'Properties', 
            options: {
                customBodyRender: (value) => {
                    let props = userProperties.get(value.OwnerID.toString()) || [];
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
        { name: 'rep', label: 'Rep', },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/owners/edit',
                                    state: { 
                                        ownerID: parseInt(value)
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

    const deleteOwner = async () => {
        setLoading(true);
        const res = await ownersAPI.deleteOwner(deleteID);
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
                heading={"Loading Owners..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    const renderTitle = () => {
        return (
            <>
                <span style={{marginRight: '2rem'}}>Existing Owners - {owners.length} {' '}</span>
                <Button type="button" variant="outlined" color="primary" 
                    onClick={() => {
                        const location = {
                            pathname: '/owners/add',
                        }
                        history.push(location);
                    }}
                > 
                    Add New Owner 
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
                onConfirm={() => deleteOwner()}
                onCancel={() => setDeleteID(0)}
            >
                You will not be able to recover this owner!
            </SweetAlert>
            <div className="formelements-wrapper" style={Constants.margins}>
                <div className="page-title d-flex justify-content-between align-items-center">
                    <div className="page-title-wrap">
                        <h2>
                            <span>Owners</span>
                        </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={renderTitle()}
                                data={owners}
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

export default Owners;