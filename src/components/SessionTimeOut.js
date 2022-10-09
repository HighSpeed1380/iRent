import React, { useState, useRef } from "react";
import IdleTimer from "react-idle-timer";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from '../state/index';
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import SessionTimeoutDialog from './SessionTimeoutDialog';

let countdownInterval;
let timeout = 1000 * 60 * 15;

const SessionTimeout = () => {
    const idleTimer = useRef(null);
    const history = useHistory();

    const login = useSelector((state) => state.login);
    const dispatch = useDispatch();
    const { logout } = bindActionCreators(actionCreators, dispatch);

    const [timeoutModalOpen, setTimeoutModalOpen] = useState(false);
    const [timeoutCountdown, setTimeoutCountdown] = useState(0);

    const onActive = () => {
        // timer reset automatically.
        if (!timeoutModalOpen) {
            clearSessionInterval();
            clearSessionTimeout();
        }
    };
    
    const onIdle = () => {
        const delay = 1000 * 5;
        if(login.logged && !timeoutModalOpen) {
            timeout = setTimeout(() => {
                let countDown = 60;
                setTimeoutModalOpen(true);
                setTimeoutCountdown(countDown);
                countdownInterval = setInterval(() => {
                  if (countDown > 0) {
                    setTimeoutCountdown(--countDown);
                  } else {
                    handleLogout();
                  }
                }, 1000);
            }, delay);
        }
    };

    const clearSessionTimeout = () => {
        clearTimeout(timeout);
    };
    
    const clearSessionInterval = () => {
        clearInterval(countdownInterval);
    };

    const handleLogout = () => {
        setTimeoutModalOpen(false);
        clearSessionInterval();
        clearSessionTimeout();
        logout();
        history.push("/login");
    };
      
    const handleContinue = () => {
        setTimeoutModalOpen(false);
        clearSessionInterval();
        clearSessionTimeout();
        window.location.reload();
    };

    return (
        <>
          <IdleTimer
            ref={idleTimer}
            onActive={onActive}
            onIdle={onIdle}
            debounce={250}
            timeout={timeout}
          />
          <SessionTimeoutDialog
            countdown={timeoutCountdown}
            onContinue={handleContinue}
            onLogout={handleLogout}
            open={timeoutModalOpen}
          />
        </>
    );
};

export default SessionTimeout;