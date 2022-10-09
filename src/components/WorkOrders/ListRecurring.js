import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import MatButton from '@material-ui/core/Button';
import NotificationManager from 'react-notifications';
import { useHistory } from "react-router-dom";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as workOrdersAPI from '../../Api/workOrders';
import * as Constants from '../Util/constants';

const ListRecurring = (props) => {
    const history = useHistory();
    const { propertyID } = props;

    const [ loading, setLoading ] = useState(true);
    const [ workOrders, setWorkOrders ] = useState([]);
    const [ update, setUpdate ] = useState(false);

    useEffect(() => {
        async function fetchData() {    
            setLoading(true);
            const recurrings = await workOrdersAPI.getRecurring(propertyID);
            let wks = [];
            for(const wk of recurrings) {
                wks.push({
                    startDate: moment(wk.startDate).format("MM/DD/YYYY"),
                    endDate: wk.endDate !== null ? moment(wk.endDate).format("MM/DD/YYYY") : 'Unlimited',
                    frequency: wk.frequencyID,
                    description: wk.description,
                    priority: wk.priorityID,
                    update: wk.id,
                    delete: wk.id
                });
            }
            setWorkOrders(wks);
            setLoading(false);
        }
        fetchData();
    }, [propertyID, update])

    const deleteRecurringWK = async (rwkID) => {
        setLoading(true);
        const res = await workOrdersAPI.inactivateRecurring(rwkID);
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.");
            return;
        }
        setUpdate(!update);
    }

    const columns = [
        { name: 'startDate', label: 'Start Date', },
        { name: 'endDate', label: 'End Date', },
        { name: 'frequency', label: 'Frequency', 
            options: {
                customBodyRender: (value) => {
                    switch(value.toString()) {
                        case "1":
                            return <span>Everyday</span>;
                        case "2":
                            return <span>Once a week</span>;
                        case "3":
                            return <span>Once a month</span>;
                        default:
                            return <span></span>
                    }
                }
            },
        },
        { name: 'description', label: 'Description', },
        { name: 'priority', label: 'Priority', 
            options: {
                customBodyRender: (value) => {
                    switch(value.toString()) {
                        case "1":
                            return <span>High</span>;
                        case "3":
                            return <span>Low</span>;
                        default:
                            return <span></span>
                    }
                }
            },
        },
        { name: 'update', label: 'Update',
            options: {
                customBodyRender: (value) => {
                    console.log(value);
                    return (
                        <MatButton color="primary"
                            onClick={() => {
                                const location = {
                                    pathname: '/workOrders/updateRecurring',
                                    state: { 
                                        id: value
                                    }
                                }
                                history.push(location);
                            }}
                        >
                            Update
                        </MatButton>
                    )
                }
            },
        },
        { name: 'delete', label: 'Delete',
            options: {
                customBodyRender: (value) => {
                    return (
                        <MatButton color="primary"
                            onClick={() => deleteRecurringWK(value)}
                        >
                            Delete
                        </MatButton>
                    )
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: false,
        selectableRows: "none",
        customSearch: (searchQuery, currentRow, columns) => {
            let found = false;
            currentRow.forEach(element => {
                if(element === null)    found = false;
                else if(typeof element === 'object') {
                    if(element.description !== null && element.description.toString().toUpperCase().includes(searchQuery.toUpperCase()))
                        found = true;
                } else if(element.toString().toUpperCase().includes(searchQuery.toUpperCase())){
                    found = true;
                }
            });
            return found;
        }
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Recurring Work Orders..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-xl-12">
                        <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                            <MUIDataTable
                                title={"Recurring Work Orders"}
                                data={workOrders}
                                columns={columns}
                                options={options}
                            />
                        </MuiThemeProvider>
                    </div>
                </div>
            );
        }
    }

    return render();
}

export default ListRecurring;