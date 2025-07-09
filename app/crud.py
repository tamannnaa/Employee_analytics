from .database import get_database
from .models import Employee
from typing import List
from bson.objectid import ObjectId

# Fetch data
db = get_database()
employees_collection = db["employees"]

# Show all employees
def get_all_employees():
    employees = list(employees_collection.find({}, {"_id": 0}))
    return employees

# Shhow employees filtered by id
def get_employee_by_id(employee_id: str):
    employee = employees_collection.find_one({"employee_id": employee_id}, {"_id": 0})
    return employee

# Show all departments
def get_all_departments():
    departments = employees_collection.distinct("department")
    return departments

# Show departments filtered by department name
def get_employees_by_department(dept: str):
    employees = list(employees_collection.find({"department": dept}, {"_id": 0}))
    return employees

# Aggregate salary data per department
def get_salary_stats():
    pipeline = [
        {
            "$group": {
                "_id": "$department",
                "average_salary": {"$avg": "$salary"},
                "min_salary": {"$min": "$salary"},
                "max_salary": {"$max": "$salary"},
                "employee_count": {"$sum": 1}
            }
        }
    ]
    results = list(employees_collection.aggregate(pipeline))
    return [
        {
            "department": r["_id"],
            "average_salary": round(r["average_salary"], 2),
            "min_salary": r["min_salary"],
            "max_salary": r["max_salary"],
            "employee_count": r["employee_count"]
        }
        for r in results
    ]

# Find High Performers
def get_top_performers(threshold=4.5):
    query = {"performance_score": {"$gte": threshold}}
    results = list(employees_collection.find(query))
    return [emp["name"] for emp in results]

# Insert a New Employee
def add_employee(employee_data):
    employee_dict = employee_data.dict()
    employees_collection.insert_one(employee_dict)
    return str(employee_dict["employee_id"])

# Update an Existing Employee
def update_employee(employee_id, updates):
    result = employees_collection.update_one(
        {"employee_id": employee_id},
        {"$set": updates}
    )
    return result.modified_count
