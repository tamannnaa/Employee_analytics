from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from typing import Optional, List, Dict, Any

class Employee(BaseModel):
    employee_id: Optional[str]= None
    name: str
    email: str
    department: str
    position: str
    salary: float
    join_date: str
    performance_score: float
    is_active: bool
    skills: List[str]

class DepartmentSummary(BaseModel):
    department: str
    employee_count: int
    average_salary: float

class CustomReportRequest(BaseModel):
    department: Optional[str] = None
    is_active: Optional[bool] = None

class NewEmployee(BaseModel):
    employee_id: str
    name: str
    email: str
    department: str
    position: str
    salary: float
    join_date: str  
    performance_score: float
    is_active: bool
    skills: List[str]

class UpdateEmployee(BaseModel):
    name: Optional[str]
    email: Optional[str]
    department: Optional[str]
    position: Optional[str]
    salary: Optional[float]
    join_date: Optional[str]
    performance_score: Optional[float]
    is_active: Optional[bool]
    skills: Optional[List[str]]


class SalaryStats(BaseModel):
    department: str
    average_salary: float
    min_salary: float
    max_salary: float
    employee_count: int

class PerformanceStats(BaseModel):
    top_performers: List[str]

class Logindetails(BaseModel):
    email:str
    password:str

class Registerdetails(BaseModel):
    name:str
    email:str
    password:str

# Pydantic models for request/response
class DateRangeFilter(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    department: Optional[str] = None

class CustomQueryRequest(BaseModel):
    filters: Dict[str, Any]
    group_by: Optional[str] = None
    aggregation: Optional[str] = None