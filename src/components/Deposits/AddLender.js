import React, {useState} from 'react';
import { Button, Form, Label, Input } from 'reactstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as depositsAPI from '../../Api/deposits';
import * as Constants from '../Util/constants';

const AddLender = () => {
    const history = useHistory();
    const login = useSelector((state) => state.login);
    const company = login.company
    const companyID = company.id;

    const [lenderName, setLenderName] = useState("");
    const [saving, setSaving] = useState(false);

    const handleAddLender = async () => {
        if(lenderName === '') {
            NotificationManager.error("Lender Name is required.", "Error");
            return;
        }
        setSaving(true)
        const res = await depositsAPI.addLender({
            lender: lenderName.trim(),
            companyID
        });
        setSaving(false)
        if(res === -1) {
            NotificationManager.error(Constants.DEFAULT_ERROR, "Error");
            return;
        }
        if(res !== 0) {
            NotificationManager.error(res, "Error");
            return;
        }
        NotificationManager.success("Lender Added.", "Success");
    }

    return (
        <>
            <div className="page-title d-flex justify-content-between align-items-center">
                <div className="page-title-wrap">
                    <i className="ti-angle-left" style={{cursor: 'pointer'}} onClick={() => { 
                        history.goBack()
                    }}></i>
                    <h2>
                        <span>Add Lender</span>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 col-md-12 col-xl-12">
                    <RctCollapsibleCard heading="">
                        <Form>
                            <div className="row">
                                <div className="col-sm-6">
                                    <Label for="lenderName" className="mr-sm-10">Lender Name</Label>
                                    <Input type="text" id="lenderName" name="lenderName" value={lenderName}
                                        onChange={(e) => setLenderName(e.target.value)} />
                                </div>
                            </div>
                            <Button type="button" color="primary" style={{marginTop: '10px'}} 
                                onClick={handleAddLender} disabled={saving}>
                                    Add Lender
                            </Button>
                        </Form>
                    </RctCollapsibleCard>
                </div>
            </div>
            <NotificationContainer />
        </>
    );
}

export default AddLender;
