from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid
import os
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from ..database import get_database
from ..excel_generator import (
    generate_comprehensive_report, 
    generate_performance_report,
    generate_salary_report,
    generate_department_report,
    generate_executive_report
)

router = APIRouter(prefix="/reports", tags=["Reporting System"])
db = get_database()
employees_collection = db["employees"]
reports_collection = db["reports"]

# Ensure reports directory exists
REPORTS_DIRECTORY = Path("generated_reports")
REPORTS_DIRECTORY.mkdir(exist_ok=True)

# Enhanced report templates with generator functions
report_templates = [
    {
        "id": "template_1", 
        "name": "Comprehensive Employee Report", 
        "description": "Complete overview including personal details, performance metrics, salary information, and department statistics with interactive charts and summaries.",
        "generator": generate_comprehensive_report
    },
    {
        "id": "template_2", 
        "name": "Quarterly Performance Report", 
        "description": "Detailed analysis of employee performance trends, KPI achievements, goal completion rates, and performance distribution across departments.",
        "generator": generate_performance_report
    },
    {
        "id": "template_3", 
        "name": "Salary Distribution Report", 
        "description": "In-depth salary analysis including compensation trends, pay equity metrics, department comparisons, and budget allocation insights.",
        "generator": generate_salary_report
    },
    {
        "id": "template_4", 
        "name": "Department Overview Report", 
        "description": "Comprehensive departmental breakdown with headcount analysis, skill distribution, performance metrics, and resource allocation.",
        "generator": generate_department_report
    },
    {
        "id": "template_5", 
        "name": "Executive Summary Report", 
        "description": "High-level executive dashboard with key metrics, trends, and actionable insights for strategic decision making.",
        "generator": generate_executive_report
    }
]

# Pydantic Models for requests
class ReportGenerationRequest(BaseModel):
    template_id: str
    filters: Optional[Dict[str, Any]] = None
    scheduling: Optional[Dict[str, Any]] = None
    email_recipients: Optional[List[str]] = None

class ReportShareRequest(BaseModel):
    recipients: List[str]

class ReportScheduleRequest(BaseModel):
    template_id: str
    frequency: str  # daily, weekly, monthly
    recipients: List[str]
    filters: Optional[Dict[str, Any]] = None

@router.get("/templates")
async def get_report_templates():
    """Get all available report templates"""
    # Return templates without the generator function for JSON serialization
    return [
        {
            "id": template["id"],
            "name": template["name"],
            "description": template["description"]
        }
        for template in report_templates
    ]

def _generate_report_task(report_id: str, template_id: str, filters: Optional[Dict[str, Any]]):
    """Background task to generate report"""
    try:
        # Update status to generating
        reports_collection.update_one(
            {"_id": report_id},
            {"$set": {
                "status": "Generating",
                "updated_at": datetime.utcnow().isoformat()
            }}
        )

        # Get template info
        template = next((t for t in report_templates if t["id"] == template_id), None)
        if not template:
            raise Exception("Template not found")

        # Fetch employees data with filters
        query = filters or {}
        employees_cursor = employees_collection.find(query)
        employees = list(employees_cursor)

        if not employees:
            reports_collection.update_one(
                {"_id": report_id},
                {"$set": {
                    "status": "Failed", 
                    "message": "No employee data found for the specified criteria.",
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
            return

        # Convert to DataFrame and clean data
        df = pd.DataFrame(employees)
        
        # Remove MongoDB _id field if present
        if '_id' in df.columns:
            df = df.drop(columns=['_id'])
        
        # Handle list columns by converting to strings
        for col in df.columns:
            if df[col].apply(lambda x: isinstance(x, list)).any():
                df[col] = df[col].apply(lambda x: ", ".join(map(str, x)) if isinstance(x, list) else x)

        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{template['name'].replace(' ', '_').lower()}_{timestamp}.xlsx"
        filepath = REPORTS_DIRECTORY / filename

        # Generate the Excel file using the appropriate generator
        try:
            generator_func = template["generator"]
            final_path = generator_func(df, str(filepath))
            
            # Verify file was created
            if not Path(final_path).exists():
                raise Exception("Report file was not created successfully")
                
        except Exception as e:
            raise Exception(f"Excel generation failed: {str(e)}")

        # Update database with completion
        reports_collection.update_one(
            {"_id": report_id},
            {"$set": {
                "status": "Completed",
                "file_path": str(final_path),
                "file_name": filename,
                "generated_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "message": None
            }}
        )

    except Exception as e:
        # Update status to failed
        reports_collection.update_one(
            {"_id": report_id},
            {"$set": {
                "status": "Failed", 
                "message": str(e),
                "updated_at": datetime.utcnow().isoformat()
            }}
        )

@router.post("/generate")
async def generate_report(request: ReportGenerationRequest, background_tasks: BackgroundTasks):
    """Generate a new report based on template"""
    try:
        # Validate template exists
        template = next((t for t in report_templates if t["id"] == request.template_id), None)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid template ID")

        # Create report record
        report_id = str(uuid.uuid4())
        report_data = {
            "_id": report_id,
            "template_id": request.template_id,
            "template_name": template["name"],
            "status": "Queued",
            "filters": request.filters,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = reports_collection.insert_one(report_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create report record")

        # Start background task
        background_tasks.add_task(_generate_report_task, report_id, request.template_id, request.filters)

        return {
            "message": "Report generation has been queued successfully.", 
            "report_id": report_id,
            "template_name": template["name"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue report generation: {str(e)}")

@router.get("/history")
async def get_report_history():
    """Get all report generation history"""
    try:
        # Get reports sorted by creation date (newest first)
        history = list(reports_collection.find().sort("created_at", -1))
        
        # Add template names for reports that might not have them
        for report in history:
            if "template_name" not in report and "template_id" in report:
                template = next((t for t in report_templates if t["id"] == report["template_id"]), None)
                if template:
                    report["template_name"] = template["name"]
        
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report history: {str(e)}")

@router.get("/{report_id}/status")
async def get_report_status(report_id: str):
    """Get status of a specific report"""
    try:
        report = reports_collection.find_one({"_id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get report status: {str(e)}")

@router.get("/{report_id}/download")
async def download_report(report_id: str):
    """Download a completed report"""
    try:
        report = reports_collection.find_one({"_id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")
        
        if report.get("status") != "Completed":
            raise HTTPException(
                status_code=400, 
                detail=f"Report is not ready for download. Current status: {report.get('status', 'Unknown')}"
            )
        
        file_path = Path(report["file_path"])
        if not file_path.exists():
            # File missing - mark report as failed
            reports_collection.update_one(
                {"_id": report_id},
                {"$set": {
                    "status": "Failed",
                    "message": "Report file not found on server",
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
            raise HTTPException(status_code=404, detail="Report file not found on server.")
            
        return FileResponse(
            file_path, 
            filename=report.get("file_name", "report.xlsx"),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download report: {str(e)}")

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """Delete a report and its associated file"""
    try:
        report = reports_collection.find_one({"_id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")
        
        # Delete the physical file if it exists
        file_path = report.get("file_path")
        if file_path and Path(file_path).exists():
            try:
                os.remove(file_path)
            except OSError as e:
                # Log error but don't fail the deletion
                print(f"Warning: Failed to delete report file {file_path}: {e}")

        # Delete the document from the database
        result = reports_collection.delete_one({"_id": report_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found in database.")
        
        return {"message": "Report and associated file deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")

@router.post("/schedule")
async def schedule_report(request: ReportScheduleRequest):
    """Schedule recurring report generation"""
    try:
        # Validate template exists
        template = next((t for t in report_templates if t["id"] == request.template_id), None)
        if not template:
            raise HTTPException(status_code=400, detail="Invalid template ID")

        # Validate frequency
        valid_frequencies = ['daily', 'weekly', 'monthly']
        if request.frequency not in valid_frequencies:
            raise HTTPException(status_code=400, detail=f"Invalid frequency. Must be one of: {valid_frequencies}")

        # Create schedule record
        schedule_id = str(uuid.uuid4())
        
        # Calculate next run time based on frequency
        now = datetime.utcnow()
        if request.frequency == 'daily':
            next_run = now + timedelta(days=1)
        elif request.frequency == 'weekly':
            next_run = now + timedelta(weeks=1)
        elif request.frequency == 'monthly':
            next_run = now + timedelta(days=30)
        
        schedule_data = {
            "_id": schedule_id,
            "template_id": request.template_id,
            "template_name": template["name"],
            "frequency": request.frequency,
            "recipients": request.recipients,
            "filters": request.filters,
            "is_active": True,
            "next_run": next_run.isoformat(),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
        # Store in a schedules collection
        schedules_collection = db["report_schedules"]
        result = schedules_collection.insert_one(schedule_data)
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create schedule")

        return {
            "message": "Report scheduled successfully",
            "schedule_id": schedule_id,
            "template_name": template["name"],
            "frequency": request.frequency,
            "next_run": next_run.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule report: {str(e)}")

@router.put("/{report_id}/share")
async def share_report(report_id: str, request: ReportShareRequest):
    """Share a report with specified recipients"""
    try:
        report = reports_collection.find_one({"_id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found.")
        
        if report.get("status") != "Completed":
            raise HTTPException(status_code=400, detail="Can only share completed reports.")
        
        # Update report with share information
        share_data = {
            "shared_with": request.recipients,
            "shared_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        reports_collection.update_one(
            {"_id": report_id},
            {"$set": share_data}
        )
        
        # In a real implementation, you would send emails here
        # For now, just return success message
        
        return {
            "message": f"Report shared with {len(request.recipients)} recipients.",
            "recipients": request.recipients,
            "report_name": report.get("file_name", "Unknown Report"),
            "shared_at": share_data["shared_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to share report: {str(e)}")

# Additional utility endpoints
@router.get("/schedules")
async def get_scheduled_reports():
    """Get all scheduled reports"""
    try:
        schedules_collection = db["report_schedules"]
        schedules = list(schedules_collection.find().sort("created_at", -1))
        return schedules
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch scheduled reports: {str(e)}")

@router.delete("/schedules/{schedule_id}")
async def delete_scheduled_report(schedule_id: str):
    """Delete a scheduled report"""
    try:
        schedules_collection = db["report_schedules"]
        result = schedules_collection.delete_one({"_id": schedule_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Scheduled report not found.")
        
        return {"message": "Scheduled report deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete scheduled report: {str(e)}")