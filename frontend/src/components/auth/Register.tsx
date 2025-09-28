import React from "react";

interface Props {
  name: string;
  email: string;
  password: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const Register: React.FC<Props> = ({ name, email, password, onChange, onSubmit }) => (
  <div className="form-box register">
    <form onSubmit={onSubmit}>
      <h1>Registration</h1>
      <div className="input-box">
        <input type="text" placeholder="Name" name="name" required value={name} onChange={onChange} />
        <i className="bx bxs-user"></i>
      </div>
      <div className="input-box">
        <input type="email" placeholder="Email" name="email" required value={email} onChange={onChange} />
        <i className="bx bxs-envelope"></i>
      </div>
      <div className="input-box">
        <input type="password" placeholder="Password" name="password" required value={password} onChange={onChange} />
        <i className="bx bxs-lock-alt"></i>
      </div>
      <button type="submit" className="btn">Register</button>
      <p>or register with social platforms</p>
      <div className="social-icons">{/* Social links */}</div>
    </form>
  </div>
);

export default Register;
