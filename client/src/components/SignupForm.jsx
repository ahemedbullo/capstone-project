import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/signup", {
        user: username,
        password: password,
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <>
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="paswword"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
};

export default SignupForm;