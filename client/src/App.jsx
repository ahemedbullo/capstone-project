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
  const [currentProfile, setCurrentProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = window.localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.Authorization = token;
        try {
          const response = await axios.get(
            "http://localhost:3000/auth/profile"
          );
          setCurrentProfile(response.data.user);
        } catch (error) {
          navigate("/");
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {

    window.localStorage.removeItem("token");
    axios.defaults.headers.Authorization = null;
    setCurrentProfile(null);
    navigate("/");
  };
  return (
    <UserContext.Provider value={{ currentProfile, setCurrentProfile }}>
      <Routes>
        {currentProfile ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </>
        )}
      </Routes>
      {/* {currentProfile && <button onClick={handleLogout}>Logout</button>} */}
    </UserContext.Provider>
  );
}
export default App;
