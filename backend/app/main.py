from fastapi import FastAPI, HTTPException
from . import crud, excel_generator, models
from .routes import authroutes
from fastapi.responses import FileResponse,JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Auth routes
app.include_router(authroutes.router)

# Health Check
@app.get("/")
def health_check():
    return {"message": "Employee Analytics API is running successfully."}

# Get All Employees
@app.get("/employees")
def get_employees():
    return crud.get_all_employees()

# Get Specific Employee
@app.get("/employees/{employee_id}")
def get_employee(employee_id: str):
    employee = crud.get_employee_by_id(employee_id)
    if employee:
        return employee
    raise HTTPException(status_code=404, detail="Employee not found")

# Get All Departments
@app.get("/departments")
def get_departments():
    return crud.get_all_departments()

# Filter Employees with department
@app.get("/employees/department/{dept}")
def get_employees_by_department(dept: str):
    return crud.get_employees_by_department(dept)

# Generate Excel Report
@app.post("/reports/excel")
def download_full_report():
    employees = crud.get_all_employees()

    # No Data After Filtering
    if not employees:
        raise HTTPException(status_code=404, detail="No employee data found")

    # Generate And Return File
    filepath = excel_generator.generate_employee_report(employees)
    return FileResponse(filepath, filename="employee_report.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


# Custom Filtered Excel Report
@app.post("/reports/custom")
def download_custom_report(request: models.CustomReportRequest):
    employees = crud.get_all_employees()

    # Filter By Department
    if request.department:
        employees = [emp for emp in employees if emp["department"].lower() == request.department.lower()]
    
    # Filter By Activity Status
    if request.is_active is not None:
        employees = [emp for emp in employees if emp["is_active"] == request.is_active]

    # No Data After Filtering
    if not employees:
        raise HTTPException(status_code=404, detail="No employee data matching filters")

    # Generate And Return File
    filepath = excel_generator.generate_employee_report(employees)
    return FileResponse(filepath, filename="custom_report.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# Salary Statistics by Department
@app.get("/analytics/salary-stats", response_model=list[models.SalaryStats])
def salary_stats():
    stats = crud.get_salary_stats()
    return stats

# Performance Analytics
@app.get("/analytics/performance", response_model=models.PerformanceStats)
def performance_analytics():
    top_performers = crud.get_top_performers()
    return {"top_performers": top_performers}

# Add New Employee
@app.post("/employees")
def create_employee(employee: models.NewEmployee):
    crud.add_employee(employee)
    return {"message": "Employee added successfully"}

# Update Employee
@app.put("/employees/{employee_id}")
def update_employee(employee_id: str, updates: models.UpdateEmployee):
    updates_dict = {k: v for k, v in updates.dict().items() if v is not None}

    if not updates_dict:
        raise HTTPException(status_code=400, detail="No updates provided")

    modified_count = crud.update_employee(employee_id, updates_dict)

    if modified_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found or no changes made")

    return {"message": "Employee updated successfully"}
