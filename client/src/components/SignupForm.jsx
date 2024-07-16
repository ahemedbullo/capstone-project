import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import "./Styles/SignupForm.css";

const SignupForm = () => {
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
      if (username.length <= 5) {
        setMessage("Username must be longer than 5 letters");
        return;
      }
      if (password.length <= 6) {
        setMessage("Password must be longer than 6 characters");
        return;
      }
      const response = await axios.post("http://localhost:3000/auth/signup", {
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
      window.localStorage.removeItem("token");
      axios.defaults.headers.Authorization = null;
      setCurrentProfile(null);
      navigate("/");
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
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <p>
            Already have an account ?<Link to={"/"}> Log in now.</Link>{" "}
          </p>
          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
};

export default SignupForm;
