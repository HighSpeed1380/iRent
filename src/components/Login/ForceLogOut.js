import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from '../../state/index';

const ForceLogOut = () => {

    const dispatch = useDispatch();
    const { logout } = bindActionCreators(actionCreators, dispatch);

    logout();
}

export default ForceLogOut;