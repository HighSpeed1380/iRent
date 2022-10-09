import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getChecks = async () => {
    let output = {};
    await axios.get(`${URL}/checks`)
        .then((res) => {
            output = res.data;
        });
    return output;
};
