import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getSlip = async (data) => {
    let output = [];
    await axios.post(`${URL}/deposit/getSlip`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getDepositBreakdown = async (checkRegisterID) => {
    let output = [];
    await axios.get(`${URL}/deposit/getDepositBreakdown/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPaymentTypes = async () => {
    let output = [];
    await axios.get(`${URL}/deposit/paymentTypes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getProspects = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/deposit/getProspects/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getFormerTenants = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/deposit/getFormerTenants/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCurrentTenants = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/deposit/getCurrentTenants/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const pendingTransactions = async (data) => {
    let output = [];
    await axios.post(`${URL}/deposit/pendingTransactions`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getAllDepositSources = async () => {
    let output = [];
    await axios.get(`${URL}/deposit/getAllDepositSources`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const emailReceipt = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/emailReceipt`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteTransaction = async (tempTransactionID) => {
    let output = -1;
    await axios.get(`${URL}/deposit/delete/${tempTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addTemp = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/addTempTransaction`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const postDeposits = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/postDeposits`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTemp = async (tempTransactionID) => {
    let output = null;
    await axios.get(`${URL}/deposit/getTemp/${tempTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getDepositSource = async (depositSourceID) => {
    let output = null;
    await axios.get(`${URL}/deposit/getDepositSource/${depositSourceID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateTempTransaction = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/updateTempTransaction`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const markSecurityDepositAsPaid = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/markSecurityDepositAsPaid`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addLender = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/addLender`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getHistory = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/deposit/getHistory/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteDepositHistory = async (checkRegisterID) => {
    let output = -1;
    await axios.get(`${URL}/deposit/deleteDepositHistory/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEditDeposits = async (checkRegisterID) => {
    let output = {};
    await axios.get(`${URL}/deposit/getEditDeposits/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantsByProperty = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/deposit/getTenantsByProperty/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const processTenantCCPayment = async (data) => {
    let output = -1;
    await axios.post(`${URL}/deposit/processTenantCCPayment`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};