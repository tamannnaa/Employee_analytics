from fastapi import APIRouter,HTTPException,Depends,Header
from app.models import Logindetails,Registerdetails,UpdateEmployee
from app.utils.auth import hashpass, verifypass,createtoken,decodetoken
from app.database import get_database
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
import re
from datetime import datetime
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
def register(data: Registerdetails):
    # Check if user already exists
    if empcollection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already registered")
    
    employee_id = get_next_employee_id()
    while empcollection.find_one({"employee_id": employee_id}):
        employee_id = f"EMP{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    hashedpw = hashpass(data.password)
    
    # Create user document with all required fields
    user = {
        "employee_id": employee_id,
        "name": data.name,
        "email": data.email,
        "hashed_password": hashedpw,
        "department": getattr(data, 'department', 'Unassigned'),
        "position": getattr(data, 'position', 'Employee'),
        "salary": getattr(data, 'salary', 0),
        "join_date": datetime.now().strftime("%Y-%m-%d"),
        "performance_score": getattr(data, 'performance_score', 0.0),
        "is_active": True,
        "skills": getattr(data, 'skills', []),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Insert user into database
    result = empcollection.insert_one(user)
    
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    # Create token
    token = createtoken({"sub": data.email})
    
    return {
        "message": "Registration successful",
        "token": token,
        "employee_id": employee_id,
        "user_id": str(result.inserted_id)
    }



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


# Get next employee id
def get_next_employee_id():
    """
    Generate the next available employee ID in format EMP001, EMP002, etc.
    """
    try:
        # Find all employee IDs that match the pattern EMP followed by numbers
        employees = list(empcollection.find(
            {"employee_id": {"$regex": r"^EMP\d+$"}}, 
            {"employee_id": 1}
        ))
        
        if not employees:
            return "EMP001"
        
        max_num = 0
        for emp in employees:
            match = re.match(r"EMP(\d+)", emp["employee_id"])
            if match:
                num = int(match.group(1))
                max_num = max(max_num, num)
        
        next_num = max_num + 1
        return f"EMP{next_num:03d}"  
        
    except Exception as e:
        print(f"Error generating employee ID: {e}")
        return f"EMP{datetime.now().strftime('%Y%m%d%H%M%S')}"  
