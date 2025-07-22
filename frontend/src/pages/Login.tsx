import { useForm } from "react-hook-form";
import type { loginFormData } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import {  useAuth } from '../context/Authcontext';
import { login } from '../api/auth';

const Login = () => {
  const{register,handleSubmit}=useForm<loginFormData>();

  const context=useAuth();
  if(!context){
    throw new Error("Authcontext not found");
  }
  const{setUser}=context;
  
  const navigate=useNavigate();

  const submit=async(data:loginFormData)=>{
    try{
      const res=await login(data);
      localStorage.setItem("token",res.access_token);
      setUser(res.user);
      navigate("/");
    }
    catch(e){
      alert("Invalid credentials: "+e);
    }
  }


  return (
    <div>

      <form onSubmit={handleSubmit(submit)}>
        <h2>LOGIN</h2>
        <input {...register("email")} placeholder='Enter email' />
        <input {...register("password")} type='password' placeholder='Enter password' />
        <button type='submit'>Login</button>
      </form>



    </div>
  )
}

export default Login