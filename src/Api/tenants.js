import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;


export const getTenants = async (data) => {
    let output = [];
    await axios.post(`${URL}/tenants/getTenants`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantBalance = async (tenantID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/getBalance/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getRefundableDeposit = async (tenantID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/getRefundableDeposit/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getMoveOutReasons = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getMoveOutReasons/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const moveOut = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/moveOut`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updEviction = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updEviction`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenant = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/tenant/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantUnit = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/unit/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getOthersOnLease = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/othersOnLease/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLeadSource = async (leadSourceID) => {
    let output = {};
    await axios.get(`${URL}/tenants/leadSource/${leadSourceID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLeaseAgent = async (userID) => {
    let output = {};
    await axios.get(`${URL}/tenants/leaseAgent/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getVehicles = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/vehicles/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getApplication = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/getApplication`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCreditReport = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/getCreditReport`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getDocuments = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/documents/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getForms = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/forms/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getListForms = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/formsList`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const get3DayNoticeAmt = async (propertyID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/3DayNoticeAmt/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLedger = async (tenantID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/ledger/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteTransaction = async (tenantTransactionID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deleteTransaction/${tenantTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getWorkOrders = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/workOrders/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteWK = async (workOrderID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deleteWK/${workOrderID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCommentsNotes = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/commentsNotes/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addCommentPost = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/addCommentNote`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPromissToPay = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/promissToPay/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addPromissToPay = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/addPromissToPay`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const editPromissToPay = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/editPromissToPay`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deletePromissToPay = async (promissToPayID) => {
    let output = [];
    await axios.get(`${URL}/tenants/deletePromissToPay/${promissToPayID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addOthersOnLease = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/addOthersOnLease`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateOthersOnLease = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updateOthersOnLease`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addVehicle = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/addVehicle`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const editVehicle = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/editVehicle`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteVehicle = async (tenantVehicleID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deleteVehicle/${tenantVehicleID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteOthersOnLease = async (tenantOthersOnLeaseID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deleteOthersOnLease/${tenantOthersOnLeaseID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEmergencyContacts = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/emergencyContacts/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addEmergencyContact = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/addEmergencyContact`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteEmergencyContacts = async (tenantEmergencyContactID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deleteEmergencyContact/${tenantEmergencyContactID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateEmergencyContact = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updateEmergencyContact`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLeaseViolations = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/leaseViolations/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteLeaseViolation = async (leaseViolationID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deleteLeaseViolation/${leaseViolationID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getThreeDayNotices = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/threeDayNotices/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getVacantUnitsByProperty = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/tenants/vacantUnits/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantBackground = async (tenantID) => {
    let output = {};
    await axios.get(`${URL}/tenants/background/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const transfer = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/transfer`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getAllocatedPayments = async (tenantTransactionID) => {
    let output = {};
    await axios.get(`${URL}/tenants/getAllocatedPayments/${tenantTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPaymentCategories = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getPaymentCategories/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTransactionAmount = async (tenantTransactionID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/transactionAmount/${tenantTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const allocatePayment = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/allocatePayment`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addPaymentCategory = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/addPaymentCategory`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updDetails = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updDetails`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updRecurringCharges = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updRecurringCharges`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updRecurringConcession = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updRecurringConcession`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updLeaseDates = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updLeaseDates`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getFutureLeaseChange = async (tenantID) => {
    let output = null;
    await axios.get(`${URL}/tenants/futureLeaseChange/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updFutureLeaseChanges = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updFutureLeaseChanges`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getDocumentTypes = async () => {
    let output = 0;
    await axios.get(`${URL}/tenants/documentTypes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEditTenantDocuments = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getDocuments/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const uploadTenantDocument = async (data) => {
    let output = 0;

    var formData = new FormData();
    formData.append('propertyID', data.propertyID);
    formData.append('tenantID', data.tenantID);
    formData.append('docName', data.docName);
    formData.append('documentTypeID', data.documentTypeID);
    formData.append('rentersInsuranceExpiration', data.rentersInsuranceExpiration);
    formData.append('file', data.file);

    await axios({
        method: "post",
        url: `${URL}/tenants/addDocument`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (res) {
            output = res.data;
        });

    return output;
}

export const createDirectory = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/createDirectory`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteDocument = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/deleteDocument`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const isTransactionClosed = async (tenantTransactionID) => {
    let output = true;
    await axios.get(`${URL}/tenants/isTransactionClosed/${tenantTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEditTransactionDetails = async (tenantTransactionID) => {
    let output = {};
    await axios.get(`${URL}/tenants/getEditTransactionDetails/${tenantTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEditTransactionType = async (transactionTypeID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getEditTransactionType/${transactionTypeID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEditTransactionTenants = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getEditTransactionTenants/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const editTransaction = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/editTransaction`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getUnitCharges = async (unitID) => {
    let output = {};
    await axios.get(`${URL}/tenants/getUnitCharges/${unitID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addTenant = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/addTenant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getChargeTypes = async () => {
    let output = [];
    await axios.get(`${URL}/tenants/getChargeTypes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const applyAdditionalCharges = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/applyAdditionalCharges`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const sendLedgerToTenant = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/sendLedgerToTenant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPreviousTenants = async (data) => {
    let output = [];
    await axios.post(`${URL}/tenants/getPreviousTenants`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getReconcilePrevious = async (data) => {
    let output = [];
    await axios.post(`${URL}/tenants/getReconcilePrevious`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getSendToCollection = async (companyID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/getSendToCollection/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const sendToCollection = async (tenantID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/sendToCollection/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getBalanceUntil = async (data) => {
    let output = [];
    await axios.post(`${URL}/tenants/getBalanceUntil`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCompanyPropDetails = async (tenantID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/getCompanyPropDetails/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTransactionsAfterDate = async (data) => {
    let output = [];
    await axios.post(`${URL}/tenants/getTransactionsAfterDate`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTempTransactionDetails = async (tempTransactionID) => {
    let output = 0;
    await axios.get(`${URL}/tenants/getTempTransactionDetails/${tempTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getByUnit = async (unitID) => {
    let output = null;
    await axios.get(`${URL}/tenants/getByUnit/${unitID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantTransactionsStatement = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getTenantTransactionsStatement/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updMoveOutDate = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updMoveOutDate`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPreLeaseProspects = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/tenants/getPreLeaseProspects/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const setPreLeased = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/setPreLeased`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deletePreLeaseProspect = async (preLeasedID) => {
    let output = -1;
    await axios.get(`${URL}/tenants/deletePreLeased/${preLeasedID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateTenantTransactionType = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updateTenantTransactionType`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateDelinquencyComment = async (data) => {
    let output = -1;
    await axios.post(`${URL}/tenants/updateDelinquencyComment`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getAllTenantsStatement = async (data) => {
    let output = '';
    await axios.post(`${URL}/tenants/getAllTenantsStatement`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};