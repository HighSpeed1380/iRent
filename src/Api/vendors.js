import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getAll = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/vendors/getAll/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getByID = async (vendorID) => {
    let output = null;
    await axios.get(`${URL}/vendors/getByID/${vendorID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const add = async (data) => {
    let output = -1;
    await axios.post(`${URL}/vendors/add`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deactive = async (vendorID) => {
    let output = -1;
    await axios.get(`${URL}/vendors/deactive/${vendorID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const merge = async (data) => {
    let output = -1;
    await axios.post(`${URL}/vendors/merge`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const update = async (data) => {
    let output = -1;
    await axios.post(`${URL}/vendors/update`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};