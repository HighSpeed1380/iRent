import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Form, Label, Input, Alert, Button } from 'reactstrap';
import DatePicker from "reactstrap-date-picker";
import { Switch, FormControlLabel, FormGroup } from '@material-ui/core';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import moment from 'moment';
import { useSelector } from "react-redux";

import Main from '../Main';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as Util from '../Util/util';
import LinearProgress from '../Util/LinearProgress';
import * as Constants from '../Util/constants';
import * as propertyAPI from '../../Api/property';
import * as checkAPI from '../../Api/check';
import * as companyAPI from '../../Api/company';


const PropertyRules = (props) => {
    const login = useSelector((state) => state.login);

    const company = login.company;
    const companyID = company.id;
    const propertyID = login.selectedPropertyID;

    const initialHasUtilities = Constants.Utilities.map((utility, index) => {
        return {
            id: index,
            name: utility,
            value: false
        }
    });
    
    const officeHoursValues = Constants.workHours;

    const [loading, setLoading] = useState(true);
    
    const [ closeOutDate, setCloseOutDate ] = useState(moment().format('YYYY-MM-DD'));
    
    const [ property, setProperty ] = useState({
        LateFee: 0,
        DailyLateFee: 0,
        LateFeeApplied: 0,
        MaxLateFee: 0,
        MinBalance: 0,
        Threshold: 0,

        Gas: 0,
        Electricity: 0,
        Water: 0,
        Trash: 0,
        TV: 0,
        Internet: 0,

        BankFee: 0,
        SecurityDeposit: 0,
        NRSecurityDeposit: 0,
        EvictionFee: 0,
        PetFine: 0,
        DailyPetFine: 0,
        ApplicationFee: 0,
        MonthToMonthFee: 0,

        EvictionThreshold: 0,
        SMSThreshold: 0,
        LaborRate: 0,
        ThreeDayNoticeTAmount: 0,

        PropertyWebsite: '',
        PropertyLongDescription: '',
        RentalCriteria: '',

        AllowTenantsPayLessThanAmountDue: 0,
        CloseOut: '',
        ProfitLossReport: 0,

        AlertUpcomingLeaseExpiration: 0, 
        AbsorbApplicationFee: 0, 
        NotifyWorkOrderChanges: 0, 
        notifyWorkOrderChangesPM: 0, 
        RequireRenterInsurance: 0, 
        ApplicantsDepositsPage: 0, 
        AlertPMDocSent: 0, 
        DisplayTenantConsent: 0, 
        OfficeProperty: 0, 
        receivePromissToPayNotification: 0,
        LateFeesPercentage: 0,
        Seattle: 0,
    });

    const [ recurringTaxes, setRecurringTaxes ] = useState({
        RecurringChargesTaxID: -1,
        RentPercentage: 0,
        HousePercentage: 0,
        PetPercentage: 0,
        TVPercentage: 0,
        UtilityPercentage: 0,
        ParkingPercentage: 0,
        StoragePercentage: 0,
        SecurityPercentage: 0,
        LateFee: 0,
        NSFFee: 0
    });

    const [ hasUtilities, setHasUtilities ] = useState(initialHasUtilities);

    const [ officeHours, setOfficeHours ] = useState({
        PropertyOfficeHoursID: -1,
        MondayFridayOpenTime: -1,
        MondayFridayCloseTime: -1,
        SaturdayOpenTime: -1,
        SaturdayCloseTime: -1,
        SundayOpenTime: -1,
        SundayCloseTime: -1
    });

    const [ checks, setChecks ] = useState([]);
    const [ autoBill, setAutoBill ] = useState({
        AutoBill: 1,
        AutoBillNotify: 1
    });

    const [ leadSource, setLeadSource ] = useState({});

    const [ chkTenantsPayLessThanAmountDue, setChkTenantsPayLessThanAmountDue ] = useState(false);
    const [ chkAlertUpcomingLeaseExpiration, setChkAlertUpcomingLeaseExpiration] = useState(false);
    const [ chkAbsorbApplicationFee, setChkAbsorbApplicationFee ] = useState(false);
    const [ chkNotifyWorkOrderChanges, setChkNotifyWorkOrderChanges ] = useState(false);
    const [ chkNotifyWorkOrderChangesPM, setChkNotifyWorkOrderChangesPM ] = useState(false);
    const [ chkRequireRenterInsurance, setChkRequireRenterInsurance ] = useState(false);
    const [ chkApplicantsDepositsPage, setChkApplicantsDepositsPage ] = useState(false);
    const [ chkAlertPMDocSent, setChkAlertPMDocSent ] = useState(false);
    const [ chkDisplayTenantConsent, setChkDisplayTenantConsent ] = useState(false);
    
    const [ chkCloseOutDate, setChkCloseOutDate ] = useState(false);
    const [ chkProfitLossReport, setChkProfitLossReport ] = useState(false);
    

    const { 
        handleSubmit: handleSubmitRules, 
        control: controlRules, 
        formState: { errors: errorsRules } 
    } = useForm();


    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            
            const propertyData = await propertyAPI.getProperty(propertyID);
            if (propertyData !== null) {
                console.log("propertyData :", propertyData);
                setProperty({
                    LateFee: propertyData.LateFee,
                    DailyLateFee: propertyData.DailyLateFee,
                    LateFeeApplied: propertyData.LateFeeApplied,
                    MaxLateFee: propertyData.MaxLateFee,
                    MinBalance: propertyData.MinBalance,
                    Threshold: propertyData.Threshold,

                    Gas: propertyData.Gas,
                    Electricity: propertyData.Electricity,
                    Water: propertyData.Water,
                    Trash: propertyData.Trash,
                    TV: propertyData.TV,
                    Internet: propertyData.Internet,

                    BankFee: propertyData.BankFee,
                    SecurityDeposit: propertyData.SecurityDeposit,
                    NRSecurityDeposit: propertyData.NRSecurityDeposit,
                    EvictionFee: propertyData.EvictionFee,
                    PetFine: propertyData.PetFine,
                    DailyPetFine: propertyData.DailyPetFine,
                    ApplicationFee: propertyData.ApplicationFee,
                    MonthToMonthFee: propertyData.MonthToMonthFee,

                    EvictionThreshold: propertyData.EvictionThreshold,
                    SMSThreshold: propertyData.SMSThreshold,
                    LaborRate: propertyData.LaborRate,
                    ThreeDayNoticeTAmount: propertyData.ThreeDayNoticeTAmount,

                    PropertyWebsite: propertyData.PropertyWebsite,
                    PropertyLongDescription: propertyData.PropertyLongDescription,
                    RentalCriteria: propertyData.RentalCriteria,

                    AllowTenantsPayLessThanAmountDue: propertyData.AllowTenantsPayLessThanAmountDue,
                    CloseOut: propertyData.CloseOut,
                    ProfitLossReport: propertyData.ProfitLossReport,
            
                    AlertUpcomingLeaseExpiration: propertyData.AlertUpcomingLeaseExpiration, 
                    AbsorbApplicationFee: propertyData.AbsorbApplicationFee, 
                    NotifyWorkOrderChanges: propertyData.NotifyWorkOrderChanges, 
                    RequireRenterInsurance: propertyData.RequireRenterInsurance, 
                    OfficeProperty: propertyData.OfficeProperty, 
                    ApplicantsDepositsPage: propertyData.ApplicantsDepositsPage, 
                    LateFeesPercentage: propertyData.LateFeesPercentage, 
                    AlertPMDocSent: propertyData.AlertPMDocSent, 
                    DisplayTenantConsent: propertyData.DisplayTenantConsent, 
                    notifyWorkOrderChangesPM: propertyData.notifyWorkOrderChangesPM, 
                    receivePromissToPayNotification: propertyData.receivePromissToPayNotification,
                    Seattle: propertyData.Seattle
                });
                setHasUtilities([
                    { id: 0, name: "Gas", value: propertyData.Gas === 1 },
                    { id: 1, name: "Electricity", value: propertyData.Electricity === 1 },
                    { id: 2, name: "Water", value: propertyData.Water === 1 },
                    { id: 3, name: "Trash", value: propertyData.Trash === 1 },
                    { id: 4, name: "TV", value: propertyData.TV === 1 },
                    { id: 5, name: "Internet", value: propertyData.Internet === 1 }
                ]);
                setCloseOutDate(propertyData.CloseOut);
            }

            const recurringTaxesData = await propertyAPI.getRecurringTaxes(propertyID);
            if (recurringTaxesData !== null) {
                // console.log("recurringTaxesData :", recurringTaxesData);
                setRecurringTaxes({
                    RecurringChargesTaxID: recurringTaxesData.RecurringChargesTaxID,
                    RentPercentage: recurringTaxesData.RentPercentage === '' ? 0 : recurringTaxesData.RentPercentage,
                    HousePercentage: recurringTaxesData.HousePercentage === '' ? 0 : recurringTaxesData.HousePercentage,
                    PetPercentage: recurringTaxesData.PetPercentage === '' ? 0 : recurringTaxesData.PetPercentage,
                    TVPercentage: recurringTaxesData.TVPercentage === '' ? 0 : recurringTaxesData.TVPercentage,
                    UtilityPercentage: recurringTaxesData.UtilityPercentage === '' ? 0 : recurringTaxesData.UtilityPercentage,
                    ParkingPercentage: recurringTaxesData.ParkingPercentage === '' ? 0 : recurringTaxesData.ParkingPercentage,
                    StoragePercentage: recurringTaxesData.StoragePercentage === '' ? 0 : recurringTaxesData.StoragePercentage,
                    SecurityPercentage: recurringTaxesData.SecurityPercentage === '' ? 0 : recurringTaxesData.SecurityPercentage,
                    LateFee: recurringTaxesData.LateFee === '' ? 0 : recurringTaxesData.LateFee,
                    NSFFee: recurringTaxesData.NSFFee === '' ? 0 : recurringTaxesData.NSFFee
                });
            }

            const officeHoursData = await propertyAPI.getOfficeHours(propertyID);
            if (officeHoursData !== null) {
                // console.log("officeHoursData :", officeHoursData);
                setOfficeHours({
                    PropertyOfficeHoursID: officeHoursData.PropertyOfficeHoursID,
                    MondayFridayOpenTime: officeHoursData.MondayFridayOpenTime,
                    MondayFridayCloseTime: officeHoursData.MondayFridayCloseTime,
                    SaturdayOpenTime: officeHoursData.SaturdayOpenTime,
                    SaturdayCloseTime: officeHoursData.SaturdayCloseTime,
                    SundayOpenTime: officeHoursData.SundayOpenTime,
                    SundayCloseTime: officeHoursData.SundayCloseTime
                });
            }

            const checksData = await checkAPI.getChecks();
            if (checksData !== null) {
                // console.log("checksData :", checksData);
                setChecks(checksData);
            }

            const autoBillData = await propertyAPI.getAutoBill(propertyID);
            if (autoBillData !== null) {
                // console.log("autoBillData :", autoBillData);
                setAutoBill({
                    AutoBill: autoBillData.AutoBill,
                    AutoBillNotify: autoBillData.AutoBillNotify
                });
            }

            const tenantPaymentAmountDueYesAllPropertiesData = await propertyAPI.getTenantPaymentAmountDueYesAllProperties(companyID);
            const tenantPaymentAmountDueNoAllPropertiesData = await propertyAPI.getTenantPaymentAmountDueNoAllProperties(companyID);
            setChkTenantsPayLessThanAmountDue(
                (propertyData.AllowTenantsPayLessThanAmountDue === 1 && tenantPaymentAmountDueYesAllPropertiesData === null) ||
                (propertyData.AllowTenantsPayLessThanAmountDue === 0 && tenantPaymentAmountDueNoAllPropertiesData === null)
            );

            const alertAlertUpcomingLeaseExpirationPropertiesData = await propertyAPI.getAlertUpcomingLeaseExpirationAllProperties(companyID);
            setChkAlertUpcomingLeaseExpiration(alertAlertUpcomingLeaseExpirationPropertiesData === null);

            const absorbApplicationFeeData = await propertyAPI.getAbsorbApplicationFee(companyID);
            setChkAbsorbApplicationFee(absorbApplicationFeeData === null);

            const notifyWorkOrderChangesData = await propertyAPI.getNotifyWorkOrderChanges(companyID);
            setChkNotifyWorkOrderChanges(notifyWorkOrderChangesData === null);
            const notifyWorkOrderChangesPMData = await propertyAPI.getNotifyWorkOrderChangesPM(companyID);
            setChkNotifyWorkOrderChangesPM(notifyWorkOrderChangesPMData === null);

            const requireInsuranceYesData = await propertyAPI.getRequireInsuranceYes(companyID);
            const requireInsuranceNoData = await propertyAPI.getRequireInsuranceNo(companyID);
            setChkRequireRenterInsurance(
                (propertyData.RequireRenterInsurance === 1 && requireInsuranceYesData === null) ||
                (propertyData.RequireRenterInsurance === 0 && requireInsuranceNoData === null)
            );

            const applicantsDepositPageYesData = await propertyAPI.getApplicantsDepositPageYes(companyID);
            const applicantsDepositPageNoData = await propertyAPI.getApplicantsDepositPageNo(companyID);
            setChkApplicantsDepositsPage(
                (propertyData.ApplicantsDepositsPage === 1 && applicantsDepositPageYesData === null) ||
                (propertyData.ApplicantsDepositsPage === 0 && applicantsDepositPageNoData === null)
            );

            const alertPMDocSentYesData = await propertyAPI.getAlertPMDocSentYes(companyID);
            const alertPMDocSentNoData = await propertyAPI.getAlertPMDocSentNo(companyID);
            setChkAlertPMDocSent(
                (propertyData.AlertPMDocSent === 1 && alertPMDocSentYesData === null) ||
                (propertyData.AlertPMDocSent === 0 && alertPMDocSentNoData === null)
            );

            const tenantConsentYesData = await propertyAPI.getTenantConsentYes(companyID);
            const tenantConsentNoData = await propertyAPI.getTenantConsentNo(companyID);
            setChkDisplayTenantConsent(
                (propertyData.DisplayTenantConsent === 1 && tenantConsentYesData === null) ||
                (propertyData.DisplayTenantConsent === 0 && tenantConsentNoData === null)
            );

            const leadSourceData = await companyAPI.getLeadSource(companyID);
            if (leadSourceData !== null) {
                console.log("leadSourceData :", leadSourceData);
                setLeadSource(leadSourceData);
            }

            const closeOutAllPropData = await propertyAPI.getCloseOutAllProp(companyID);
            setChkCloseOutDate(closeOutAllPropData === null);

            const profitLossReportData = await propertyAPI.getProfitLossReport(companyID);
            setChkProfitLossReport(profitLossReportData === null);

            setLoading(false);
        }

        fetchData();
    }, [propertyID, companyID])


    const handleChangeHasUtilities = (utilityId) => {
        const new_hasUtilities = hasUtilities.map(utility => {
            if (utility.id === utilityId) {
                utility.value = !utility.value;
            }
            return utility;
        });
        setHasUtilities(new_hasUtilities);
    }

    const submitRules = async (data) => {
        setLoading(true);
        
        // update OfficeHours
        let officeHoursData = await propertyAPI.getPropertyOfficeHours(propertyID);

        let result = null;
        if (officeHoursData !== null && officeHoursData.length > 0) {
            result = await propertyAPI.updatePropertyOfficeHours({
                PropertyOfficeHoursID: officeHours.PropertyOfficeHoursID,
                MondayFridayOpenTime: data.mondayToFridayOpenTime,
                MondayFridayCloseTime: data.mondayToFridayCloseTime,
                SaturdayOpenTime: data.saturdayOpenTime,
                SaturdayCloseTime: data.saturdayCloseTime,
                SundayOpenTime: data.sundayOpenTime,
                SundayCloseTime: data.sundayCloseTime
            });
            if (result !== 0) {
                NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                setLoading(false);
                return;
            }
        } else {
            result = await propertyAPI.insertPropertyOfficeHours(propertyID, {
                MondayFridayOpenTime: data.mondayToFridayOpenTime,
                MondayFridayCloseTime: data.mondayToFridayCloseTime,
                SaturdayOpenTime: data.saturdayOpenTime,
                SaturdayCloseTime: data.saturdayCloseTime,
                SundayOpenTime: data.sundayOpenTime,
                SundayCloseTime: data.sundayCloseTime
            });
            if (result !== 0) {
                NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                setLoading(false);
                return;
            } else {
                officeHoursData = await propertyAPI.getPropertyOfficeHours(propertyID);
                if (officeHoursData === null || officeHoursData.length === 0) {
                    NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                    setLoading(false);
                    return;
                };
            }
        }

        setOfficeHours({
            PropertyOfficeHoursID: officeHoursData.PropertyOfficeHoursID,
            MondayFridayOpenTime: data.mondayToFridayOpenTime,
            MondayFridayCloseTime: data.mondayToFridayCloseTime,
            SaturdayOpenTime: data.saturdayOpenTime,
            SaturdayCloseTime: data.saturdayCloseTime,
            SundayOpenTime: data.sundayOpenTime,
            SundayCloseTime: data.sundayCloseTime
        });

        // update recurring charges taxes
        let recurringTaxesData = await propertyAPI.getRecurringTaxes(propertyID);
        if (officeHoursData !== null && officeHoursData.length > 0) {
            result = await propertyAPI.updateRecurringChargesTax({
                RecurringChargesTaxID: recurringTaxesData.RecurringChargesTaxID,
                RentPercentage: data.rentPercentage,
                HousePercentage: data.housePercentage,
                PetPercentage: data.petPercentage,
                TVPercentage: data.tvPercentage,
                UtilityPercentage: data.utilityPercentage,
                ParkingPercentage: data.parkingPercentage,
                StoragePercentage: data.storagePercentage,
                SecurityPercentage: data.securityPercentage,
                LateFee: data.lateFee,
                NSFFee: data.nsfFee,
            });
            if (result !== 0) {
                NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                setLoading(false);
                return;
            }
        } else {
            result = await propertyAPI.insertRecurringChargesTax(propertyID, {
                RentPercentage: data.rentPercentage,
                HousePercentage: data.housePercentage,
                PetPercentage: data.petPercentage,
                TVPercentage: data.tvPercentage,
                UtilityPercentage: data.utilityPercentage,
                ParkingPercentage: data.parkingPercentage,
                StoragePercentage: data.storagePercentage,
                SecurityPercentage: data.securityPercentage,
                LateFee: data.lateFee,
                NSFFee: data.nsfFee
            });
            if (result !== 0) {
                NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                setLoading(false);
                return;
            } else {
                recurringTaxesData = await propertyAPI.getRecurringTaxes(propertyID);
                if (recurringTaxesData === null || recurringTaxesData.length === 0) {
                    NotificationManager.error("Error processing your request. Please, contact us.", "Error");
                    setLoading(false);
                    return;
                };
            }
        }

        setRecurringTaxes({
            RecurringChargesTaxID: recurringTaxesData.RecurringChargesTaxID,
            RentPercentage: data.rentPercentage,
            HousePercentage: data.housePercentage,
            PetPercentage: data.petPercentage,
            TVPercentage: data.tvPercentage,
            UtilityPercentage: data.utilityPercentage,
            ParkingPercentage: data.parkingPercentage,
            StoragePercentage: data.storagePercentage,
            SecurityPercentage: data.securityPercentage,
            LateFee: data.lateFee,
            NSFFee: data.nsfFee,
        });

        // update property
        const updated_property = {
            LateFee: data.initialLateFee,
            DailyLateFee: data.dailyLateFee,
            LateFeeApplied: data.lateFeeApplied,
            MaxLateFee: data.maxLateFee,
            MinBalance: data.minBalance,
            Threshold: data.threshold,

            BankFee: data.bankFee,
            SecurityDeposit: data.securityDeposit,
            NRSecurityDeposit: data.nRSecurityDeposit,
            EvictionFee: data.evictionFee,
            PetFine: data.petFine,
            DailyPetFine: data.dailyPetFine,
            ApplicationFee: data.ppplicationFee,
            MonthToMonthFee: data.monthToMonthFee,

            Gas: hasUtilities[0].value ? 1 : 0,
            Electric: hasUtilities[1].value ? 1 : 0,
            Water: hasUtilities[2].value ? 1 : 0,
            Trash: hasUtilities[3].value ? 1 : 0,
            TV: hasUtilities[4].value ? 1 : 0,
            Internet: hasUtilities[5].value ? 1 : 0,

            EvictionThreshold: data.evictionThreshold,
            SMSThreshold: data.smsThreshold,
            LaborRate: data.laborRate,
            ThreeDayNoticeTAmount: data.threeDayNoticeTAmount,

            PropertyOfficeHoursID: recurringTaxesData.RecurringChargesTaxID,
            PropertyWebsite: data.propertyWebsite,
            PropertyLongDescription: data.propertyLongDescription,
            RentalCriteria: data.rentalCriteria,
            CheckID: data.checkID,
        };
        setProperty({
            ...property,
            updated_property
        });

        result = await propertyAPI.updateProperty(propertyID, updated_property);
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
            setLoading(false);
            return;
        }

        NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");

        setLoading(false);
    }

    const handleChangeAutoBill = async () => {
        setLoading(true);

        const new_value = autoBill.AutoBill === 1 ? 0 : 1;
        setAutoBill({
            ...autoBill,
            AutoBill: new_value
        });

        let result = -1;
        const autoBillData = await propertyAPI.getAutoBill(propertyID);
        if (autoBillData !== null && autoBillData.length > 0) {
            result = await propertyAPI.updateAutoBill(propertyID, {AutoBill: new_value});
        } else {
            result = await propertyAPI.insertAutoBill(propertyID, {AutoBill: new_value});
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }

        setLoading(false);
    }

    const handleChangeAutoBillNotify = async () => {
        setLoading(true);

        const new_value = autoBill.AutoBillNotify === 1 ? 0 : 1;
        setAutoBill({
            ...autoBill,
            AutoBillNotify: new_value
        });

        let result = -1;
        const autoBillData = await propertyAPI.getAutoBill(propertyID);
        if (autoBillData !== null && autoBillData.length > 0) {
            result = await propertyAPI.updateAutoBillNotify(propertyID, {AutoBillNotify: new_value});
        } else {
            result = await propertyAPI.insertAutoBillNotify(propertyID, {AutoBillNotify: new_value});
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }

        setLoading(false);
    }

    const submitTenantsPayLessThanAmountDue = async () => {
        let result = -1;

        setLoading(true);
        if (chkTenantsPayLessThanAmountDue) {
            result = await propertyAPI.updateTenantPayLessThanAmountDueAllProperties(companyID, {
                AllowTenantsPayLessThanAmountDue: property.AllowTenantsPayLessThanAmountDue
            });
        } else {
            result = await propertyAPI.updatePropertyTenantPayLessThanAmountDue(propertyID, {
                AllowTenantsPayLessThanAmountDue: property.AllowTenantsPayLessThanAmountDue
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitAlertUpcomingLeaseExpiration = async () => {
        let result = -1;

        setLoading(true);
        if (chkAlertUpcomingLeaseExpiration) {
            result = await propertyAPI.updateAlertUpcomingLeaseExpirationAllProperties(companyID, {
                AlertUpcomingLeaseExpiration: property.AlertUpcomingLeaseExpiration
            });
        } else {
            result = await propertyAPI.updatePropertyAlertUpcomingLeaseExpiration(propertyID, {
                AlertUpcomingLeaseExpiration: property.AlertUpcomingLeaseExpiration
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitAbsorbApplicationFee = async () => {
        let result = -1;

        setLoading(true);
        if (chkAbsorbApplicationFee) {
            result = await propertyAPI.updateAbsorbApplicationFeeAllProperties(companyID, {
                AbsorbApplicationFee: property.AbsorbApplicationFee
            });
        } else {
            result = await propertyAPI.updatePropertyAbsorbApplicationFee(propertyID, {
                AbsorbApplicationFee: property.AbsorbApplicationFee
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitNotifyWorkOrderChanges = async () => {
        let result = -1;

        setLoading(true);
        if (chkNotifyWorkOrderChanges) {
            result = await propertyAPI.updateNotifyWorkOrderChangesAllProperties(companyID, {
                NotifyWorkOrderChanges: property.NotifyWorkOrderChanges
            });
        } else {
            result = await propertyAPI.updatePropertyNotifyWorkOrderChanges(propertyID, {
                NotifyWorkOrderChanges: property.NotifyWorkOrderChanges
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitNotifyWorkOrderChangesPM = async () => {
        let result = -1;

        setLoading(true);
        if (chkNotifyWorkOrderChangesPM) {
            result = await propertyAPI.updateNotifyWorkOrderChangesPMAllProperties(companyID, {
                notifyWorkOrderChangesPM: property.notifyWorkOrderChangesPM
            });
        } else {
            result = await propertyAPI.updatePropertyNotifyWorkOrderChangesPM(propertyID, {
                notifyWorkOrderChangesPM: property.notifyWorkOrderChangesPM
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitRequireRenterInsurance = async () => {
        let result = -1;

        setLoading(true);
        if (chkRequireRenterInsurance) {
            result = await propertyAPI.updateRequireRenterInsuranceAllProperties(companyID, {
                RequireRenterInsurance: property.RequireRenterInsurance
            });
        } else {
            result = await propertyAPI.updatePropertyRequireRenterInsurance(propertyID, {
                RequireRenterInsurance: property.RequireRenterInsurance
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitApplicantsDepositsPage = async () => {
        let result = -1;

        setLoading(true);
        if (chkApplicantsDepositsPage) {
            result = await propertyAPI.updateApplicantsDepositsPageAllProperties(companyID, {
                ApplicantsDepositsPage: property.ApplicantsDepositsPage
            });
        } else {
            result = await propertyAPI.updatePropertyApplicantsDepositsPage(propertyID, {
                ApplicantsDepositsPage: property.ApplicantsDepositsPage
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitAlertPMDocSent = async () => {
        let result = -1;

        setLoading(true);
        if (chkAlertPMDocSent) {
            result = await propertyAPI.updateAlertPMDocSentAllProperties(companyID, {
                AlertPMDocSent: property.AlertPMDocSent
            });
        } else {
            result = await propertyAPI.updatePropertyAlertPMDocSent(propertyID, {
                AlertPMDocSent: property.AlertPMDocSent
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitDisplayTenantConsent = async () => {
        let result = -1;

        setLoading(true);
        if (chkDisplayTenantConsent) {
            result = await propertyAPI.updateDisplayTenantConsentAllProperties(companyID, {
                DisplayTenantConsent: property.DisplayTenantConsent
            });
        } else {
            result = await propertyAPI.updatePropertyDisplayTenantConsent(propertyID, {
                DisplayTenantConsent: property.DisplayTenantConsent
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitOfficeProperty = async () => {
        let result = -1;

        setLoading(true);
        result = await propertyAPI.updatePropertyOfficeProperty(propertyID, {
            OfficeProperty: property.OfficeProperty
        });
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitReceivePromiss = async () => {
        let result = -1;

        setLoading(true);
        result = await propertyAPI.updatePropertyReceivePromiss(propertyID, {
            receivePromissToPayNotification: property.receivePromissToPayNotification
        });
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitLateFeesPercentage = async () => {
        let result = -1;

        setLoading(true);
        result = await propertyAPI.updatePropertyLateFeesPercentage(propertyID, {
            LateFeesPercentage: property.LateFeesPercentage
        });
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitSeattle = async () => {
        let result = -1;

        setLoading(true);
        result = await property.updatePropertySeattle(propertyID, {
            Seattle: property.Seattle
        });
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitCloseOutUpdate = async () => {
        let result = -1;

        setLoading(true);
        if (chkCloseOutDate) {
            result = await propertyAPI.updateCloseOutAllProperties(companyID, {
                CloseOut: property.CloseOut
            });
        } else {
            result = await propertyAPI.updatePropertyCloseOut(propertyID, {
                CloseOut: property.CloseOut
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitCloseOutCancel = async () => {
        let result = -1;

        setLoading(true);
        if (chkCloseOutDate) {
            result = await propertyAPI.updateCloseOutCancelAllProperties(companyID);
        } else {
            result = await propertyAPI.updatePropertyCloseOutCancel(propertyID);
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const submitProfitLossReport = async () => {
        let result = -1;

        setLoading(true);
        if (chkProfitLossReport) {
            result = await propertyAPI.updateProfitLossReportAllProperties(companyID, {
                ProfitLossReport: property.ProfitLossReport
            });
        } else {
            result = await propertyAPI.updatePropertyProfitLossReport(propertyID, {
                ProfitLossReport: property.ProfitLossReport
            });
        }
        if (result !== 0) {
            NotificationManager.error("Error processing your request. Please, contact us.", "Error");
        } else {
            NotificationManager.success("Property Rules Changes Updated Successfully!", "Success");
        }
        setLoading(false);
    }

    const render = () => {
        if(loading) {
            return (
                <RctCollapsibleCard
                    colClasses="col-xs-12 col-sm-12 col-md-12"
                    heading={"Loading Property Rules..."}
                >
                    <LinearProgress />
                </RctCollapsibleCard>
            );
        } else {

            return (
                <Main>
                    <div className="formelements-wrapper" style={Constants.margins}>
                        <div className="page-title d-flex justify-content-between align-items-center">
                            <div className="page-title-wrap">
                                <h2>
                                    <span>Property Rules</span>
                                </h2>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <RctCollapsibleCard>
                                    <Form onSubmit={handleSubmitRules(submitRules)}>
                                        
                                        {/* LATE FEES */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>LATE FEES</Alert>
                                                <div className="row">
                                                    <div className="col-sm-2">
                                                        <Label for="initialLateFee" className="mr-sm-10">Initial Late Fee</Label>
                                                        <Controller
                                                            name="initialLateFee"
                                                            control={controlRules}
                                                            defaultValue={property.LateFee}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="initialLateFee" min={0} max={100} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.initialLateFee)} />
                                                            )}
                                                        />
                                                        {errorsRules.initialLateFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="dailyLateFee" className="mr-sm-10">Daily Late Fee</Label>
                                                        <Controller
                                                            name="dailyLateFee"
                                                            control={controlRules}
                                                            defaultValue={property.DailyLateFee}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="dailyLateFee" min={0} max={100} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.dailyLateFee)} />
                                                            )}
                                                        />
                                                        {errorsRules.dailyLateFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="lateFeeApplied" className="mr-sm-10">Apply On Day</Label>
                                                        <Controller
                                                            name="lateFeeApplied"
                                                            control={controlRules}
                                                            defaultValue={property.LateFeeApplied}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="lateFeeApplied" min={0} size={5} style={Util.setErrorStyle(errorsRules.lateFeeApplied)} />
                                                            )}
                                                        />
                                                        {errorsRules.lateFeeApplied && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="maxLateFee" className="mr-sm-10">Max Late Fee</Label>
                                                        <Controller
                                                            name="maxLateFee"
                                                            control={controlRules}
                                                            defaultValue={property.MaxLateFee}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="maxLateFee" min={0} step={0.01} size={5} precision={2} style={Util.setErrorStyle(errorsRules.maxLateFee)} />
                                                            )}
                                                        />
                                                        {errorsRules.maxLateFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="minBalance" className="mr-sm-10">Apply if Bal GT $X</Label>
                                                        <Controller
                                                            name="minBalance"
                                                            control={controlRules}
                                                            defaultValue={property.MinBalance}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="minBalance" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.minBalance)} />
                                                            )}
                                                        />
                                                        {errorsRules.minBalance && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="threshold" className="mr-sm-10">Flag if Bal GT $X</Label>
                                                        <Controller
                                                            name="threshold"
                                                            control={controlRules}
                                                            defaultValue={property.Threshold}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="Threshold" min={0} size={5} style={Util.setErrorStyle(errorsRules.threshold)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.threshold && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                       
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* OTHER FEES */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>OTHER FEES</Alert>
                                                <div className="row">
                                                    <div className="col-sm-2">
                                                        <Label for="bankFee" className="mr-sm-10">NSF</Label>
                                                        <Controller
                                                            name="bankFee"
                                                            control={controlRules}
                                                            defaultValue={property.BankFee}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="bankFee" min={0} size={5} style={Util.setErrorStyle(errorsRules.bankFee)} />
                                                            )}
                                                        />
                                                        {errorsRules.bankFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="securityDeposit" className="mr-sm-10">Refundable Security Dep</Label>
                                                        <Controller
                                                            name="securityDeposit"
                                                            control={controlRules}
                                                            defaultValue={property.SecurityDeposit}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="securityDeposit" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.securityDeposit)} />
                                                            )}
                                                        />
                                                        {errorsRules.securityDeposit && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="nRSecurityDeposit" className="mr-sm-10">Non Refundable Security Dep</Label>
                                                        <Controller
                                                            name="nRSecurityDeposit"
                                                            control={controlRules}
                                                            defaultValue={property.NRSecurityDeposit}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="nRSecurityDeposit" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.nRSecurityDeposit)} />
                                                            )}
                                                        />
                                                        {errorsRules.nRSecurityDeposit && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="evictionFee" className="mr-sm-10">Eviction Fee</Label>
                                                        <Controller
                                                            name="evictionFee"
                                                            control={controlRules}
                                                            defaultValue={property.EvictionFee}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="evictionFee" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.evictionFee)} />
                                                            )}
                                                        />
                                                        {errorsRules.evictionFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="petFine" className="mr-sm-10">Pet Fine</Label>
                                                        <Controller
                                                            name="petFine"
                                                            control={controlRules}
                                                            defaultValue={property.PetFine}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="petFine" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.petFine)} />
                                                            )}
                                                        />
                                                        {errorsRules.petFine && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="dailyPetFine" className="mr-sm-10">Daily Pet Fine</Label>
                                                        <Controller
                                                            name="dailyPetFine"
                                                            control={controlRules}
                                                            defaultValue={property.DailyPetFine}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="dailyPetFine" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.dailyPetFine)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.dailyPetFine && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                         
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-2">
                                                        <Label for="applicationFee" className="mr-sm-10">Application Fee</Label>
                                                        <Controller
                                                            name="applicationFee"
                                                            control={controlRules}
                                                            defaultValue={property.ApplicationFee}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="applicationFee" min={0} step={0.01} precision={2} size={5} style={Util.setErrorStyle(errorsRules.applicationFee)} />
                                                            )}
                                                        />
                                                        {errorsRules.applicationFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <Label for="monthToMonthFee" className="mr-sm-10">Month to Month Fee</Label>
                                                        <Controller
                                                            name="monthToMonthFee"
                                                            control={controlRules}
                                                            defaultValue={property.MonthToMonthFee}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="monthToMonthFee" min={0} size={5} style={Util.setErrorStyle(errorsRules.monthToMonthFee)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.monthToMonthFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                         
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RECURRING CHARGES TAX PERCENTAGE */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>RECURRING CHARGES TAX PERCENTAGE</Alert>
                                                <div className="row">
                                                    <div className="col-sm-1">
                                                        <Label for="rentPercentage" className="mr-sm-10">Rent</Label>
                                                        <Controller
                                                            name="rentPercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.RentPercentage}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="rentPercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.rentPercentage)} />
                                                            )}
                                                        />
                                                        {errorsRules.rentPercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="housePercentage" className="mr-sm-10">Housing</Label>
                                                        <Controller
                                                            name="housePercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.HousePercentage}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="housePercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.housePercentage)} />
                                                            )}
                                                        />
                                                        {errorsRules.housePercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="petPercentage" className="mr-sm-10">Pet</Label>
                                                        <Controller
                                                            name="petPercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.PetPercentage}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="petPercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.petPercentage)} />
                                                            )}
                                                        />
                                                        {errorsRules.petPercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="tvPercentage" className="mr-sm-10">TV</Label>
                                                        <Controller
                                                            name="tvPercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.TVPercentage}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="tvPercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.tvPercentage)} />
                                                            )}
                                                        />
                                                        {errorsRules.tvPercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="utilityPercentage" className="mr-sm-10">Utility</Label>
                                                        <Controller
                                                            name="utilityPercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.UtilityPercentage}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="utilityPercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.utilityPercentage)} />
                                                            )}
                                                        />
                                                        {errorsRules.utilityPercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="parkingPercentage" className="mr-sm-10">Parking</Label>
                                                        <Controller
                                                            name="parkingPercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.ParkingPercentage}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="parkingPercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.parkingPercentage)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.parkingPercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                         
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="storagePercentage" className="mr-sm-10">Storage</Label>
                                                        <Controller
                                                            name="storagePercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.StoragePercentage}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="storagePercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.storagePercentage)} />
                                                            )}
                                                        />
                                                        {errorsRules.storagePercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="securityPercentage" className="mr-sm-10">Security</Label>
                                                        <Controller
                                                            name="securityPercentage"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.SecurityPercentage}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="securityPercentage" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.securityPercentage)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.securityPercentage && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                         
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="lateFee" className="mr-sm-10">Late Fee</Label>
                                                        <Controller
                                                            name="lateFee"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.LateFee}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="lateFee" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.lateFee)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.lateFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                         
                                                    </div>
                                                    <div className="col-sm-1">
                                                        <Label for="nsfFee" className="mr-sm-10">NSF Fee</Label>
                                                        <Controller
                                                            name="nsfFee"
                                                            control={controlRules}
                                                            defaultValue={recurringTaxes.NSFFee}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="nsfFee" max={99} step={0.01} precision={2} style={Util.setErrorStyle(errorsRules.nsfFee)} /> 
                                                            )}
                                                        />
                                                        {errorsRules.nsfFee && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}                                         
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* FLAGS AND NOTIFICATIONS */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>FLAGS AND NOTIFICATIONS</Alert>
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <Label for="evictionThreshold" className="mr-sm-10">File Eviction if Bal GT</Label>
                                                        <Controller
                                                            name="evictionThreshold"
                                                            control={controlRules}
                                                            defaultValue={property.EvictionThreshold}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="evictionThreshold" min={0} step={1} style={Util.setErrorStyle(errorsRules.evictionThreshold)} />
                                                            )}
                                                        />
                                                        {errorsRules.evictionThreshold && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <Label for="smsThreshold" className="mr-sm-10">SMS/Text Tenant every (Days)</Label>
                                                        <Controller
                                                            name="smsThreshold"
                                                            control={controlRules}
                                                            defaultValue={property.SMSThreshold}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="smsThreshold" min={0} step={1} style={Util.setErrorStyle(errorsRules.smsThreshold)} />
                                                            )}
                                                        />
                                                        {errorsRules.smsThreshold && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <Label for="laborRate" className="mr-sm-10">Work Order Rate (Hourly)</Label>
                                                        <Controller
                                                            name="laborRate"
                                                            control={controlRules}
                                                            defaultValue={property.LaborRate}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="laborRate" min={0} style={Util.setErrorStyle(errorsRules.laborRate)} />
                                                            )}
                                                        />
                                                        {errorsRules.laborRate && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3 DAY NOTICE THRESHOLD */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>3 DAY NOTICE THRESHOLD</Alert>
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <Label for="threeDayNoticeTAmount" className="mr-sm-10">Amount</Label>
                                                        <Controller
                                                            name="threeDayNoticeTAmount"
                                                            control={controlRules}
                                                            defaultValue={property.ThreeDayNoticeTAmount}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="number" id="threeDayNoticeTAmount" min={0} style={Util.setErrorStyle(errorsRules.threeDayNoticeTAmount)} />
                                                            )}
                                                        />
                                                        {errorsRules.threeDayNoticeTAmount && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* INCLUDED UTILITIES */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>INCLUDED UTILITIES</Alert>
                                                <div className="row">
                                                    {hasUtilities.map(utility => 
                                                        <div className="col-sm-1">
                                                            <Label for={utility.name} className="mr-sm-10">{utility.name}</Label>
                                                            <Switch name={utility.name} checked={utility.value} onChange={e => handleChangeHasUtilities(utility.id)} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* PROPERTY DETAILS */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>PROPERTY DETAILS</Alert>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <Label for="propertyWebsite" className="mr-sm-10">Property Website</Label>
                                                        <Controller
                                                            name="propertyWebsite"
                                                            control={controlRules}
                                                            defaultValue={property.PropertyWebsite}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="text" id="propertyWebsite" style={Util.setErrorStyle(errorsRules.propertyWebsite)} />
                                                            )}
                                                        />
                                                        {errorsRules.propertyWebsite && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                    <div className="col-sm-8">
                                                        <Label for="propertyLongDescription" className="mr-sm-10">Property Description</Label>
                                                        <Controller
                                                            name="propertyLongDescription"
                                                            control={controlRules}
                                                            defaultValue={property.PropertyLongDescription}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="textarea" id="propertyLongDescription" rows={3} style={Util.setErrorStyle(errorsRules.propertyLongDescription)} />
                                                            )}
                                                        />
                                                        {errorsRules.propertyLongDescription && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RENTAL CRITERIA */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>RENTAL CRITERIA</Alert>
                                                <div className="row">
                                                    <div className="col-sm-8">
                                                        <Label for="rentalCriteria" className="mr-sm-10">Criteria</Label>
                                                        <Controller
                                                            name="rentalCriteria"
                                                            control={controlRules}
                                                            defaultValue={property.RentalCriteria}
                                                            rules={{required: true}}
                                                            render={({ field }) => (
                                                                <Input {...field} type="textarea" id="rentalCriteria" rows={3} style={Util.setErrorStyle(errorsRules.rentalCriteria)} />
                                                            )}
                                                        />
                                                        {errorsRules.rentalCriteria && (
                                                            <span style={{ color: "red" }} role="alert">required</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* OFFICE HOURS */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>OFFICE HOURS</Alert>
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <div className="row">
                                                            <div className="col-sm-12">
                                                                <Label className="ml-sm-10 mr-sm-10" style={{textAlign: "center"}}>Monday-Friday</Label>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <Controller
                                                                    name="mondayToFridayOpenTime"
                                                                    control={controlRules}
                                                                    defaultValue={officeHours.MondayFridayOpenTime}
                                                                    render={({ field }) => (
                                                                        <Input {...field} type="select" id="mondayToFridayOpenTime">
                                                                            {officeHoursValues.map((hour, index) => {
                                                                                return <option key={`mfopen-${index}`} value={hour.value}>{hour.label}</option>
                                                                            })}
                                                                        </Input>
                                                                    )}
                                                                /> 
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <Controller
                                                                    name="mondayToFridayCloseTime"
                                                                    control={controlRules}
                                                                    defaultValue={officeHours.MondayFridayCloseTime}
                                                                    render={({ field }) => (
                                                                        <Input {...field} type="select" id="mondayToFridayCloseTime">
                                                                            {officeHoursValues.map((hour, index) => {
                                                                                return <option key={`mfclose-${index}`} value={hour.value}>{hour.label}</option>
                                                                            })}
                                                                        </Input>
                                                                    )}
                                                                /> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-1" />
                                                    <div className="col-sm-3">
                                                        <div className="row">
                                                            <div className="col-sm-12">
                                                                <Label className="ml-sm-10 mr-sm-10" style={{textAlign: "center"}}>Saturday</Label>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <Controller
                                                                    name="saturdayOpenTime"
                                                                    control={controlRules}
                                                                    defaultValue={officeHours.SaturdayOpenTime}
                                                                    render={({ field }) => (
                                                                        <Input {...field} type="select" id="saturdayOpenTime">
                                                                            {officeHoursValues.map((hour, index) => {
                                                                                return <option key={`satopen-${index}`} value={hour.value}>{hour.label}</option>
                                                                            })}
                                                                        </Input>
                                                                    )}
                                                                /> 
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <Controller
                                                                    name="saturdayCloseTime"
                                                                    control={controlRules}
                                                                    defaultValue={officeHours.SaturdayCloseTime}
                                                                    render={({ field }) => (
                                                                        <Input {...field} type="select" id="saturdayCloseTime">
                                                                            {officeHoursValues.map((hour, index) => {
                                                                                return <option key={`satclose-${index}`} value={hour.value}>{hour.label}</option>
                                                                            })}
                                                                        </Input>
                                                                    )}
                                                                /> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-1" />
                                                    <div className="col-sm-3">
                                                        <div className="row">
                                                            <div className="col-sm-12">
                                                                <Label className="ml-sm-10 mr-sm-10" style={{textAlign: "center"}}>Sunday</Label>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <Controller
                                                                    name="sundayOpenTime"
                                                                    control={controlRules}
                                                                    defaultValue={officeHours.SundayOpenTime}
                                                                    render={({ field }) => (
                                                                        <Input {...field} type="select" id="sundayOpenTime">
                                                                            {officeHoursValues.map((hour, index) => {
                                                                                return <option key={`sunopen-${index}`} value={hour.value}>{hour.label}</option>
                                                                            })}
                                                                        </Input>
                                                                    )}
                                                                /> 
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <Controller
                                                                    name="sundayCloseTime"
                                                                    control={controlRules}
                                                                    defaultValue={officeHours.SundayCloseTime}
                                                                    render={({ field }) => (
                                                                        <Input {...field} type="select" id="sundayCloseTime">
                                                                            {officeHoursValues.map((hour, index) => {
                                                                                return <option key={`sunclose-${index}`} value={hour.value}>{hour.label}</option>
                                                                            })}
                                                                        </Input>
                                                                    )}
                                                                /> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CHECK LAYOUT */}
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-xl-12">
                                                <Alert color="info" style={{marginTop: '15px'}}>CHECK LAYOUT</Alert>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <Controller
                                                            name="checkID"
                                                            control={controlRules}
                                                            defaultValue={checks[0].CheckID}
                                                            render={({ field }) => (
                                                                <Input {...field} type="select" id="checkID">
                                                                    {checks.map((layout, index) => {
                                                                        return <option key={layout.Name} value={layout.CheckID}>{layout.Name}</option>
                                                                    })}
                                                                </Input>
                                                            )}
                                                        />                                            
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button type="submit" color="primary" style={{marginTop: '10px'}}>Update Rules</Button>
                                    </Form>
                                </RctCollapsibleCard>
                            </div>
                        </div>

                        {/* BILLING OPTIONS */}
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <RctCollapsibleCard heading="BILLING OPTIONS">
                                    <div className="row">
                                        <div className="col-sm-2">
                                            <FormControlLabel
                                                value="autoBilling"
                                                control={
                                                    <Switch 
                                                        color="primary" 
                                                        checked={autoBill.AutoBill === 1} 
                                                        onChange={handleChangeAutoBill}
                                                    />
                                                }
                                                label="Auto Billing"
                                                labelPlacement="end"
                                            />
                                        </div>
                                        <div className="col-sm-2">
                                            <FormControlLabel
                                                value="autoNotifyTennants"
                                                control={
                                                    <Switch 
                                                        color="primary" 
                                                        checked={autoBill.AutoBillNotify === 1}
                                                        onChange={handleChangeAutoBillNotify}
                                                    />
                                                }
                                                label="Auto Notify Tenants"
                                                labelPlacement="end"
                                            />
                                        </div>
                                    </div>
                                </RctCollapsibleCard>
                            </div>
                        </div>

                        {/* PROPERTY SETTINGS */}
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <RctCollapsibleCard heading="PROPERTY SETTINGS">
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Allow tenants pay less than amount due?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="allowTenantsPayLessThanAmountDue" 
                                                                    checked={property.AllowTenantsPayLessThanAmountDue === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AllowTenantsPayLessThanAmountDue: property.AllowTenantsPayLessThanAmountDue === 0 ? 1 : 0
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="allowTenantsPayLessThanAmountDue"
                                                                    checked={property.AllowTenantsPayLessThanAmountDue === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AllowTenantsPayLessThanAmountDue: property.AllowTenantsPayLessThanAmountDue === 0 ? 1 : 0
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            name="chkTenantsPayLessThanAmountDue"
                                                            checked={chkTenantsPayLessThanAmountDue}
                                                            onChange={e => setChkTenantsPayLessThanAmountDue(!chkTenantsPayLessThanAmountDue)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitTenantsPayLessThanAmountDue}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Receive weekly notifications of upcoming lease expirations?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="alertUpcomingLeaseExpiration"
                                                                    checked={property.AlertUpcomingLeaseExpiration === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AlertUpcomingLeaseExpiration: property.AlertUpcomingLeaseExpiration === 0 ? 1 : 0
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="alertUpcomingLeaseExpiration"
                                                                    checked={property.AlertUpcomingLeaseExpiration === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AlertUpcomingLeaseExpiration: property.AlertUpcomingLeaseExpiration === 0 ? 1 : 0
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkAlertUpcomingLeaseExpiration"
                                                            checked={chkAlertUpcomingLeaseExpiration}
                                                            onChange={e => setChkAlertUpcomingLeaseExpiration(!chkAlertUpcomingLeaseExpiration)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitAlertUpcomingLeaseExpiration}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Property pays application convenience fee?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="absorbApplicationFeeYes"
                                                                    checked={property.AbsorbApplicationFee === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AbsorbApplicationFee: property.AbsorbApplicationFee === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="absorbApplicationFeeYes"
                                                                    checked={property.AbsorbApplicationFee === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AbsorbApplicationFee: property.AbsorbApplicationFee === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkAbsorbApplicationFee"
                                                            checked={chkAbsorbApplicationFee}
                                                            onChange={e => setChkAbsorbApplicationFee(
                                                                !chkAbsorbApplicationFee
                                                            )}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitAbsorbApplicationFee}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Notify maintenance users when a work order changes?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="notifyWorkOrderChanges" 
                                                                    checked={property.NotifyWorkOrderChanges === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        NotifyWorkOrderChanges: property.NotifyWorkOrderChanges === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="notifyWorkOrderChanges" 
                                                                    checked={property.NotifyWorkOrderChanges === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        NotifyWorkOrderChanges: property.NotifyWorkOrderChanges === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkNotifyWorkOrderChanges"
                                                            checked={chkNotifyWorkOrderChanges}
                                                            onChange={e => setChkNotifyWorkOrderChanges(!chkNotifyWorkOrderChanges)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitNotifyWorkOrderChanges}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Always notify property managers when a work order changes?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="notifyWorkOrderChangesPM"
                                                                    checked={property.notifyWorkOrderChangesPM === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        notifyWorkOrderChangesPM: property.notifyWorkOrderChangesPM === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="notifyWorkOrderChangesPM"
                                                                    checked={property.notifyWorkOrderChangesPM === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        notifyWorkOrderChangesPM: property.notifyWorkOrderChangesPM === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkNotifyWorkOrderChangesPM"
                                                            checked={chkNotifyWorkOrderChangesPM}
                                                            onChange={e => setChkNotifyWorkOrderChangesPM(!chkNotifyWorkOrderChangesPM)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitNotifyWorkOrderChangesPM}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Require renter insurance?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="requireRenterInsurance"
                                                                    checked={property.RequireRenterInsurance === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        RequireRenterInsurance: property.RequireRenterInsurance === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="requireRenterInsurance"
                                                                    checked={property.RequireRenterInsurance === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        RequireRenterInsurance: property.RequireRenterInsurance === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkRequireRenterInsurance"
                                                            checked={chkRequireRenterInsurance}
                                                            onChange={e => setChkRequireRenterInsurance(!chkRequireRenterInsurance)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitRequireRenterInsurance}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                    
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Only display applicants associates to units in the deposits page?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="applicantsDepositsPage"
                                                                    checked={property.ApplicantsDepositsPage === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        ApplicantsDepositsPage: property.ApplicantsDepositsPage === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="applicantsDepositsPage"
                                                                    checked={property.ApplicantsDepositsPage === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        ApplicantsDepositsPage: property.ApplicantsDepositsPage === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkApplicantsDepositsPage"
                                                            checked={chkApplicantsDepositsPage}
                                                            onChange={e => setChkApplicantsDepositsPage(!chkApplicantsDepositsPage)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitApplicantsDepositsPage}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                    
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Notify Property Manager document was sent to tenant for signing?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="docSentSign" 
                                                                    checked={property.AlertPMDocSent === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AlertPMDocSent: property.AlertPMDocSent === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="docSentSign" 
                                                                    checked={property.AlertPMDocSent === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        AlertPMDocSent: property.AlertPMDocSent === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkAlertPMDocSent"
                                                            checked={chkAlertPMDocSent}
                                                            onChange={e => setChkAlertPMDocSent(!chkAlertPMDocSent)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitAlertPMDocSent}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                    
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Display Tenant Consent in the Work Order
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="DisplayTenantConsent" 
                                                                    checked={property.DisplayTenantConsent === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        DisplayTenantConsent: property.DisplayTenantConsent === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="DisplayTenantConsent" 
                                                                    checked={property.DisplayTenantConsent === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        DisplayTenantConsent: property.DisplayTenantConsent === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkDisplayTenantConsent"
                                                            checked={chkDisplayTenantConsent}
                                                            onChange={e => setChkDisplayTenantConsent(!chkDisplayTenantConsent)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitDisplayTenantConsent}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                    
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Office Property?
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="officeProperty" 
                                                                    checked={property.OfficeProperty === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        OfficeProperty: property.OfficeProperty === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="officeProperty" 
                                                                    checked={property.OfficeProperty === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        OfficeProperty: property.OfficeProperty === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-3"></div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitOfficeProperty}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                    
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Receive Promiss To Pay Notification
                                                </Label>
                                            </div>
                                            <div className="col-sm-1">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="receivePromissToPayNotification" 
                                                                    checked={property.receivePromissToPayNotification === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        receivePromissToPayNotification: property.receivePromissToPayNotification === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="receivePromissToPayNotification" 
                                                                    checked={property.receivePromissToPayNotification === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        receivePromissToPayNotification: property.receivePromissToPayNotification === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-3"></div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitReceivePromiss}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>

                                    {leadSource !== null && leadSource.LeadSourceCompanyID === 337 &&
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Seattle Property?
                                                </Label>
                                            </div>
                                            <div className="col-sm-3">
                                                <div className="row">
                                                    <div className="col-sm-5">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="seattleProperty" 
                                                                    checked={property.Seattle === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        Seattle: property.Seattle === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Yes
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-5">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="seattleProperty" 
                                                                    checked={property.Seattle === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        Seattle: property.Seattle === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}No
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitSeattle}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                    }

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <Label className="mr-sm-10">
                                                    Late Fees Charge:
                                                </Label>
                                            </div>
                                            <div className="col-sm-3">
                                                <div className="row">
                                                    <div className="col-sm-5">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="lateFeePercentage" 
                                                                    checked={property.LateFeesPercentage === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        LateFeesPercentage: property.LateFeesPercentage === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Fixed Amount
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-5">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="lateFeePercentage" 
                                                                    checked={property.LateFeesPercentage === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        LateFeesPercentage: property.LateFeesPercentage === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}% of Rent
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-1">
                                                <Button type="submit" color="primary" onClick={submitLateFeesPercentage}>Update</Button>
                                            </div>
                                        </div>
                                    </Form>
                                </RctCollapsibleCard>
                            </div>
                        </div>

                        {/* ACCOUNTING */}
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-xl-12">
                                <RctCollapsibleCard heading="ACCOUNTING">
                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-3">
                                                <Label className="mr-sm-10">
                                                    Set Close Out Date
                                                </Label>
                                            </div>
                                            <div className="col-sm-2">
                                                <DatePicker 
                                                    name="closeOutDate" 
                                                    id="closeOutDate"
                                                    value={closeOutDate} 
                                                    onChange={(e) => setCloseOutDate(e ? moment(e).format('YYYY-MM-DD') : '')}
                                                />
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox"
                                                            name="chkCloseOutDate"
                                                            checked={chkCloseOutDate}
                                                            onChange={e => setChkCloseOutDate(!chkCloseOutDate)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-2">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <Button type="submit" color="primary" onClick={submitCloseOutUpdate}>Update</Button>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <Button type="submit" color="danger" onClick={submitCloseOutCancel}>Cancel</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Form>

                                    <Form>
                                        <div className="row mb-2">
                                            <div className="col-sm-3">
                                                <Label className="mr-sm-10">
                                                    Profit and Loss Report
                                                </Label>
                                            </div>
                                            <div className="col-sm-2">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="prop1" 
                                                                    checked={property.ProfitLossReport === 0}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        ProfitLossReport: property.ProfitLossReport === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Cash
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <FormGroup check inline>
                                                            <Label check>
                                                                <Input 
                                                                    type="radio" 
                                                                    name="profitLossReport" 
                                                                    checked={property.ProfitLossReport === 1}
                                                                    onChange={e => setProperty({
                                                                        ...property,
                                                                        ProfitLossReport: property.ProfitLossReport === 1 ? 0 : 1
                                                                    })}
                                                                />{' '}Accrual
                                                            </Label>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">
                                                <FormGroup check inline>
                                                    <Label check>
                                                        <Input 
                                                            type="checkbox" 
                                                            name="chkProfitLossReport"
                                                            checked={chkProfitLossReport}
                                                            onChange={e => setChkProfitLossReport(!chkProfitLossReport)}
                                                        /> Apply for all properties
                                                    </Label>
                                                </FormGroup>
                                            </div>
                                            <div className="col-sm-2">
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <Button type="submit" color="primary" onClick={submitProfitLossReport}>Update</Button>
                                                    </div>
                                                    <div className="col-sm-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                </RctCollapsibleCard>
                            </div>
                        </div>
                    </div>

                    <NotificationContainer />
                </Main>
            );
        }
    }

    return render();
}

export default PropertyRules;