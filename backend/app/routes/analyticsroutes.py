from fastapi import APIRouter, Depends, HTTPException
from ..database import get_database
from datetime import datetime  
import calendar
router = APIRouter(prefix="/analytics", tags=["Analytics"])

db = get_database()
empcollection = db["employees"]

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-stats")
def get_dashboard_stats():
    try:
        total_employees = empcollection.count_documents({})

        # Example: projects might come from another collection
        active_projects = 15  

        # Average salary
        avg_salary_doc = empcollection.aggregate([
            {"$group": {"_id": None, "avgSalary": {"$avg": "$salary"}}}
        ])
        avg_salary = next(avg_salary_doc, {}).get("avgSalary", 0)

        # ✅ Dynamic new hires for the current month
        now = datetime.utcnow()
        first_day = datetime(now.year, now.month, 1)
        last_day = datetime(now.year, now.month, calendar.monthrange(now.year, now.month)[1])

        new_hires = empcollection.count_documents({
            "hire_date": {"$gte": first_day, "$lte": last_day}
        })

        # Attrition: employees with status = "inactive"
        total_inactive = empcollection.count_documents({"status": "inactive"})
        attrition_rate = (total_inactive / total_employees) if total_employees > 0 else 0

        # Top department
        dept_pipeline = empcollection.aggregate([
            {"$group": {"_id": "$department", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ])
        top_dept_doc = next(dept_pipeline, {})
        top_department = top_dept_doc.get("_id", "N/A")

        return {
            "total_employees": total_employees,
            "active_projects": active_projects,
            "average_salary": round(avg_salary, 2),
            "new_hires_this_month": new_hires,
            "attrition_rate": round(attrition_rate, 2),
            "top_department": top_department,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
