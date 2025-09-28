import React from "react";

interface Props {
  email: string;
  password: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const Login: React.FC<Props> = ({ email, password, onChange, onSubmit }) => (
  <div className="form-box login">
    <form onSubmit={onSubmit}>
      <h1>Login</h1>
      <div className="input-box">
        <input type="email" placeholder="Email" name="email" required value={email} onChange={onChange} />
        <i className="bx bxs-user"></i>
      </div>
      <div className="input-box">
        <input type="password" placeholder="Password" name="password" required value={password} onChange={onChange} />
        <i className="bx bxs-lock-alt"></i>
      </div>
      <div className="forgot-link">
        <a href="#">Forgot Password?</a>
      </div>
      <button type="submit" className="btn">Login</button>
      <p>or login with social platforms</p>
      <div className="social-icons">{/* Social links */}</div>
    </form>
  </div>
);

export default Login;
