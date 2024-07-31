import React from "react";
import "./Styles/GoalAchievedPopup.css";

const GoalAchievedPopup = ({ goal, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Congratulations!</h2>
        <p>You've achieved your savings goal:</p>
        <h3>{goal.name}</h3>
        <p>Target Amount: ${goal.targetAmount}</p>
        <p>Current Amount: ${goal.currentAmount}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default GoalAchievedPopup;
