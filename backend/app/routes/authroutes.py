from fastapi import APIRouter,HTTPException,Depends,Header
from app.models import Logindetails,Registerdetails,UpdateEmployee
from app.utils.auth import hashpass, verifypass,createtoken,decodetoken
from app.database import get_database
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
security=HTTPBearer()
from bson import ObjectId

router=APIRouter(prefix="/auth",tags=["Auth"])

db=get_database()
empcollection=db["employees"]


@router.post("/login")
def login(data:Logindetails):
    user=empcollection.find_one({"email":data.email})
    if not user or not verifypass(data.password,user["hashed_password"]):
        raise HTTPException(status_code=401,detail="Invalid Credentials")
    
    token=createtoken(({"sub":user["email"]}))
    return {"message":"Login successful","token":token}

@router.post("/register")
def register(data:Registerdetails):
    if(empcollection.find_one({"email":data.email})):
        raise HTTPException(status_code=401,detail="User already registered")
    
    hashedpw=hashpass(data.password)
    user={
        "name":data.name,
        "email":data.email,
        "hashed_password":hashedpw
    }
    empcollection.insert_one(user)
    token=createtoken({"sub":data.email})
    return {"message":"Registration succesful","token":token}

@router.post("/logout")
def logout():
    return {"message":"logged out successfully","token":"trial token"}

@router.get("/me")
def getProfile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    decoded_payload = decodetoken(token)
    email = decoded_payload.get("sub") if decoded_payload else None
    
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = empcollection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User Not Found")
    
    # Convert ObjectId to str and remove sensitive fields
    user["id"] = str(user.pop("_id", ""))
    user.pop("hashed_password", None)

    return {
        **user,
        "message": "Profile retrieved"
    }


@router.put("/profile")
def updateProfile(data: UpdateEmployee, Authorization: str = Header(...)):
    token = Authorization.replace("Bearer ", "").strip()
    decoded_payload = decodetoken(token)
    email = decoded_payload.get("sub") if decoded_payload else None

    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = empcollection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update all fields
    result = empcollection.update_one({"email": email}, {"$set": data.dict()})

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes made")
    
    return {"message": "Profile updated", "newdata": data}

@router.post("/reset-password")
def resetPassword(email:str):
    user = empcollection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return {"message": f"Password reset link sent to {email}"}