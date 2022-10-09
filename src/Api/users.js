import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getUsers = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/users/getUsers/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPropertiesByCompany = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/users/getPropertiesByCompany/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getSecurityLevels = async () => {
    let output = [];
    await axios.get(`${URL}/users/getSecurityLevels`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const add = async (data) => {
    let output = -1;
    await axios.post(`${URL}/users/add`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deactivateUser = async (userID) => {
    let output = -1;
    await axios.get(`${URL}/users/deactivateUser/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getUser = async (userID) => {
    let output = -1;
    await axios.get(`${URL}/users/getUser/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const editUser = async (data) => {
    let output = -1;
    await axios.post(`${URL}/users/editUser`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};