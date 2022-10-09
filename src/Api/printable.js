import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getForm = async (data) => {
    let output = "";
    await axios.post(`${URL}/printable/getForm`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const sendDocTenantSignature = async (data) => {
    let output = "";
    await axios.post(`${URL}/printable/sendDocTenantSignature`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const saveThreeDayNotice = async (data) => {
    let output = -1;
    await axios.post(`${URL}/printable/saveThreeDayNotice`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLeaseViolationTypes = async () => {
    let output = [];
    await axios.get(`${URL}/printable/getLeaseViolationTypes`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addLeaseViolationComment = async (data) => {
    let output = -1;
    await axios.post(`${URL}/printable/addLeaseViolationComment`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};