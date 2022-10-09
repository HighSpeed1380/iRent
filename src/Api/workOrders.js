import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getMaintenance = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/workOrders/getMaintenance/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getOpens = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/workOrders/getOpens/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getClosed = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/workOrders/getClosed/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const add = async (data) => {
    let output = 0;
    await axios.post(`${URL}/workOrders/add/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const addFileNotification = async (data) => {
    let output = -1;

    var formData = new FormData();
    formData.append('workOrderID', data.workOrderID);
    formData.append('propertyID', data.propertyID);
    formData.append('unitID', data.unitID);
    formData.append('file', data.file);

    await axios({
        method: "post",
        url: `${URL}/workOrders/addFileNotification`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (res) {
            output = res.data;
        });

    return output;
}

export const getImage = async (data) => {
    let output = '';
    await axios.post(`${URL}/workOrders/getImage/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getbyID = async (workOrderID) => {
    let output = null;
    await axios.get(`${URL}/workOrders/getbyID/${workOrderID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getUnit = async (unitID) => {
    let output = null;
    await axios.get(`${URL}/workOrders/getUnit/${unitID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const update = async (data) => {
    let output = -1;
    await axios.post(`${URL}/workOrders/update/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getRecurring = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/workOrders/getRecurring/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const addRecurring = async (data) => {
    let output = -1;
    await axios.post(`${URL}/workOrders/addRecurring/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getRecurringByID = async (id) => {
    let output = null;
    await axios.get(`${URL}/workOrders/getRecurringByID/${id}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateRecurring = async (data) => {
    let output = -1;
    await axios.post(`${URL}/workOrders/updateRecurring/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const inactivateRecurring = async (id) => {
    let output = -1;
    await axios.get(`${URL}/workOrders/inactivateRecurring/${id}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getOpenWkSummary = async (propertyID) => {
    let output = {};
    await axios.get(`${URL}/workOrders/getOpenWkSummary/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPrintView = async (workOrderID) => {
    let output = {};
    await axios.get(`${URL}/workOrders/getPrintView/${workOrderID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};