from fastapi import APIRouter, Depends, HTTPException, Query
from ..database import get_database
from datetime import datetime, timedelta
import calendar
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from ..models import CustomQueryRequest, DateRangeFilter
import os

db = get_database()
empcollection = db["employees"]

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-stats")
def get_dashboard_stats(
    department: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Get main dashboard KPIs with optional filters"""
    try:
        # Build base filter
        # base_filter = {"is_active": True}
        base_filter = {}
        if department and department != "all":
            base_filter["department"] = department

        # Date filter for hire_date
        date_filter = {}
        if start_date and end_date:
            date_filter = {
                "join_date": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }

        # Total active employees
        total_employees = empcollection.count_documents(base_filter)

        # Active projects (you might want to create a projects collection)
        active_projects = 28  # Mock for now, replace with actual projects count

        # Average salary
        salary_pipeline = [
            {"$match": base_filter},
            {"$group": {"_id": None, "avgSalary": {"$avg": "$salary"}}}
        ]
        avg_salary_result = list(empcollection.aggregate(salary_pipeline))
        avg_salary = avg_salary_result[0]["avgSalary"] if avg_salary_result else 0

        # New hires this month
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1).strftime("%Y-%m-%d")
        month_end = datetime(now.year, now.month, calendar.monthrange(now.year, now.month)[1]).strftime("%Y-%m-%d")
        
        hire_filter = base_filter.copy()
        hire_filter.update({
            "join_date": {"$gte": month_start, "$lte": month_end}
        })
        new_hires = empcollection.count_documents(hire_filter)

        # Attrition rate (inactive employees)
        total_all = empcollection.count_documents({} if not department or department == "all" else {"department": department})
        inactive_count = empcollection.count_documents({
            "is_active": False,
            **({"department": department} if department and department != "all" else {})
        })
        attrition_rate = (inactive_count / total_all * 100) if total_all > 0 else 0

        # Top performing department
        dept_performance = list(empcollection.aggregate([
            {"$match": {"is_active": True}},
            {"$group": {
                "_id": "$department",
                "avg_performance": {"$avg": "$performance_score"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"avg_performance": -1}},
            {"$limit": 1}
        ]))
        top_department = dept_performance[0]["_id"] if dept_performance else "N/A"

        return {
            "total_employees": total_employees,
            "active_projects": active_projects,
            "average_salary": round(avg_salary, 2),
            "new_hires_this_month": new_hires,
            "attrition_rate": round(attrition_rate, 2),
            "top_department": top_department
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

@router.get("/salary-distribution")
def get_salary_distribution(department: Optional[str] = Query(None)):
    """Get salary distribution data for histograms"""
    try:
        base_filter = {"is_active": True}
        if department and department != "all":
            base_filter["department"] = department

        # Define salary ranges
        salary_ranges = [
            {"range": "30k-40k", "min": 30000, "max": 40000},
            {"range": "40k-50k", "min": 40000, "max": 50000},
            {"range": "50k-60k", "min": 50000, "max": 60000},
            {"range": "60k-80k", "min": 60000, "max": 80000},
            {"range": "80k-100k", "min": 80000, "max": 100000},
            {"range": "100k+", "min": 100000, "max": float('inf')}
        ]

        distribution = []
        for range_data in salary_ranges:
            filter_query = base_filter.copy()
            if range_data["max"] == float('inf'):
                filter_query["salary"] = {"$gte": range_data["min"]}
            else:
                filter_query["salary"] = {"$gte": range_data["min"], "$lt": range_data["max"]}
            
            count = empcollection.count_documents(filter_query)
            distribution.append({
                "range": range_data["range"],
                "count": count
            })

        # Additional salary statistics
        salary_stats = list(empcollection.aggregate([
            {"$match": base_filter},
            {"$group": {
                "_id": None,
                "min_salary": {"$min": "$salary"},
                "max_salary": {"$max": "$salary"},
                "avg_salary": {"$avg": "$salary"},
                "median_salary": {"$push": "$salary"}
            }}
        ]))

        stats = {}
        if salary_stats:
            salaries = sorted(salary_stats[0]["median_salary"])
            median_idx = len(salaries) // 2
            median = salaries[median_idx] if salaries else 0
            
            stats = {
                "min_salary": salary_stats[0]["min_salary"],
                "max_salary": salary_stats[0]["max_salary"],
                "avg_salary": round(salary_stats[0]["avg_salary"], 2),
                "median_salary": median
            }

        return {
            "distribution": distribution,
            "statistics": stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching salary distribution: {str(e)}")

@router.get("/department-performance")
def get_department_performance():
    """Get department-wise performance metrics"""
    try:
        pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {
                "_id": "$department",
                "employee_count": {"$sum": 1},
                "avg_salary": {"$avg": "$salary"},
                "avg_performance": {"$avg": "$performance_score"},
                "total_performance": {"$sum": "$performance_score"},
                "skills": {"$push": "$skills"}
            }},
            {"$sort": {"employee_count": -1}}
        ]

        departments = list(empcollection.aggregate(pipeline))
        
        result = []
        for dept in departments:
            # Flatten skills array
            all_skills = []
            for skill_list in dept["skills"]:
                all_skills.extend(skill_list)
            
            # Count unique skills
            unique_skills = len(set(all_skills))
            
            result.append({
                "name": dept["_id"],
                "employees": dept["employee_count"],
                "avgSalary": round(dept["avg_salary"], 2),
                "performance": round(dept["avg_performance"], 2),
                "totalPerformance": round(dept["total_performance"], 2),
                "uniqueSkills": unique_skills
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching department performance: {str(e)}")

@router.get("/hiring-trends")
def get_hiring_trends(months: int = Query(12, description="Number of months to analyze")):
    """Get hiring and departure trends over time"""
    try:
        # Get date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=months * 30)

        # Generate month labels
        current_date = start_date
        monthly_data = []
        
        while current_date < end_date:
            month_start = current_date.replace(day=1)
            next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
            month_end = next_month - timedelta(days=1)
            
            month_label = month_start.strftime("%b")
            
            # Count new hires
            hires = empcollection.count_documents({
                "join_date": {
                    "$gte": month_start.strftime("%Y-%m-%d"),
                    "$lte": month_end.strftime("%Y-%m-%d")
                }
            })
            
            # Count departures (assuming you have a departure_date field or is_active changes)
            # For now, using a mock calculation based on inactive employees
            departures = max(0, hires - (hires * 0.85))  # Mock: 85% retention
            
            monthly_data.append({
                "month": month_label,
                "hires": int(hires),
                "departures": int(departures),
                "net_growth": int(hires - departures)
            })
            
            current_date = next_month

        return monthly_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching hiring trends: {str(e)}")

@router.get("/retention-rate")
def get_retention_rate(department: Optional[str] = Query(None)):
    """Calculate employee retention rates"""
    try:
        base_filter = {}
        if department and department != "all":
            base_filter["department"] = department

        # Total employees ever hired
        total_hired = empcollection.count_documents(base_filter)
        
        # Currently active employees
        active_employees = empcollection.count_documents({**base_filter, "is_active": True})
        
        # Retention rate
        retention_rate = (active_employees / total_hired * 100) if total_hired > 0 else 0

        # Retention by department
        dept_retention = list(empcollection.aggregate([
            {"$match": base_filter},
            {"$group": {
                "_id": "$department",
                "total": {"$sum": 1},
                "active": {"$sum": {"$cond": ["$is_active", 1, 0]}}
            }},
            {"$project": {
                "department": "$_id",
                "retention_rate": {
                    "$multiply": [
                        {"$divide": ["$active", "$total"]},
                        100
                    ]
                },
                "total_employees": "$total",
                "active_employees": "$active"
            }}
        ]))

        # Retention by tenure
        tenure_retention = []
        tenure_ranges = [
            {"label": "0-1 year", "months": 12},
            {"label": "1-2 years", "months": 24},
            {"label": "2-5 years", "months": 60},
            {"label": "5+ years", "months": float('inf')}
        ]

        current_date = datetime.utcnow()
        for tenure in tenure_ranges:
            if tenure["months"] == float('inf'):
                cutoff_date = datetime(2000, 1, 1)  # Very old date
            else:
                cutoff_date = current_date - timedelta(days=tenure["months"] * 30)
            
            total_in_range = empcollection.count_documents({
                **base_filter,
                "join_date": {"$lte": cutoff_date.strftime("%Y-%m-%d")}
            })
            
            active_in_range = empcollection.count_documents({
                **base_filter,
                "join_date": {"$lte": cutoff_date.strftime("%Y-%m-%d")},
                "is_active": True
            })
            
            rate = (active_in_range / total_in_range * 100) if total_in_range > 0 else 0
            
            tenure_retention.append({
                "tenure": tenure["label"],
                "retention_rate": round(rate, 2),
                "total_employees": total_in_range
            })

        return {
            "overall_retention_rate": round(retention_rate, 2),
            "total_hired": total_hired,
            "active_employees": active_employees,
            "department_retention": dept_retention,
            "tenure_retention": tenure_retention
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating retention rate: {str(e)}")

@router.get("/performance-trends")
def get_performance_trends(
    months: int = Query(6, description="Number of months to analyze"),
    department: Optional[str] = Query(None)
):
    """Get performance trends over time"""
    try:
        base_filter = {"is_active": True}
        if department and department != "all":
            base_filter["department"] = department

        # For this example, we'll create monthly performance averages
        # In a real scenario, you might have performance review dates
        end_date = datetime.utcnow()
        monthly_performance = []
        
        for i in range(months):
            month_date = end_date - timedelta(days=i * 30)
            month_label = month_date.strftime("%b")
            
            # Get average performance for the period
            # This is simplified - you'd typically have performance review dates
            performance_data = list(empcollection.aggregate([
                {"$match": base_filter},
                {"$group": {
                    "_id": None,
                    "avg_score": {"$avg": "$performance_score"},
                    "count": {"$sum": 1}
                }}
            ]))
            
            avg_score = performance_data[0]["avg_score"] if performance_data else 0
            
            # Add some variation for demonstration (remove in production)
            import random
            variation = random.uniform(-0.2, 0.2)
            adjusted_score = max(1.0, min(5.0, avg_score + variation))
            
            monthly_performance.insert(0, {
                "month": month_label,
                "score": round(adjusted_score, 2),
                "employee_count": performance_data[0]["count"] if performance_data else 0
            })

        # Performance distribution
        score_ranges = [
            {"range": "1.0-2.0", "min": 1.0, "max": 2.0},
            {"range": "2.0-3.0", "min": 2.0, "max": 3.0},
            {"range": "3.0-4.0", "min": 3.0, "max": 4.0},
            {"range": "4.0-5.0", "min": 4.0, "max": 5.0}
        ]

        performance_distribution = []
        for range_data in score_ranges:
            filter_query = base_filter.copy()
            filter_query["performance_score"] = {"$gte": range_data["min"], "$lt": range_data["max"]}
            count = empcollection.count_documents(filter_query)
            
            performance_distribution.append({
                "range": range_data["range"],
                "count": count
            })

        return {
            "monthly_trends": monthly_performance,
            "performance_distribution": performance_distribution
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching performance trends: {str(e)}")

@router.post("/custom-query")
def execute_custom_query(query_request: CustomQueryRequest):
    """Execute custom analytics queries"""
    try:
        # Build aggregation pipeline based on request
        pipeline = []
        
        # Add match stage if filters provided
        if query_request.filters:
            pipeline.append({"$match": query_request.filters})
        
        # Add grouping if specified
        if query_request.group_by:
            group_stage = {"$group": {"_id": f"${query_request.group_by}"}}
            
            # Add aggregation
            if query_request.aggregation == "count":
                group_stage["$group"]["count"] = {"$sum": 1}
            elif query_request.aggregation == "avg_salary":
                group_stage["$group"]["avg_salary"] = {"$avg": "$salary"}
            elif query_request.aggregation == "avg_performance":
                group_stage["$group"]["avg_performance"] = {"$avg": "$performance_score"}
            else:
                group_stage["$group"]["count"] = {"$sum": 1}  # default
            
            pipeline.append(group_stage)
        
        # Execute query
        result = list(empcollection.aggregate(pipeline))
        
        return {
            "query": query_request.dict(),
            "results": result,
            "count": len(result)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing custom query: {str(e)}")

# Additional utility endpoints

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
from io import BytesIO
import pandas as pd
import json

@router.get("/export-data")
def export_analytics_data(
    data_type: str = Query(..., description="Type of data to export"),
    format: str = Query("json", regex="^(json|csv|xlsx)$", description="Export format"),
    department: Optional[str] = Query(None)
):
    """Export analytics data in various formats (JSON, CSV, Excel)"""
    try:
        base_filter = {"is_active": True}
        if department and department != "all":
            base_filter["department"] = department

        if data_type == "employees":
            data = list(empcollection.find(base_filter, {"_id": 0}))
        elif data_type == "departments":
            data = get_department_performance()
        elif data_type == "salary":
            data = get_salary_distribution(department)
        else:
            raise HTTPException(status_code=400, detail="Invalid data type")

        if not data:
            raise HTTPException(status_code=404, detail=f"No {data_type} data found")

        # Generate filename with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename_base = f"hr_analytics_{data_type}_{timestamp}"

        if format == "json":
            # Return JSON response
            json_data = {
                "data": data,
                "format": format,
                "export_date": datetime.utcnow().isoformat(),
                "record_count": len(data) if isinstance(data, list) else 1
            }
            
            json_str = json.dumps(json_data, indent=2, default=str)
            buf = BytesIO(json_str.encode('utf-8'))
            buf.seek(0)
            
            return StreamingResponse(
                buf,
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={filename_base}.json"}
            )

        elif format in ["csv", "xlsx"]:
            # Convert data to DataFrame
            if isinstance(data, list) and len(data) > 0:
                df = pd.DataFrame(data)
            else:
                # Handle non-list data (like department performance summary)
                if isinstance(data, dict):
                    df = pd.DataFrame([data])
                else:
                    df = pd.DataFrame(data)
            
            buf = BytesIO()

            if format == "xlsx":
                # Create Excel file
                with pd.ExcelWriter(buf, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False, sheet_name=data_type.capitalize())
                    
                    # Add metadata sheet
                    metadata_df = pd.DataFrame([{
                        'Export Date': datetime.utcnow().isoformat(),
                        'Data Type': data_type,
                        'Department Filter': department if department else 'All',
                        'Record Count': len(df)
                    }])
                    metadata_df.to_excel(writer, index=False, sheet_name='Export Info')
                
                buf.seek(0)
                return StreamingResponse(
                    buf,
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": f"attachment; filename={filename_base}.xlsx"}
                )
            
            else:  # CSV format
                df.to_csv(buf, index=False)
                buf.seek(0)
                return StreamingResponse(
                    buf,
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename={filename_base}.csv"}
                )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")
    
# @router.get("/export-data")
# def export_analytics_data(
#     data_type: str = Query(..., description="Type of data to export"),
#     format: str = Query("json", description="Export format"),
#     department: Optional[str] = Query(None)
# ):
#     """Export analytics data in various formats"""
#     try:
#         base_filter = {"is_active": True}
#         if department and department != "all":
#             base_filter["department"] = department

#         if data_type == "employees":
#             data = list(empcollection.find(base_filter, {"_id": 0}))
#         elif data_type == "departments":
#             data = get_department_performance()
#         elif data_type == "salary":
#             data = get_salary_distribution(department)
#         else:
#             raise HTTPException(status_code=400, detail="Invalid data type")

#         # In a real implementation, you'd convert to CSV/Excel here
#         return {
#             "data": data,
#             "format": format,
#             "export_date": datetime.utcnow().isoformat(),
#             "record_count": len(data) if isinstance(data, list) else 1
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")

@router.get("/health")
def analytics_health_check():
    """Health check endpoint for analytics service"""
    try:
        # Test database connection
        count = empcollection.count_documents({})
        return {
            "status": "healthy",
            "database": "connected",
            "total_records": count,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")