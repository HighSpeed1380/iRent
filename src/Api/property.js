import axios from 'axios';
import { addLocaleData } from 'react-intl';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getProperty = async (propertyID) => {
    let output = {};
    await axios.get(`${URL}/property/property/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateProperty = async (propertyID, property) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}`, property)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getCompanyProperties = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/property/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getRecurringTaxes = async (propertyID) => {
    let output = {};
    await axios.get(`${URL}/property/RecurringTaxes/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const insertRecurringChargesTax = async (propertyID, data) => {
    let output = null;
    await axios.post(`${URL}/property/RecurringTaxes/${propertyID}`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateRecurringChargesTax = async (data) => {
    let output = null;
    await axios.patch(`${URL}/property/RecurringTaxes`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getOfficeHours = async (propertyID) => {
    let output = {};
    await axios.get(`${URL}/property/OfficeHours/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPropertyOfficeHours = async (propertyID) => {
    let output = null;
    await axios.get(`${URL}/property/PropertyOfficeHours/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const insertPropertyOfficeHours = async (propertyID, data) => {
    let output = null;
    await axios.post(`${URL}/property/ProportyOfficeHours/${propertyID}`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyOfficeHours = async (data) => {
    let output = null;
    await axios.patch(`${URL}/property/PropertyOfficeHours`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getAutoBill = async (propertyID) => {
    let output = null;
    await axios.get(`${URL}/property/AutoBill/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const insertAutoBill = async (propertyID, data) => {
    let output = null;
    await axios.post(`${URL}/property/AutoBill/${propertyID}`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateAutoBill = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/AutoBill/${propertyID}`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const insertAutoBillNotify = async (propertyID, data) => {
    let output = null;
    await axios.post(`${URL}/property/AutoBillNotify/${propertyID}`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateAutoBillNotify = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/AutoBillNotify/${propertyID}`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getTenantPaymentAmountDueYesAllProperties = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/TenantPaymentAmountDueYesAllProperties`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantPaymentAmountDueNoAllProperties = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/TenantPaymentAmountDueNoAllProperties`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyTenantPayLessThanAmountDue = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/TenantPayLessThanAmountDue`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateTenantPayLessThanAmountDueAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/TenantPayLessThanAmountDue`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getAlertUpcomingLeaseExpirationAllProperties = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/AlertUpcomingLeaseExpiration`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyAlertUpcomingLeaseExpiration = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/AlertUpcomingLeaseExpiration`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateAlertUpcomingLeaseExpirationAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/AlertUpcomingLeaseExpiration`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getAbsorbApplicationFee = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/AbsorbApplicationFee`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyAbsorbApplicationFee = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/AbsorbApplicationFee`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateAbsorbApplicationFeeAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/AbsorbApplicationFee`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getNotifyWorkOrderChanges = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/NotifyWorkOrderChanges`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyNotifyWorkOrderChanges = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/NotifyWorkOrderChanges`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateNotifyWorkOrderChangesAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/NotifyWorkOrderChanges`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getNotifyWorkOrderChangesPM = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/NotifyWorkOrderChangesPM`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyNotifyWorkOrderChangesPM = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/NotifyWorkOrderChangesPM`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateNotifyWorkOrderChangesPMAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/NotifyWorkOrderChangesPM`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getCloseOutAllProp = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/CloseOutAllProp`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getProfitLossReport = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/ProfitLossReport`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getRequireInsuranceYes = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/RequireInsuranceYes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getRequireInsuranceNo = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/RequireInsuranceNo`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyRequireRenterInsurance = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/RequireRenterInsurance`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateRequireRenterInsuranceAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/RequireRenterInsurance`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getApplicantsDepositPageYes = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/ApplicantsDepositPageYes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getApplicantsDepositPageNo = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/ApplicantsDepositPageNo`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyApplicantsDepositsPage = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/ApplicantsDepositsPage`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateApplicantsDepositsPageAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/ApplicantsDepositsPage`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getAlertPMDocSentYes = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/AlertPMDocSentYes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getAlertPMDocSentNo = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/AlertPMDocSentNo`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyAlertPMDocSent = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/AlertPMDocSent`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateAlertPMDocSentAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/AlertPMDocSent`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getTenantConsentYes = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/TenantConsentYes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantConsentNo = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/property/${companyID}/TenantConsentNo`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updatePropertyDisplayTenantConsent = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/DisplayTenantConsent`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateDisplayTenantConsentAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/DisplayTenantConsent`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyOfficeProperty = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/OfficeProperty`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyReceivePromiss = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/ReceivePromiss`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyLateFeesPercentage = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/LateFeesPercentage`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertySeattle = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/Seattle`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyCloseOut = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/CloseOut`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateCloseOutAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/CloseOut`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyCloseOutCancel = async (propertyID) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/CloseOutCancel`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateCloseOutCancelAllProperties = async (companyID) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/CloseOutCancel`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePropertyProfitLossReport = async (propertyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/property/${propertyID}/ProfitLossReport`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateProfitLossReportAllProperties = async (companyID, data) => {
    let output = null;
    await axios.patch(`${URL}/property/${companyID}/ProfitLossReport`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}