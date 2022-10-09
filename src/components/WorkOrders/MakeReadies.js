import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import NumberFormat from 'react-number-format';
import DatePicker from "reactstrap-date-picker";
import moment from 'moment';
import { MuiThemeProvider } from '@material-ui/core/styles';
import MatButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Flag from '@material-ui/icons/Flag';
import Print from '@material-ui/icons/Print';
import MailOutline from '@material-ui/icons/MailOutline';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import MUIDataTable from "mui-datatables";
import SweetAlert from 'react-bootstrap-sweetalert';
import Swal from 'sweetalert2';
import * as EmailValidator from 'email-validator';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Util from '../Util/util';
import * as Constants from '../Util/constants';
import * as billsAPI from '../../Api/bills';
import * as depositsAPI from '../../Api/deposits';

const MakeReadies = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
    const multiprop = user.notifications.multiProp;

    const [ loading, setLoading ] = useState(true);
    const [ makeReadies, setMakeReadies ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            
            setLoading(false);
        }
        fetchData();
    }, []);

    const columns = [
        { name: 'unit', label: 'Unit', },
        { name: 'unitType', label: 'Unit Type', },
        { name: 'preleased', label: 'Preleased To', },
        { name: 'trashOut', label: 'Trash Out', },
        { name: 'changingLocks', label: 'Changing Locks', },
        { name: 'edit', label: 'Edit', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton 
                            onClick={() => {
                                const location = {
                                    pathname: '/deposits/edit',
                                    state: { 
                                        depositID: parseInt(value)
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
    ]

    if(loading) {
        return (
            <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Make Readies..."}
            >
                <LinearProgress />
            </RctCollapsibleCard>
        );
    }

    return (
        <Main>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <h2>
                        <span>View Make Readies</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                        <MUIDataTable
                            title={`Units: ${makeReadies.length}`}
                            data={makeReadies}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        </Main>
    )
}

export default MakeReadies;