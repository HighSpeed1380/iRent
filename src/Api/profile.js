import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getUserProfileData = async (uID) => {
    let output = null;
    await axios.get(`${URL}/profile/getUserProfileData/${uID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateNotifications = async (data) => {
    let output = -1;
    await axios.post(`${URL}/profile/updateNotifications/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePreferences = async (data) => {
    let output = -1;
    await axios.post(`${URL}/profile/updatePreferences/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updatePassword = async (data) => {
    let output = -1;
    await axios.post(`${URL}/profile/updatePassword/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const updateSignature = async (data) => {
    let output = -1;
    await axios.post(`${URL}/profile/updateSignature/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}