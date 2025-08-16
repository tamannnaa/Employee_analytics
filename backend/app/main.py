from fastapi import FastAPI
from .routes import authroutes, employeeroutes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Auth and Employee routes
app.include_router(authroutes.router)
app.include_router(employeeroutes.router)

# Health Check
@app.get("/")
def health_check():
    return {"message": "Employee Analytics API is running successfully."}
