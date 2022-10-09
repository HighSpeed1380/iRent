import { createChatBotMessage } from "react-chatbot-kit";

import LearningOptions from './LearningOptions/LearningOptions';
import LinkedList from './LinkList/LinkList';
import SearchWords from './SearchWords/SearchWords';

const config = {
    botName: "iRent Bot",
    initialMessages: [
        createChatBotMessage(`Hi, I'm here to help. How can I help you?`,{
            widget: "listOptions"
        })
    ],
    widgets: [
        {
            widgetName: "listOptions",
            widgetFunc: (props) => <LearningOptions {...props} />
        },
        {
            widgetName: "paymentsLinks",
            widgetFunc: (props) => <LinkedList {...props} />,
            props: {
                options: [
                    {
                      text: "Allocating Payments in iRent",
                      link: "https://vimeo.com/261564343",
                      id: 1,
                    },
                    {
                      text: "Setting up iRent & Rmap for accepting tenant payments via EpicPay payment processing",
                      link: "https://vimeo.com/371412473",
                      id: 2,
                    },
                    {
                      text: "Setting up Bank Accounts within iRent and RMAP",
                      link: "https://vimeo.com/343781137",
                      id: 3,
                    },
                    {
                        text: "Refund Online Payments",
                        link: "https://vimeo.com/285179722",
                        id: 4,
                    },
                ],
            }
        },
        {
            widgetName: "workOrderLinks",
            widgetFunc: (props) => <LinkedList {...props} />,
            props: {
                options: [
                    {
                      text: "Creating and Modifying Work Orders",
                      link: "https://vimeo.com/335437841",
                      id: 1,
                    },
                ],
            }
        },
        {
            widgetName: "tenantLinks",
            widgetFunc: (props) => <LinkedList {...props} />,
            props: {
                options: [
                    {
                        id: 1,
                        text: "Tenant Screening Integrated into iRent",
                        link: "https://vimeo.com/259905211"
                    },
                    {
                        id: 2,
                        text: "Adding Applicants and Tenants",
                        link: "https://vimeo.com/320608677"
                    },
                    {
                        id: 3,
                        text: "Working with Tenants in iRent",
                        link: "https://vimeo.com/260469456"
                    },
                    {
                        id: 4,
                        text: "Tenant Portal App - Overview",
                        link: "https://vimeo.com/408516289"
                    }
                ]
            }
        },
        {
            widgetName: "search",
            widgetFunc: (props) => <SearchWords {...props} />,
            mapStateToProps: ["search", "sentence"]
        }
    ],
    customStyles: {
        botMessageBox: {
          backgroundColor: "#376B7E",
        },
        chatButton: {
          backgroundColor: "#009ACD",
        },
    },
    state: {
        search: [],
        sentence: ''
    }
}

export default config