import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getDetails = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/companyProfile/getDetails/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCurrencies = async () => {
    let output = [];
    await axios.get(`${URL}/companyProfile/getCurrencies`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateSettings = async (data) => {
    let output = -1;
    await axios.post(`${URL}/companyProfile/updateSettings`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateDetails = async (data) => {
    let output = -1;
    await axios.post(`${URL}/companyProfile/updateDetails`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateCompanyCard = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/updCC`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateCompanyBank = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/updBank`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const verifyBank = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/verifyBank`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updPaymentMethod = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/updPaymentMethod`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getExpenseTypes = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/companyProfile/getExpenseTypes/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getAccountTypes = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/companyProfile/getAccountTypes/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addExpenseType = async (data) => {
    let output = -1;
    await axios.post(`${URL}/companyProfile/addExpenseType`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteExpenseType = async (expenseTypeID) => {
    let output = -1;
    await axios.get(`${URL}/companyProfile/deleteExpenseType/${expenseTypeID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const mergeExpenseTypes = async (data) => {
    let output = -1;
    await axios.post(`${URL}/companyProfile/mergeExpenseTypes`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};


export const getLeadSource = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/company/${companyID}/LeadSource`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getJournalEntries = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/company/getJournalEntries/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getJournalType = async () => {
    let output = [];
    await axios.get(`${URL}/company/getJournalType`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addJournal = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/addJournal`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteJournal = async (journalID) => {
    let output = -1;
    await axios.get(`${URL}/company/deleteJournal/${journalID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getJournalByID = async (journalID) => {
    let output = -1;
    await axios.get(`${URL}/company/getJournalByID/${journalID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const editJournal = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/editJournal`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getMakeReadyTasks = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/company/getMakeReadyTasks/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteMakeReady = async (makeReadyTaskID) => {
    let output = -1;
    await axios.get(`${URL}/company/deleteMakeReady/${makeReadyTaskID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addMakeReadyTask = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/addMakeReadyTask`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getMakeReadyTaskByID = async (makeReadyTaskID) => {
    let output = null;
    await axios.get(`${URL}/company/getMakeReadyTaskByID/${makeReadyTaskID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updMakeReadyTask = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/updMakeReadyTask`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getGLCategories = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/company/getGLCategories/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteGLCategories = async (paymentCategoryID) => {
    let output = -1;
    await axios.get(`${URL}/company/deleteGLCategories/${paymentCategoryID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addGLCategory = async (data) => {
    let output = -1;
    await axios.post(`${URL}/company/addGLCategory`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};