from passlib.context import CryptContext
from jose import jwt,JWTError
from datetime import datetime,timedelta
from dotenv import load_dotenv
import os
load_dotenv()

secretkey=os.getenv("SECRET_KEY")
algo=os.getenv("ALGORITHM")
tokenexpire=int(os.getenv("TOKEN_EXPIRE", 60))

context=CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashpass(password:str)->str:
    return context.hash(password)

def verifypass(input:str,hashed:str)->bool:
    return context.verify(input,hashed)

def createtoken(data:dict,expiredelta:timedelta=None):
    encoded=data.copy()
    expire=datetime.utcnow()+(expiredelta or timedelta(minutes=tokenexpire))
    encoded.update({"exp":expire})
    return jwt.encode(encoded,secretkey,algorithm=algo)

def decodetoken(token: str):
    try:
        decodedtoken = jwt.decode(token, secretkey, algorithms=[algo])
        return decodedtoken  # Return the dict, not just the "sub"
    except JWTError:
        return None
