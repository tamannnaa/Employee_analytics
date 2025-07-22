import { useForm } from 'react-hook-form'
import type { registerFormData } from '../types/auth'
import { useNavigate } from 'react-router-dom';
import {  useAuth } from '../context/Authcontext';
import { register as registeruser } from '../api/auth';

const Register = () => {
  const {register,handleSubmit}=useForm<registerFormData>();
  
  const context=useAuth();
  if(!context){
    throw new Error("Authcontext not found");
  }
  const{setUser}=context;
  
  const navigate=useNavigate();

  const submit=async(data:registerFormData)=>{
    try{
      const res=await registeruser(data);
      localStorage.setItem("token",res.access_token);
      setUser(res.user);
      navigate("/");
    }
    catch(e){
      alert("Registration failed: "+e);
    }
  }


  return (
    <div>

      <form onSubmit={handleSubmit(submit)}>
            <h2>REGISTER</h2>
            <input {...register("name")} placeholder='Enter name' />
            <input {...register("email")}  placeholder='Enter email' />
            <input {...register("password")} type="password" placeholder='Enter password' />
            <button type='submit'>Register</button>
        </form>

    </div>
  )
}

export default Register