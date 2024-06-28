import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginForm from "./components/LoginForm.jsx";
import SignupForm from "./components/SignupForm.jsx";
import HomePage from "./components/HomePage.jsx";
import { UserContext } from "./UserContext.js";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </>
  );
}

export default App;
