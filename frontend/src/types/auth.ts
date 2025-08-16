import type React from "react";
export interface User{
    employee_id: string
    name: string
    email: string
    department: string
    position: string
    salary: number
    join_date: string
    performance_score: number
    is_active: boolean
    skills: string[]
}
export interface loginFormData{
    email:string;
    password:string;
}
export interface registerFormData extends loginFormData{
    name:string;
}
export type childrenNode={
    children:React.ReactNode
}
export interface AuthContextType {
  user: User|null;
  loading: boolean;
  setUser: React.Dispatch<User|null>;
}
export interface ProfileData {
  employee_id?: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  salary?: number;
  join_date?: string;
  performance_score?: number;
  is_active?: boolean;
  skills?: string[];
}
