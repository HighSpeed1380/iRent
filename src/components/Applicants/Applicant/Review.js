import React, {useState, useEffect} from 'react';
import { Controller, useForm } from "react-hook-form";
import { Dialog, Slide, AppBar, Toolbar, IconButton } from '@material-ui/core';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationManager } from 'react-notifications';
import CloseIcon from '@material-ui/icons/Close';

import * as Util from '../../Util/util';
import * as Constants from '../../Util/constants';
import * as applicantsAPI from '../../../Api/applicants';

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const Review = (props) => {
    const {name, approveID, backgroundID} = props.reviewData;
    const [approveStatus, setApproveStatus] = useState([]);

    const { handleSubmit, control, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        async function fetchData() {
            setApproveStatus(await applicantsAPI.getReviewData())
            setValue("approve", approveID);
        }
        fetchData();
    }, [approveID, setValue])

    const render = () => {
        return (
            <div style={{marginLeft: '1%', marginTop: '7%', marginRight: '1%'}}>
                <div className="row">
                    <div className="col-sm-5">
                        <Label for="approve" className="mr-sm-10">Approval Status:</Label>
                        <Controller
                            name="approve"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} type="select" id="approve" style={Util.setErrorStyle(errors.email)}>
                                    <option value="0">Select</option>
                                    {approveStatus.map((obj, idx) => {
                                        return <option key={idx} value={obj.ApproveID}>{obj.Approve}</option>
                                    })}
                                </Input>
                            )}
                        />
                        {errors.approve && (
                            <span style={{ color: "red" }} role="alert">required</span>
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <Label for="reason" className="mr-sm-10">Reason</Label>
                        <Controller
                            name="reason"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} type="textarea" id="reason" row={4} />
                            )}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const handleClose = () => props.setReviewTenantID(0);

    const submitForm = async (data) => {
        const res = await applicantsAPI.reviewApplicant({
            backgroundID,
            tenantID: parseInt(props.reviewTenantID),
            comment: data.reason !== undefined ? data.reason : '',
            approve: parseInt(data.approve)
        });
        if(res !== 0) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        props.setUpdated(!props.updated);
        props.setReviewTenantID(0);
    }

    return (
        <Dialog open={props.reviewTenantID !== 0} onClose={handleClose} 
            fullScreen TransitionComponent={Transition}
        >
            <Form onSubmit={handleSubmit(submitForm)}>
                <AppBar className="bg-primary">
                    <Toolbar>
                        <IconButton color="inherit" onClick={handleClose} aria-label="Close">
                            <CloseIcon />
                        </IconButton>
                        <h5 className="w-100 mb-0">Review Tenant - {name}</h5>
                        <Button type="submit" color="inherit">Confirm</Button>
                    </Toolbar>
                </AppBar>
                {render()}
            </Form>
        </Dialog>
    );
}

export default Review;