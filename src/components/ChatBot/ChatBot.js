import React, { useState } from "react";
import Chatbot from 'react-chatbot-kit';

import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import config from './config';
import './chatBot.css';

const MyChatBot = (props) => {
    //const [ openChat, setOpenChat ] = useState(false);

    const saveMessages = (messages) => {
        localStorage.setItem("chat_messages", JSON.stringify(messages));
    };
    
    const loadMessages = () => {
        const messages = JSON.parse(localStorage.getItem("chat_messages"));
        return messages;
    };

    const content = () => {
        if(props.openChat) {
            return (
                <div className="chatbot-container">
                    <Chatbot 
                        config={config}
                        actionProvider={ActionProvider}
                        messageParser={MessageParser}
                        messageHistory={loadMessages()}
                        saveMessages={saveMessages}
                    />
                    {/*
                    <button className="chatbot-button"
                        onClick={() => setOpenChat(!openChat)}>
                            <p style={{color: "white"}}>{!openChat ? "Open" : "Close"} Chat</p>
                    </button>
                    */}
                </div>
            )
        } /*else {
            return (
                <button className="chatbot-button"
                    onClick={() => setOpenChat(!openChat)}>
                        <p style={{color: 'white'}}>{!openChat ? "Open" : "Close"} Chat</p>
                </button>
            );
        }*/
    }

    return content();
};

export default MyChatBot;