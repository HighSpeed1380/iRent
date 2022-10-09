import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getProspects = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getProspects/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deniedProspect = async (tenantID) => {
    let output = -1;
    await axios.get(`${URL}/applicants/deniedProspect/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const convertToApplicant = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/convertToApplicant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getUnitTypes = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getUnitTypes/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLeadSources = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getLeadSources/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateProspectApplicant = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/updateProspectApplicant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getApplicants = async (propertyID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getApplicants/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getReviewData = async () => {
    let output = [];
    await axios.get(`${URL}/applicants/getReviewData`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const reviewApplicant = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/reviewApplicant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTazworksReportURL = async (data) => {
    let output = null;
    await axios.post(`${URL}/applicants/getTazworksReportURL`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getOthersOnLease = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getOthersOnLease/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addLeaseHolder = async (data) => {
    let output = null;
    await axios.post(`${URL}/applicants/addLeaseHolder`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const updateLeaseHolder = async (data) => {
    let output = null;
    await axios.post(`${URL}/applicants/updateLeaseHolder`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPropertyByID = async (propertyID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getPropertyByID/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getUnitDetails = async (unitID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getUnitDetails/${unitID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantVehicles = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getTenantVehicles/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantReferences = async (tenantID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getTenantReferences/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const convertToTenant = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/convertToTenant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getDeniedProspects = async (data) => {
    let output = [];
    await axios.post(`${URL}/applicants/getDeniedProspects/`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const removeProspect = async (tenantID) => {
    let output = -1;
    await axios.get(`${URL}/applicants/removeProspect/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addNewProspectApplicant = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/addNewProspectApplicant`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getCompanyDetails = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getCompanyDetails/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getBackgroundPackages = async (companyID) => {
    let output = [];
    await axios.get(`${URL}/applicants/getBackgroundPackages/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getApplicantCreditCard = async (tenantID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getApplicantCreditCard/${tenantID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTentOthersOnLeaseByID = async (tolID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getTentOthersOnLeaseByID/${tolID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getRunBSDetails = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/getRunBSDetails`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getVicTigSignUpData = async (companyID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getVicTigSignUpData/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const submitVicTigDocs = async (data) => {
    let output = -1;
    await axios.post(`${URL}/applicants/submitVicTigDocs`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantUnitType = async (unitTypeID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getTenantUnitType/${unitTypeID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getTenantLeadSource = async (leadSourceID) => {
    let output = null;
    await axios.get(`${URL}/applicants/getTenantLeadSource/${leadSourceID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const companyNeedToSignUpScreening = async (companyID) => {
    let output = true;
    await axios.get(`${URL}/applicants/companyNeedToSignUpScreening/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};