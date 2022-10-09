import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import MUIDataTable from "mui-datatables";
import { MuiThemeProvider } from '@material-ui/core/styles';
import { NotificationManager } from 'react-notifications';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Button, Form, Label, Input, FormText } from 'reactstrap';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import moment from 'moment';
import DatePicker from "reactstrap-date-picker";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as tenantAPI from '../../Api/tenants';
import * as Constants from '../Util/constants';

const Documents = (props) => {
    const history = useHistory();
    const login = useSelector((state) => state.login);

    const propertyID = login.selectedPropertyID;
    let tenantID = null;
    let tenantName = null;
    if(props.location !== undefined) {
        tenantID = props.location.state ? props.location.state.tenantID : null;
        tenantName = props.location.state ? props.location.state.tenantName : null;
    }
    if(tenantID === null && props.tenantID !== undefined)
        tenantID = props.tenantID;
    if(tenantName === null && props.tenantName !== undefined)
        tenantName = props.tenantName;

    const [ loading, setLoading ] = useState(true);
    const [ documentsType, setDocumentsType ] = useState([]);
    const [ documents, setDocuments ] = useState([]);
    const [ selectedDocType, setSelectedDocType ] = useState(0);
    const [ showRentersInsurance, setShowRentersInsurance ] = useState(false);
    const [ rentersInsurance, setRentersInsurance ] = useState(moment().format("YYYY-MM-DD"));
    const [ updated, setUpdated ] = useState(false);
    const [ delDocID, setDelDocID ] = useState(0);
    const [ openDelete, setOpenDelete ] = useState(false);

    const { handleSubmit, control} = useForm();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            if(tenantID === null || tenantID === undefined) {
                history.push('/tenants/viewAll');
            }
            setDocumentsType(await tenantAPI.getDocumentTypes());
            const docs = await tenantAPI.getEditTenantDocuments(tenantID);
            let arr = [];
            for(const d of docs) {
                arr.push({
                    name: d,
                    docType: d.docType,
                    delete: d.documentID
                });
            }
            setDocuments(arr);
            setLoading(false);
        }
        fetchData();
    }, [tenantID, updated, history]);

    const columns = [
        { name: 'name', label: 'Document Name',
            options: {
                customBodyRender: (value) => {
                    const renderAudit = () => {
                        if(parseInt(value.audited) === 2) {
                            return (
                                <>
                                    <br/>
                                    Lease Audit Rejected - {value.comment}
                                </>
                            );
                        }
                    }
                    return (
                        <>
                            <a href={value.path} target="_blank" rel="noreferrer">{value.docName}</a>
                            {renderAudit()}
                        </>
                    )
                }
            }
        },
        { name: 'docType', label: 'Document Type'},
        { name: 'delete', label: 'Delete', 
            options: {
                customBodyRender: (value) => {
                    return (
                        <IconButton
                            aria-label="Print"
                            onClick={() => {
                                setDelDocID(value)
                                setOpenDelete(true);
                            }}
                        >
                            <DeleteForever />
                        </IconButton>
                    );
                }
            },
        },
    ];

    const options = {
        filterType: 'dropdown',
        pagination: true,
        selectableRows: "none",
    };

    const clearData = () => {
        setSelectedDocType(0);
        setShowRentersInsurance(false);
        setRentersInsurance(moment().format("YYYY-MM-DD"));
        setOpenDelete(false);
        setDelDocID(0);
    }

    const handleChangeDocType = (id) => {
        setSelectedDocType(id)
        if(parseInt(id) === 13) 
            setShowRentersInsurance(true);
        else
            setShowRentersInsurance(false);
    }

    const submitDocument = async (data) => {
        if(data.file.length === 0) {
            NotificationManager.warning("Please, upload a document.", "Warning");
            return;
        }
        if(parseInt(selectedDocType) === 0) {
            NotificationManager.warning("Please, select a document type.", "Warning");
            return;
        }
        let rentersDt = null;
        if(showRentersInsurance) {
            rentersDt = moment(rentersInsurance);
            if(!rentersDt.isValid()) {   
                NotificationManager.warning("Please enter a valid Renters Insurance Expiration Date.", "Warning");
                return;
            }
        }
        setLoading(true);
        const path = `/wwwroot/rent/TenantFiles/${propertyID}/${tenantID}`;
        await tenantAPI.createDirectory({path});
        const res = await tenantAPI.uploadTenantDocument({
            propertyID,
            tenantID,
            docName: data.file[0].name,
            documentTypeID: parseInt(selectedDocType),
            rentersInsuranceExpiration: rentersDt,
            file: data.file[0]
        });
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        clearData();
        NotificationManager.success("Tenant Document Uploaded Successfully!", "Success");
        setUpdated(!updated);
    }

    const deleteDocument = async () => {
        setOpenDelete(false);
        setLoading(true);
        const res = await tenantAPI.deleteDocument({
            tenantID,
            documentID: delDocID
        });
        setDelDocID(0);
        setLoading(false);
        if(res !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            return;
        }
        setUpdated(!updated);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                colClasses="col-xs-12 col-sm-12 col-md-12"
                heading={"Loading Documents..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            const heading = `Add document for ${tenantName}`;
            const renderRentersInsurance = () => {
                if(showRentersInsurance) {
                    return (
                        <div className="col-sm-2">
                            <Label for="rentersInsurance" className="mr-sm-10">Expiration Date</Label>
                            <Controller
                                name="rentersInsurance"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker {...field} id="rentersInsurance" />
                                )}
                            />
                        </div>
                    )
                }
            }
            const renderContent = () => {
                return (
                    <>
                        <SweetAlert
                            warning
                            btnSize="sm"
                            show={openDelete}
                            showCancel
                            confirmBtnText="Yes, delete it!"
                            confirmBtnBsStyle="danger"
                            cancelBtnBsStyle="success"
                            title="Are you sure?"
                            onConfirm={() => deleteDocument()}
                            onCancel={() => setOpenDelete(false)}
                        >
                            You will not be able to recover this document!
                        </SweetAlert>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <RctCollapsibleCard heading={heading}>
                                    <Form onSubmit={handleSubmit(submitDocument)}>
                                        <div className="row">
                                            <div className="col-sm-3">
                                                <Label for="docType" className="mr-sm-10">Document Type</Label>
                                                <Controller
                                                    name="docType"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} type="select" id="docType" onChange={(e) => handleChangeDocType(e.target.value)}>
                                                            <option value="0">Select</option>
                                                            {documentsType.map((obj) => {
                                                                return (
                                                                    <option 
                                                                        key={obj.DocumentTypeID} 
                                                                        value={obj.DocumentTypeID}
                                                                    >
                                                                        {obj.DocumentType}
                                                                    </option>
                                                                );
                                                            })}
                                                        </Input>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-sm-7">
                                                <Label for="File">File</Label>
                                                <Controller
                                                    name="file"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} type="file" id="File" 
                                                            accept=".pdf,.txt,.doc,.jpg,.png,.jpeg,.docx"
                                                        />
                                                    )}
                                                />
                                                <FormText color="muted">
                                                    Acceptable file types: PDF, TXT, DOC, JPG, and PNG
                                                </FormText>
                                            </div>
                                            {renderRentersInsurance()}
                                        </div>
                                        <Button type="submit" color="primary" style={{marginTop: '20px'}}>Add</Button>
                                    </Form>
                                </RctCollapsibleCard>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <MuiThemeProvider theme={Constants.getMuiTheme()}>                                                    
                                    <MUIDataTable
                                        title={`Documents of ${tenantName}`}
                                        data={documents}
                                        columns={columns}
                                        options={options}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </>
                )
            }
            if(props.location !== undefined)
                return <Main>{renderContent()}</Main>;
            return renderContent();
        }
    }

    return render();
}

export default Documents;