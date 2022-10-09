import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getTazworksReport = async (data) => {
    let output = -1;
    await axios.post(`${URL}/backgroundScreening/tazworks/getReport`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCICReport = async (data) => {
    let output = -1;
    await axios.post(`${URL}/backgroundScreening/cic/getReport`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const request = async (data) => {
    let output = -1;
    await axios.post(`${URL}/backgroundScreening/tazworks/request`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const requestCICReprot = async (data) => {
    let output = -1;
    await axios.post(`${URL}/backgroundScreening/cic/runReport`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}; 