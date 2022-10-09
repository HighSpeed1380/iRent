import axios from 'axios';
import * as Constants from '../components/Util/constants';

const URL = Constants.REQ_URL;

export const getPayee = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/bills/payees/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getExpenseTypes = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/bills/expenseTypes/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getLenders = async (companyID) => {
    let output = {};
    await axios.get(`${URL}/bills/lenders/${companyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getUnits = async (propertyID) => {
    let output = {};
    await axios.get(`${URL}/bills/units/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getUnpaidBills = async (data) => {
    let output = [];
    await axios.post(`${URL}/bills/unpaid`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const deleteBill = async (checkRegisterID) => {
    let output = {};
    await axios.get(`${URL}/bills/delete/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const markPaid = async (checkRegisterID, userID) => {
    let output = {};
    await axios.get(`${URL}/bills/markPaid/${checkRegisterID}/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const markUnpaid = async (checkRegisterID, userID) => {
    let output = {};
    await axios.get(`${URL}/bills/markUnpaid/${checkRegisterID}/${userID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addBill = async (data) => {
    let output = [];
    await axios.post(`${URL}/bills/addBill`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addBillReceipt = async (data) => {
    let output = 0;

    var formData = new FormData();
    formData.append('propertyID', data.propertyID);
    formData.append('checkRegisterID', data.checkRegisterID);
    formData.append('file', data.file);

    await axios({
        method: "post",
        url: `${URL}/bills/addReceipt`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (res) {
            output = res.data;
        });

    return output;
}

export const getPaidBills = async (data) => {
    let output = [];
    await axios.post(`${URL}/bills/paid`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const isClosedOut = async (checkRegisterID) => {
    let output = {};
    await axios.get(`${URL}/bills/isClosedOut/${checkRegisterID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getAppBill = async (data) => {
    let output = "";
    await axios.post(`${URL}/bills/getAppBill`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const getFrequencies = async () => {
    let output = [];
    await axios.get(`${URL}/bills/frequency`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getPostMethods = async () => {
    let output = [];
    await axios.get(`${URL}/bills/postMethods`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getReccuringBills = async (data) => {
    let output = []
    await axios.post(`${URL}/bills/recurringBills`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const deleteRecurring = async (id) => {
    let output = [];
    await axios.get(`${URL}/bills/deleteReccuring/${id}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const addRecurring = async (data) => {
    let output = []
    await axios.post(`${URL}/bills/addRecurring`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
}

export const addRecurringReceipt = async (data) => {
    let output = 0;

    var formData = new FormData();
    formData.append('propertyID', data.propertyID);
    formData.append('recurringBillID', data.recurringBillID);
    formData.append('file', data.file);

    await axios({
        method: "post",
        url: `${URL}/bills/addRecurringReceipt`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (res) {
            output = res.data;
        });

    return output;
}

export const getProperties = async (uID) => {
    let output = [];
    await axios.get(`${URL}/bills/userProperties/${uID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const payeeUpdate = async (propertyID, vendorID) => {
    let output = {};
    await axios.get(`${URL}/bills/updatedPayee/${propertyID}/${vendorID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const markAllPaid = async (data) => {
    let output = [];
    await axios.post(`${URL}/bills/markAllPaid`, data)
        .then((res) => {
            output = res.data;
        });
    return output;
};

export const getDupes = async (propertyID) => {
    let output = {};
    await axios.get(`${URL}/bills/getDupes/${propertyID}`)
        .then((res) => {
            output = res.data;
        });
    return output;
};