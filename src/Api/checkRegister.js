import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const get = async (data) => {
    let output = [];
    await axios.post(`${URL}/checkRegisterRouter/get`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const reconcile = async (checkRegisterID) => {
    let output = [];
    await axios.get(`${URL}/checkRegisterRouter/reconcile/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteCR = async (checkRegisterID, userID) => {
    let output = [];
    await axios.get(`${URL}/checkRegisterRouter/delete/${checkRegisterID}/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getReconcileDebits = async (data) => {
    let output = [];
    await axios.post(`${URL}/checkRegisterRouter/reconcile/debits`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getReconcileCredits = async (data) => {
    let output = [];
    await axios.post(`${URL}/checkRegisterRouter/reconcile/credits`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getReconcileLog = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/checkRegisterRouter/reconcileLog/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPreviousReconcile = async (data) => {
    let output = [];
    await axios.post(`${URL}/checkRegisterRouter/getPreviousReconcile`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const completeReconcile = async (data) => {
    let output = [];
    await axios.post(`${URL}/checkRegisterRouter/completeReconcile`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getByID = async (checkRegisterID) => {
    let output = null;
    await axios.get(`${URL}/checkRegisterRouter/getByID/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateBill = async (data) => {
    let output = -1;
    await axios.post(`${URL}/checkRegisterRouter/updateBill`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updBillReceipt = async (data) => {
    let output = 0;
        
    var formData = new FormData();
    formData.append('propertyID', data.propertyID);
    formData.append('checkRegisterID', data.checkRegisterID);
    formData.append('file', data.file);

    await axios({
        method: "post",
        url: `${URL}/checkRegisterRouter/updBillReceipt`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (res) {
            output = res.data;
        });

    return output;
}

export const updateItem = async (data) => {
    let output = -1;
    await axios.post(`${URL}/checkRegisterRouter/updItem`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getEditTransactionData = async (tenantTransactionID) => {
    let output = null;
    await axios.get(`${URL}/checkRegisterRouter/getEditTransactionData/${tenantTransactionID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};