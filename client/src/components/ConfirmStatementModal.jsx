import React, { useState } from "react";
import "./Styles/ConfirmStatementModal.css";

const ConfirmStatementModal = ({ expenses, onConfirm, onClose }) => {
  const [editedExpenses, setEditedExpenses] = useState(expenses);

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...editedExpenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setEditedExpenses(updatedExpenses);
  };

  const handleDelete = (index) => {
    const updatedExpenses = editedExpenses.filter((_, i) => i !== index);
    setEditedExpenses(updatedExpenses);
  };

  const handleConfirm = () => {
    onConfirm(editedExpenses);
  };

  const handleOverlayClick = (event) => {
    if (event.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal-content">
        <button className="confirm-close-button" onClick={onClose}>
          X
        </button>
        <h2>Review Parsed Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {editedExpenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.date}</td>
                <td>
                  <input
                    type="text"
                    value={expense.description}
                    onChange={(e) =>
                      handleExpenseChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={expense.amount}
                    onChange={(e) =>
                      handleExpenseChange(
                        index,
                        "amount",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </td>
                <td>
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleConfirm} className="confirm-btn">
            Confirm Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStatementModal;
