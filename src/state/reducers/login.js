import { Types } from '../constants';

const initialState = {
    logged: false,
    user: null,
    company: null,
    properties: [],
    selectedPropertyID: null
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case Types.LOGIN:
            const data = action.payload.data;
            const properties = action.payload.properties;
            const notifications = action.payload.notifications;
            return {
                ...state,
                logged: true,
                user: {
                    id: data.UserID,
                    firstName: data.UserFName,
                    lastName: data.UserLName,
                    email: data.UserEmail,
                    securityLevel: parseInt(data.SecurityLevelID),
                    notifications: {
                        multiProp: notifications.MultiProp && parseInt(notifications.MultiProp) === 1 ? false : true,
                        singleCheckBook: notifications.SingleCheckbook && parseInt(notifications.SingleCheckbook) === 1 ? false : true
                    }
                },
                company: {
                    id: data.CompanyID,
                    name: data.CompanyName,
                    email: data.ContactEmail,
                    leadSource: parseInt(data.LeadSourceCompanyID)
                },
                properties,
                selectedPropertyID: data.LastPropertyID !== null ? data.LastPropertyID : properties[0].PropertyID
            }
        case Types.LOGOUT:
            return {
                logged: false,
                user: null,
                company: null,
                properties: [],
                selectedPropertyID: null
            }
        case Types.UPDSELECTEDPROPERTY:
            return {
                ...state,
                selectedPropertyID: action.payload
            }
        case Types.UPDUSERPREFERENCES:
            const notf = action.payload;
            return {
                ...state,
                user: {
                    ...state.user,
                    notifications: {
                        multiProp: notf.MultiProp && parseInt(notf.MultiProp) === 1 ? false : true,
                        singleCheckBook: notf.SingleCheckbook && parseInt(notf.SingleCheckbook) === 1 ? false : true
                    }
                }
            }
        default:
            return state;
    }
}

export default reducer;