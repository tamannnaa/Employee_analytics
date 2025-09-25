from fastapi import FastAPI
from .routes import authroutes, employeeroutes, analyticsroutes, filesroutes, reportsroutes, customreportsroutes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Auth and Employee routes
app.include_router(authroutes.router)
app.include_router(employeeroutes.router)
app.include_router(analyticsroutes.router)
app.include_router(filesroutes.router)
app.include_router(reportsroutes.router)
app.include_router(customreportsroutes.router)

# Health Check
@app.get("/")
def health_check():
    return {"message": "Employee Analytics API is running successfully."}

