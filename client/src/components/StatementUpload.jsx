import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext.js";
import ConfirmStatementModal from "./ConfirmStatementModal.jsx";

const StatementUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedExpenses, setParsedExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentProfile } = useContext(UserContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("statement", file);

    try {
      const response = await axios.post(
        `http://localhost:3000/statement/parse-statement/${currentProfile}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(
        `Statement parsed successfully. ${response.data.count} expenses found.`
      );
      fetchParsedExpenses();
    } catch (error) {
      console.error("Error uploading and parsing statement:", error);
      alert("An error occurred while processing the statement.");
    } finally {
      setUploading(false);
    }
  };

  const fetchParsedExpenses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/statement/review-expenses/${currentProfile}`
      );
      setParsedExpenses(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching parsed expenses:", error);
      alert("An error occurred while fetching parsed expenses.");
    }
  };

  const handleConfirm = async (confirmedExpenses) => {
    try {
      await axios.post(
        `http://localhost:3000/statement/confirm-expenses/${currentProfile}`,
        { confirmedExpenses }
      );
      alert("Expenses confirmed and added successfully.");
      setIsModalOpen(false);
      setParsedExpenses([]);
    } catch (error) {
      console.error("Error confirming expenses:", error);
      alert("An error occurred while confirming expenses.");
    }
  };

  return (
    <div className="statement-upload">
      <h2>Upload Monthly Statement</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Processing..." : "Upload and Parse"}
      </button>

      {isModalOpen && (
        <ConfirmStatementModal
          expenses={parsedExpenses}
          onConfirm={handleConfirm}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StatementUpload;
