import React from "react";

import "./LearningOptions.css";

const LearningOptions = (props) => {
  const options = [
    { 
      text: "Payments", 
      handler: props.actionProvider.handlePaymentstList, 
      id: 1 
    },
    { 
      text: "Work Orders", 
      handler: props.actionProvider.handleWorkOrders, 
      id: 2 
    },
    { 
      text: "Tenant", 
      handler: props.actionProvider.handleTenants,
      id: 3 
    },
  ];

  const optionsMarkup = options.map((option) => (
    <button
      className="learning-option-button"
      key={option.id}
      onClick={option.handler}
    >
      {option.text}
    </button>
  ));

  return <div className="learning-options-container">{optionsMarkup}</div>;
};

export default LearningOptions;