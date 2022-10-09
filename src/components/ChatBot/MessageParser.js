

class MessageParser {
    constructor(actionProvider, state) {
      this.actionProvider = actionProvider;
      this.state = state;
    }
  
    parse(message) {
        const lowerCaseMessage = message.toLowerCase();

        if(lowerCaseMessage === ''){
            this.actionProvider.handleEmptyMsg();
            return;
        }

        this.actionProvider.handleSearch(lowerCaseMessage);
    }
}
  
export default MessageParser;