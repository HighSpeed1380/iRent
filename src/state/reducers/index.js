import { combineReducers } from "redux";
import LoginReducer from './login'

const reducers = combineReducers({
    login: LoginReducer
});

export default reducers;