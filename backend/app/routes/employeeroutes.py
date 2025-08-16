from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import List, Dict, Any
from fastapi.responses import StreamingResponse
from uuid import uuid4
from io import BytesIO
import pandas as pd
import os
from datetime import datetime
from .. import crud, excel_generator, models
from ..database import get_database

router = APIRouter(prefix="/employees", tags=["Employees"])
db = get_database()
empcollection = db["employees"]

uploaddir = "uploads/photos"
os.makedirs(uploaddir, exist_ok=True)

@router.get("/")
def get_employees():
    return crud.get_all_employees()

@router.get("/search")
def searchemployees(q: str = Query(...)):
    query = {
        "$or": [
            {"employee_id": {"$regex": q, "$options": "i"}},
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"department": {"$regex": q, "$options": "i"}},
            {"position": {"$regex": q, "$options": "i"}}
        ]
    }
    return list(empcollection.find(query, {"_id": 0}))

@router.get("/export")
def export_employees(
    start_date: str = Query(...),
    end_date: str = Query(...),
    format: str = Query("xlsx", regex="^(xlsx|csv)$")
):
    # Validate date format
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    # Query MongoDB using the correct field and sort ascending by join_date
    employees = list(empcollection.find(
        {"join_date": {"$gte": start_date, "$lte": end_date}},
        {"_id": 0}
    ).sort("join_date", 1))

    if not employees:
        raise HTTPException(status_code=404, detail="No employees found in given date range")

    df = pd.DataFrame(employees)
    buf = BytesIO()

    if format == "xlsx":
        df.to_excel(buf, index=False)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=employees_export.xlsx"}
        )
    else:
        df.to_csv(buf, index=False)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=employees_export.csv"}
        )


@router.get("/statistics")
def statistics():
    total = empcollection.count_documents({})
    avg = list(empcollection.aggregate([{"$group": {"_id": None, "avg": {"$avg": "$salary"}}}]))
    active = empcollection.count_documents({"is_active": True})
    inactive = empcollection.count_documents({"is_active": False})
    return {
        "total_employees": total,
        "average_salary": round(avg[0]["avg"], 2) if avg else 0,
        "active_employees": active,
        "inactive_employees": inactive
    }

@router.get("/department/{dept}")
def get_employees_by_department(dept: str):
    return crud.get_employees_by_department(dept)

@router.post("/")
def create_employee(employee: models.NewEmployee):
    crud.add_employee(employee)
    return {"message": "Employee added successfully"}

@router.post("/bulk-import")
def bulkimport(file: UploadFile = File(...)):
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(file.file.read()))
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(file.file.read()))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        records = df.to_dict(orient="records")
        if not records:
            raise HTTPException(status_code=400, detail="No data found")
        
        employeeids = [rec.get("employee_id") for rec in records if rec.get("employee_id")]
        existingids = set(
            doc["employee_id"]
            for doc in empcollection.find(
                {"employee_id": {"$in": employeeids}}, {"employee_id": 1}
            )
        )
        newrecords = [rec for rec in records if rec.get("employee_id") not in existingids]

        if newrecords:
            empcollection.insert_many(newrecords)

        return {
            "message": f"{len(newrecords)} new employees imported successfully",
            "skipped": len(records) - len(newrecords)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-update")
def bulk_update(data: Dict[str, Any]):
    ids = data.get("employee_ids")
    updates = data.get("updates")
    if not ids or not updates:
        raise HTTPException(status_code=400, detail="Provide employee_ids and updates")
    res = empcollection.update_many({"employee_id": {"$in": ids}}, {"$set": updates})
    return {"matched": res.matched_count, "modified": res.modified_count}

@router.delete("/bulk-delete")
def bulk_delete(ids: List[str] = Query(...)):
    res = empcollection.delete_many({"employee_id": {"$in": ids}})
    return {"deleted": res.deleted_count}

def get_employee_by_id(employee_id: str):
    return empcollection.find_one(
        {"employee_id": {"$regex": f"^{employee_id}$", "$options": "i"}}, 
        {"_id": 0}
    )


@router.put("/{employee_id}")
def update_employee(employee_id: str, updates: models.UpdateEmployee):
    updates_dict = {k: v for k, v in updates.dict().items() if v is not None}
    if not updates_dict:
        raise HTTPException(status_code=400, detail="No updates provided")
    modified_count = crud.update_employee(employee_id, updates_dict)
    if modified_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found or no changes made")
    return {"message": "Employee updated successfully"}

@router.post("/{employee_id}/photo")
def uploadphoto(employee_id: str, file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1]
    fname = f"{uuid4()}.{ext}"
    path = os.path.join(uploaddir, fname)
    with open(path, "wb") as f:
        f.write(file.file.read())
    res = empcollection.update_one({"employee_id": employee_id}, {"$set": {"photo_url": path}})
    if res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Photo updated", "url": path}