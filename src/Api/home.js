import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getUserName = async (uID) => {
    let output = '';
    await axios.get(`${URL}/home/getUserFullName/${uID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getLast6MonthsPay = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/getLast6MonthsPayment/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getPLSnapshot = async (pID) => {
    let output = {};
    await axios.get(`${URL}/home/plSnapshot/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getPLSnapData = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/vacancySnapshots/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getActionItems = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/actionItems/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getSnapWorkOrders = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/workOrders/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getConcessionRequest = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/concessiongRequests/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getLeaseAudit = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/audit/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getSecurityDeposit = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/securityDeposit/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getMissedPromissPay = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/missedPromisesPay/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getDelinquenciesOver = async (pID) => {
    let output = {};
    await axios.get(`${URL}/home/delinquenciesOver/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateVacantDate = async (data) => {
    let output = -1;
    await axios.post(`${URL}/home/updateVacantDate`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateNote = async (data) => {
    let output = -1;
    await axios.post(`${URL}/home/updateNote`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getActionItem = async (actionItemID) => {
    let output = {};
    await axios.get(`${URL}/home/getActionItem/${actionItemID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateActionItem = async (data) => {
    let output = -1;
    await axios.post(`${URL}/home/updateActionItem`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePromissToPay = async (data) => {
    let output = -1;
    await axios.post(`${URL}/home/updatePromissToPay`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getMissedPromisePayDetails = async (promissPayID) => {
    let output = null;
    await axios.get(`${URL}/home/getMissedPromisePayDetails/${promissPayID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updPromissToPayDetails = async (data) => {
    let output = -1;
    await axios.post(`${URL}/home/updPromissToPayDetails`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getNotifications = async (pID) => {
    let output = [];
    await axios.get(`${URL}/home/getNotifications/${pID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}