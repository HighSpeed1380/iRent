import React, { useState, useEffect } from 'react';
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import { Button, Form, Label, Input } from 'reactstrap';
import { FormGroup } from '@material-ui/core';
import NotificationManager from 'react-notifications/lib/NotificationManager';

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const CommentsNotes = (props) => {
    const tenantID = props.tenantID;
    const userID = props.userID;

    const [ loading, setLoading ] = useState(true);
    const [ commentNotes, setCommentNotes ] = useState([]);
    const [ comment, setComment ] = useState('');
    const [ updated, setUpdated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const notes = await tenantAPI.getCommentsNotes(tenantID);
            let arr = [];
            for(const n of notes) {
                arr.push({
                    date: moment(n.SubmitDate).format("MM/DD/YYYY"),
                    note: n.Note,
                    submittedBy: `${n.UserFName} ${n.UserLName}`
                });
            }
            setCommentNotes(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated]);

    const columns = [
        { name: 'date', label: 'Date' },
        { name: 'note', label: 'Note' },
        { name: 'submittedBy', label: 'Submitted By' },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        selectableRows: "none",
    };

    const submitForm = async () => {
        if(comment === '') {
            NotificationManager.error("Comment is required.", "Error");
            return;
        }
        setLoading(true);
        const res = await tenantAPI.addCommentPost({
            userID,
            tenantID,
            note: comment
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please contact us.", "Error");
            return;
        }
        setComment('');
        setUpdated(!updated);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Comments Notes..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <>
                    <div className="row">
                        <div className="col-sm-6 col-md-6 col-xl-6">
                            <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                <MUIDataTable
                                    title={"Comments And Notes"}
                                    data={commentNotes}
                                    columns={columns}
                                    options={options}
                                />
                            </MuiThemeProvider>
                        </div>
                        <div className="col-sm-6 col-md-6 col-xl-6">
                            <RctCollapsibleCard heading="Add Comments/Notes">
                                <Form>
                                    <FormGroup className="mr-10 mb-10">
                                        <Label for="commentNote" className="mr-sm-10">Note/Comment</Label>
                                        <Input type="textarea" rows={5} id="commentNote" name="commentNote"
                                            value={comment} onChange={(e) => setComment(e.target.value)}
                                        />
                                    </FormGroup>
                                    <Button type="button" color="primary" size="sm" className="w-auto" onClick={submitForm}>Add</Button>
                                </Form>
                            </RctCollapsibleCard>
                        </div>
                    </div>
                </>
            )
        }
    }

    return render();
}

export default CommentsNotes;