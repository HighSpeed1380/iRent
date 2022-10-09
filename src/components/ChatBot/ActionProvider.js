
class ActionProvider {
    constructor(createChatBotMessage, setStateFunc, createClientMessage) {
      this.createChatBotMessage = createChatBotMessage;
      this.setState = setStateFunc;
      this.createClientMessage = createClientMessage;
    }

    greet() {
        const greetingMessage = this.createChatBotMessage("Hi, friend.")
        this.updateChatbotState(greetingMessage)
    }

    updateChatbotState(message) {
        this.setState(prevState => ({
            ...prevState, messages: [...prevState.messages, message]
        }));
    }

    handlePaymentstList = () => {
        const message = this.createChatBotMessage(
          "Fantastic, I've got the following resources for you on Payments:",
          {
            widget: "paymentsLinks",
          }
        );
    
        this.updateChatbotState(message);
    };

    handleEmptyMsg = () => {
        this.updateChatbotState(this.createChatBotMessage(
            "Please enter a valid message."
        ));
    }

    handleWorkOrders = () => {
        const message = this.createChatBotMessage(
            "Fantastic, I've got the following resources for you on Work Orders:",
            {
                widget: "workOrderLinks",
            }
        );
        this.updateChatbotState(message);
    }

    handleTenants = () => {
        const message = this.createChatBotMessage(
            "Fantastic, I've got the following resources for you on Tenant:",
            {
                widget: "tenantLinks",
            }
        );
        this.updateChatbotState(message);
    }

    handleSearch = (sentence) => {
        this.setState(state =>({
            ...state,
            sentence
        }));

        const message = this.createChatBotMessage(
            "Fantastic, I've got the following resources for your request:",
            {
              widget: "search",
            }
        );
      
        this.updateChatbotState(message);
    }

}
  
export default ActionProvider;