import { Types } from '../constants';

export const login = (data, properties, notifications) => {
    return (dispatch) => {
        dispatch({
            type: Types.LOGIN,
            payload: {
                data,
                properties,
                notifications
            }
        });
    }
}

export const logout = () => {
    return (dispatch) => {
        dispatch({
            type: Types.LOGOUT
        });
    }
}

export const updateSelectedProperty = (id) => {
    return (dispatch) => {
        dispatch({
            type: Types.UPDSELECTEDPROPERTY,
            payload: id
        });
    }
}

export const updateUserPreferences = (data) => {
    return (dispatch) => {
        dispatch({
            type: Types.UPDUSERPREFERENCES,
            payload: data
        });
    }
}