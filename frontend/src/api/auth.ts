import { api } from "./axios";
import type { loginFormData,registerFormData } from "../types/auth";

export const login=async(data:loginFormData)=>{
    const res=await api.post("/auth/login",data);
    return res.data;

}
export const register=async(data:registerFormData)=>{
    const res=await api.post("/auth/register",data);
    return res.data;
}
export const getuser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateProfile = async (name: string, email: string) => {
  const token = localStorage.getItem("token");
  const res = await api.put(
    "/auth/profile",
    { name, email },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const resetPassword = async (email: string) => {
  const res = await api.post("/auth/reset-password", null, {
    params: { email }
  });
  return res.data;
};
