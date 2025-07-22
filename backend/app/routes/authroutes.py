from fastapi import APIRouter,HTTPException,Depends
from models import Logindetails,Registerdetails,Updateprofiledetails
from utils/auth.py

router=APIRouter(prefix="/auth",tags=["Auth"])

@router.post("/login")
def login(data:Logindetails):
    if data.email=="abc@gmail.com" and data.password=="abc123":
        return {"message":"Login successful","token":"trial token"}
    return HTTPException(status_code=401,detail="Invalid credentials")

@router.post("/register")
def register(data:Registerdetails):
    return {"message":"registration successful","token":"trial token"}

@router.post("/logout")
def logout():
    return {"message":"logged out successfully","token":"trial token"}

@router.get("/me")
def getProfile():
    return {"name":"employee 1","email":"employee1@gmail.com","message":"Dummy profile","token":"trial token"}

@router.put("/profile")
def updateProfile(data:Updateprofiledetails):
    return {"message":"profile updated","newdata":data}

@router.post("/reset-password")
def resetPassword(email:str):
    return {"message":f"password reset link sent to {email}"}