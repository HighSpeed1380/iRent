import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getOwners = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/owners/getOwners/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteOwner = async (ownerID) => {
    let output = -1;
    await axios.get(`${URL}/owners/deleteOwner/${ownerID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const add = async (data) => {
    let output = -1;
    await axios.post(`${URL}/owners/add`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getOwner = async (ownerID) => {
    let output = {};
    await axios.get(`${URL}/owners/getOwner/${ownerID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const edit = async (data) => {
    let output = -1;
    await axios.post(`${URL}/owners/edit`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};