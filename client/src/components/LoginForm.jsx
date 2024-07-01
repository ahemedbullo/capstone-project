import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import "./Styles/LoginForm.css";
const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { setCurrentProfile } = useContext(UserContext);
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        user: username,
        password: password,
      });
      const token = response.data.token;
      window.localStorage.setItem("token", token);
      setMessage(response.data.message);
      const responseToUser = await axios.get(
        "http://localhost:3000/auth/profile",
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setCurrentProfile(responseToUser.data.user);
      navigate("/home");
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="username">
            <label>Username: </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div className="password">
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <p>
            New to sfx?<Link to={"/signup"}> Sign up now.</Link>{" "}
          </p>
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
};

export default LoginForm;
