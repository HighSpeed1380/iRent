import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const login = async (data) => {
    let output = {};
    await axios.post(`${URL}/login/login`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getNotifications = async (userID) => {
    let output = null;
    await axios.get(`${URL}/login/getNotifications/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const forgetPassword = async (data) => {
    let output = {};
    await axios.post(`${URL}/login/forgetPassword`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};