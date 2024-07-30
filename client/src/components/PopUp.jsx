import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/PopUp.css";

const PopUp = ({ onClose }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleGetStarted = () => {
    onClose();
    if (selectedOption === "expenses") {
      navigate("/expenses");
    } else if (selectedOption === "budget") {
      navigate("/budgets");
    } else if (selectedOption === "balance") {
      navigate("/profile");
    } else {
      navigate("home");
    }
  };

  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup">
        <h2>Welcome to SaveSmart!</h2>
        <p>
          It looks like you're just getting started. What would you like to do
          first?
        </p>
        <div className="option-buttons">
          <button
            className={`option-button ${
              selectedOption === "expenses" ? "selected" : ""
            }`}
            onClick={() => handleOptionSelect("expenses")}
          >
            Add Expenses
          </button>
          <button
            className={`option-button ${
              selectedOption === "budget" ? "selected" : ""
            }`}
            onClick={() => handleOptionSelect("budget")}
          >
            Create a Budget
          </button>
          <button
            className={`option-button ${
              selectedOption === "balance" ? "selected" : ""
            }`}
            onClick={() => handleOptionSelect("balance")}
          >
            Add Account Balance
          </button>
        </div>
        <div className="action-buttons">
          <button
            className="get-started-button"
            onClick={handleGetStarted}
            disabled={!selectedOption}
          >
            Get Started
          </button>
          <button className="skip-button" onClick={onClose}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
