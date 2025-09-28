import React, { useEffect, useState } from "react";
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

  useEffect(()=>{
    const token=localStorage.getItem("token");
    if(token){
      console.log("Token found, navigating to dashboard");
      navigate("/dashboard");
    }
    
  },[navigate])


  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Login button clicked");
  console.log("Login payload:", loginData);

  try {
    const res = await login(loginData);
    console.log("Login response:", res);
    localStorage.setItem("token", res.token);
    auth?.setUser(res);
    setMessage("Login successful!");
    console.log("Login successful, navigating to dashboard");

    navigate("/dashboard");
  } catch (err: any) {
    console.error("Login error object:", err);

    // Detailed message fallback
    if (err.response) {
      console.error("Backend response error:", err.response.data);
      setMessage(err.response.data.detail || "Login failed");
    } else if (err.request) {
      console.error("No response received:", err.request);
      setMessage("No response from server. Is backend running?");
    } else {
      console.error("Error setting up request:", err.message);
      setMessage(err.message || "Login failed");
    }
  }
};


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("register button clicked")
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
          <button type="button" className="btn register-btn" onClick={() => setIsRegisterActive(true)}>
            Register
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button type="button" className="btn login-btn" onClick={() => setIsRegisterActive(false)}>
            Login
          </button>
        </div>
      </div>

      {message && <div className="auth-message">{message}</div>}
    </div>
  );
};

export default AuthForm;
