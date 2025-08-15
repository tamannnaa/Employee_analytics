import React, { useState } from "react";
import "../css/loginsignup.css"
import Register from "./Register";
import Login from "./Login";
import { login,register } from "../api/auth";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

const AuthForm: React.FC = () => {
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();


  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(loginData);
      localStorage.setItem("token", res.token);
      auth?.setUser(res); // optionally set user context
      setMessage("Login successful!");

      navigate("/dashboard"); 
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await register(registerData);
      localStorage.setItem("token", res.token);
      auth?.setUser(res);
      setMessage("Registration successful!");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className={`container ${isRegisterActive ? "active" : ""}`}>
      <Login
        email={loginData.email}
        password={loginData.password}
        onChange={handleLoginChange}
        onSubmit={handleLogin}
      />
      <Register
        name={registerData.name}
        email={registerData.email}
        password={registerData.password}
        onChange={handleRegisterChange}
        onSubmit={handleRegister}
      />

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={() => setIsRegisterActive(true)}>
            Register
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={() => setIsRegisterActive(false)}>
            Login
          </button>
        </div>
      </div>

      {message && <div className="auth-message">{message}</div>}
    </div>
  );
};

export default AuthForm;
