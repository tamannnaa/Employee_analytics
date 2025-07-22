import {  createContext, useContext, useEffect, useState } from "react";
import type { AuthContextType, childrenNode, User } from "../types/auth";
import { getuser } from "../api/auth";

export const AuthContext=createContext<AuthContextType|null>(null);


export const AuthProvider=({children}:childrenNode)=>{
    const [user,setUser]=useState<User|null>(null);
    const [loading,setLoading]=useState(true);

    const loaduser=async()=>{
        const data=await getuser();
        if(data){
            setUser(data);
        }
        else{
            setUser(null);
        }
        setLoading(false);
    }

    useEffect(()=>{
        const token=localStorage.getItem("token");
        if(token){
            loaduser();
        }
        else{
            setLoading(false);
        }
    },[])

    return(
       <AuthContext.Provider value={{user,loading,setUser}}>{children}</AuthContext.Provider>
    )
}


export const useAuth = () => useContext(AuthContext);
