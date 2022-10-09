import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import ModalVideo from 'react-modal-video';
import { NotificationManager } from 'react-notifications';
import swal from 'sweetalert';
import moment from 'moment';
import { useSelector } from "react-redux";

import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as tenantAPI from '../../Api/tenants';
import * as printableAPI from '../../Api/printable';

const OpenForm = () => {
    const login = useSelector((state) => state.login);
    const user = login.user
    const propertyID = login.selectedPropertyID;
    const userID = user.id;
        
    const tenantID = parseInt(localStorage.getItem("tenantID")) || 0;
    const formsCreatorID = parseInt(localStorage.getItem("formsCreatorID")) || 0;
    const threeDayNoticeID = parseInt(localStorage.getItem("threeDayNoticeID")) || null;
    const leaseViolationID = parseInt(localStorage.getItem("leaseViolationID")) || null;
    const formPrintName = localStorage.getItem("formPrintName") || '';
        
    const editorRef = useRef(null);
    const [ loading, setLoading ] = useState(true);
    const [ openVideo, setOpenVideo ] = useState(false);
    const [ tenantsMenu, setTenantsMenu ] = useState([]);
    const [ totalOthersOnLease, setTotalOthersOnLease ] = useState(0);
    const [ content, setContent ] = useState("");
    const [ leaseViolationTypes, setLeaseViolationTypes ] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            // Set Tenant Menu Dropdown
            const othersOnLease = await tenantAPI.getOthersOnLease(tenantID);
            const totalAdditionalLeaseHolders = othersOnLease.length;
            let menuItems = [];
            var tenantSign = {
                type: 'menuitem',
				text: 'Primary Tenant Signature',
                onAction: function() {
                    var msg = '&nbsp;<strong>#tenantSignature#</strong>&nbsp;';
                    editorRef.current.insertContent(msg);
                }
			}
			var tenantDate = {
                type: 'menuitem',
				text: 'Primary Tenant Signature Date',
                onAction: function() {
                    var msg = '&nbsp;<strong>#tenantSignatureDate#</strong>&nbsp;';
                    editorRef.current.insertContent(msg);
                }
			}
            menuItems.push(tenantSign);
            menuItems.push(tenantDate);
            for (let i=1; i<=totalAdditionalLeaseHolders; i++){
            	var txtDesc = '';
            	switch ((i+1)) {
            		case 2:
            			txtDesc = (i+1) + 'nd Tenant Signature';
            			break;
            		case 3:
            			txtDesc = (i+1) + 'rd Tenant Signature';
            			break;
            		default:
            			txtDesc = (i+1) + 'th Tenant Signature';
            			break;
            	}
                var objSign = {
                    type: 'menuitem',
                    text: txtDesc,
                    onAction: function() {
                        var msg = '&nbsp;<strong>#leaseHolder' + i + '#</strong>&nbsp;';
                        editorRef.current.insertContent(msg);
                    }
                }
                var objDate = {
                    type: 'menuitem',
                    text: txtDesc + ' Date',
                    onAction: function() {
                        var msg = '&nbsp;<strong>#leaseHolder' + i + 'SignatureDate#</strong>&nbsp;';
                        editorRef.current.insertContent(msg);
                    }
                }
                menuItems.push(objSign);
                menuItems.push(objDate);
            }
            setTenantsMenu(menuItems);
            setTotalOthersOnLease(othersOnLease.length);

            // Load Form
            let formContent = await printableAPI.getForm({
                formsCreatorID,
                propertyID,
                tenantID,
                userID,
                threeDayNoticeID,
                leaseViolationID,
                formName: formPrintName
            });
                
            if(formsCreatorID === 1 || formPrintName === "Tenant_Statement") {
                // load/creator the statement table
                const statements = await tenantAPI.getTenantTransactionsStatement(tenantID);
                const renderNumber = (amt) => {
                    const num = parseFloat(amt);
                    if(num < 0) return `$(${num.toFixed(2)})`
                    return `$${num.toFixed(2)}`
                }
                const tableDataLoading = () => {
                    let tableData = '';
                    let balanceTable = 0;
                    statements.forEach((obj) => {
                        if(parseInt(obj.TransactionTypeID) === 1)       balanceTable += parseFloat(obj.TransactionAmount);
                        else if(parseInt(obj.TransactionTypeID) === 2)  balanceTable -= parseFloat(obj.TransactionAmount);
                        tableData += `<tr>
                            <TD align=center>${moment.utc(obj.TenantTransactionDate).format("MM/DD/YYYY")}</TD>
                            <TD width=50%>${obj.ChargeType} - ${obj.Comment}</TD>
                            <TD align=center>${parseInt(obj.TransactionTypeID) === 1 ? `${renderNumber(obj.TransactionAmount)}` : ''}</TD>
                            <TD align=center>${parseInt(obj.TransactionTypeID) === 2 ? `${renderNumber(obj.TransactionAmount)}` : ''}</TD>
                            <TD align=center>${renderNumber(balanceTable)}</TD>
                        </tr>`
                    });
                    return {tableData, balanceTable};
                }
                let table = `
                <div>
                    <table border=1 Align=center>
                        <thead>
                            <TR>
                                <TD align=center><p class="first"><B>Transaction Date</B></TD>
                                <TD align=center><p class="first"><B>Description</B></TD>
                                <TD align=center><p class="first"><B>Charge</B></TD>
                                <TD align=center><B><p class="first"><B>Credit</b></TD>
                                <TD align=center><p class="first"><B>Balance</B></TD>
                            </TR>
                        </thead>
                        <tbody>
                        ${tableDataLoading().tableData}
                        <cfoutput>
                            <TR>
                                <TD ALIGN=RIGHT COLSPAN=4><B>Total Due:</B></TD><TD align=center><B>${renderNumber(tableDataLoading().balanceTable)}</B></TD>
                            </TR>
                        </CFOUTPUT>
                        </tbody>
                    </table>
                </div>
                `;
                formContent += table;
            }
            setContent(formContent);

            if(parseInt(formsCreatorID) === 3) {
                // saveThreeDayNotice
                await printableAPI.saveThreeDayNotice({
                    tenantID,
                    userID
                });
            }
            // Lease Violation
            if(parseInt(formsCreatorID) === 6) {
                const lvTypes = await printableAPI.getLeaseViolationTypes();
                let arrLvTypes = [];
                for(const lvt of lvTypes) {
                    arrLvTypes.push(
                        {
                            type: 'menuitem',
                            text: lvt.LeaseViolationType,
                            onAction: function() {
                                swal({
                                    text: 'Enter a comment for the violation.',
                                    content: "input",
                                    button: {
                                      text: "Confirm!",
                                      closeModal: true,
                                    },
                                }).then(async (name) => {
                                    if(name === '') {
                                        NotificationManager.warning("Violation comment is required.", "Error!");
                                        return;
                                    }
                                    const res = await printableAPI.addLeaseViolationComment({
                                        leaseViolationTypeID: lvt.LeaseViolationTypeID,
                                        leaseViolationDescription: name,
                                        tenantID,
                                        userID
                                    });
                                    if(res !== 0) {
                                        NotificationManager.error("Error processing your request. Please, contact us.", "Error!");
                                        return;
                                    }
                                    var msg = `<strong>${lvt.LeaseViolationType}</strong><br /><br />${name}`;
                                    let content = editorRef.current.getContent();
                                    content = content.replace(new RegExp('#violation#', 'g'), msg);
                                    editorRef.current.setContent(content);
                                });
                            }
                        }
                    );
                }
                setLeaseViolationTypes(arrLvTypes);
            }
            setLoading(false);
        }
        fetchData();
    }, [tenantID, formsCreatorID, propertyID, formPrintName, userID, threeDayNoticeID, leaseViolationID]);

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Form..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {
            return (
                <>
                <ModalVideo channel='vimeo' autoplay isOpen={openVideo} videoId="319628808" onClose={() => setOpenVideo(false)} />
                <div className="row" style={{paddingRight: '1%', paddingLeft: '1%', paddingTop: '1%'}}>
                    <div className="col-sm-10">
                        <Editor
                            apiKey={Constants.TINYMCEKEY}
                            onInit={(evt, editor) => editorRef.current = editor}
                            initialValue={content}
                            init={{
                                height: 600,
                                menubar: false,
                                branding: false,
                                plugins: [ 'print' ],
                                toolbar1: `print | ${formsCreatorID === 6 ? " leaseViolations | " : ""} sendDocTenant | addAllSignatures`,
                                
                                setup: function (editor) {
                                    if(formsCreatorID === 6) {
                                        editor.ui.registry.addMenuButton('leaseViolations', {
                                            text: 'Violations',
                                            fetch: function (callback) {
                                                callback(leaseViolationTypes);
                                            }
                                        });
                                    }

                                    editor.ui.registry.addButton('sendDocTenant', {
                                        text: 'Send to Tenant',
                                        onAction: async function () {
                                            const data = editor.getContent();
                                            // check if it has the primary tenant signature
                                            if(data.indexOf('#tenantSignature#') === -1){
                                                NotificationManager.error("Form does not have #tenantSignature# custom variable. Please add the tenant signature before sending the form.", "Error!");
                                                return;
                                            }
                                            // check other on lease
                                            for(let i=1; i<=totalOthersOnLease; i++){
                                                if(data.indexOf('#leaseHolder' + i + '#') === -1){
                                                    NotificationManager.error(`Form does not have #leaseHolder${i}# custom variable. Please add the variable for your additional lease holder.`);
                                                    return;
                                                }
                                            }

                                            // sending data
                                            setLoading(true);
                                            const res = await printableAPI.sendDocTenantSignature({
                                                formsCreatorID,
                                                tenantID,
                                                form: data,
                                            });
                                            setLoading(false);
                                            if(res !== 0) {
                                                NotificationManager.error(res, "Error!");
                                            } else {
                                                NotificationManager.success("Form sent to the tenant successfully.", "Success!");
                                            }
                                        }
                                    });

                                    editor.ui.registry.addMenuButton('addAllSignatures', {
                                        text: 'Tenant Signature',
                                        fetch: function (callback) {
                                            callback(tenantsMenu);
                                        }
                                    });
                                }
                            }}
                        />
                    </div>
                    <div className="col-sm-2">
                        <p className="text-danger" style={{paddingTop: '25%'}}>
                            <img src={`${process.env.PUBLIC_URL}/img/videoIcon.png`} alt="Digitally Sign and Edit Leases and Other Forms" 
                                height={30} style={{cursor: 'pointer'}} />
                            <br />
                            Note: If you have more than one lease holder that needs to signs the form, you will need to add a place for them to digitally sign prior to sending the lease to them for signiure. To do so, put your cursor where you would like the additional lease holder to sign, and then choose Lease Holder 2, Lease Holder 3 etc from the Lease Holder Signiture dropdown list. 
                        </p>
                    </div>
                </div>
                </>
            );
        }
    }

    return render();
}

export default OpenForm;