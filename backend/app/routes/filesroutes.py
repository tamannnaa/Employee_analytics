from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
import os
from datetime import datetime
from typing import List
from ..database import get_database

router = APIRouter(prefix="/files", tags=["File Management"])
db = get_database()
files_collection = db["files"]
employee_files_collection = db["employee_files"]

# Define directories
UPLOAD_DIRECTORY = Path("uploaded_files")
EMPLOYEE_FILES_DIRECTORY = Path("filesystem")
UPLOAD_DIRECTORY.mkdir(exist_ok=True)
EMPLOYEE_FILES_DIRECTORY.mkdir(exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Create a unique filename and path
        file_extension = Path(file.filename).suffix
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIRECTORY / f"{file_id}{file_extension}"
        
        # Write file to disk
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Save metadata to database
        file_metadata = {
            "_id": file_id,
            "filename": file.filename,
            "filepath": str(file_path),
            "size": file_size,
            "mime_type": file.content_type,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        files_collection.insert_one(file_metadata)
        
        return {
            "filename": file.filename, 
            "file_id": file_id, 
            "size": file_size,
            "message": "File uploaded successfully."
        }
    except Exception as e:
        # Clean up file if database insertion fails
        if 'file_path' in locals() and Path(file_path).exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.post("/upload-employee-files")
async def upload_employee_files(
    employee_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files selected")
        
        # Create employee directory if it doesn't exist
        employee_dir = EMPLOYEE_FILES_DIRECTORY / employee_id
        employee_dir.mkdir(exist_ok=True)
        
        uploaded_files = []
        
        for file in files:
            if not file.filename:
                continue
                
            # Read file content
            content = await file.read()
            file_size = len(content)
            
            # Create a unique filename and path
            file_extension = Path(file.filename).suffix
            file_id = str(uuid.uuid4())
            file_path = employee_dir / f"{file_id}{file_extension}"
            
            # Write file to disk
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            # Create file metadata
            file_metadata = {
                "file_id": file_id,
                "filename": file.filename,
                "filepath": str(file_path),
                "size": file_size,
                "mime_type": file.content_type,
                "uploaded_at": datetime.utcnow().isoformat()
            }
            uploaded_files.append(file_metadata)
        
        if not uploaded_files:
            raise HTTPException(status_code=400, detail="No valid files to upload")
        
        # Check if employee already has files record
        existing_record = employee_files_collection.find_one({"employee_id": employee_id})
        
        if existing_record:
            # Add files to existing record
            employee_files_collection.update_one(
                {"employee_id": employee_id},
                {"$push": {"files": {"$each": uploaded_files}}}
            )
        else:
            # Create new record
            employee_file_record = {
                "employee_id": employee_id,
                "files": uploaded_files,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            employee_files_collection.insert_one(employee_file_record)
        
        return {
            "message": f"{len(uploaded_files)} files uploaded successfully for employee {employee_id}",
            "employee_id": employee_id,
            "uploaded_files": len(uploaded_files)
        }
        
    except Exception as e:
        # Clean up files if database insertion fails
        if 'uploaded_files' in locals():
            for file_meta in uploaded_files:
                file_path = Path(file_meta['filepath'])
                if file_path.exists():
                    os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.get("/employee-files")
async def list_employee_files():
    try:
        employee_files = list(employee_files_collection.find({}))
        
        # Convert ObjectId to string and clean up file paths
        for record in employee_files:
            record['_id'] = str(record['_id'])
            # Remove file paths from response for security
            for file in record['files']:
                file.pop('filepath', None)
        
        return employee_files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch employee files: {str(e)}")

@router.get("/employee-files/{employee_id}")
async def get_employee_files(employee_id: str):
    try:
        employee_files = employee_files_collection.find_one({"employee_id": employee_id})
        
        if not employee_files:
            raise HTTPException(status_code=404, detail="No files found for this employee")
        
        # Remove file paths from response for security
        employee_files['_id'] = str(employee_files['_id'])
        for file in employee_files['files']:
            file.pop('filepath', None)
        
        return employee_files
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch employee files: {str(e)}")

@router.get("/employee-files/{employee_id}/{file_id}")
async def download_employee_file(employee_id: str, file_id: str):
    try:
        employee_files = employee_files_collection.find_one({"employee_id": employee_id})
        
        if not employee_files:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Find the specific file
        target_file = None
        for file in employee_files['files']:
            if file['file_id'] == file_id:
                target_file = file
                break
        
        if not target_file:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = Path(target_file['filepath'])
        
        if not file_path.is_file():
            # File exists in database but not on disk - clean up database entry
            employee_files_collection.update_one(
                {"employee_id": employee_id},
                {"$pull": {"files": {"file_id": file_id}}}
            )
            raise HTTPException(status_code=404, detail="File not found on server")
        
        return FileResponse(
            path=file_path,
            filename=target_file['filename'],
            media_type=target_file.get('mime_type', 'application/octet-stream')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

@router.delete("/employee-files/{employee_id}/{file_id}")
async def delete_employee_file(employee_id: str, file_id: str):
    try:
        employee_files = employee_files_collection.find_one({"employee_id": employee_id})
        
        if not employee_files:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Find the specific file
        target_file = None
        for file in employee_files['files']:
            if file['file_id'] == file_id:
                target_file = file
                break
        
        if not target_file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete physical file
        file_path = Path(target_file['filepath'])
        if file_path.is_file():
            os.remove(file_path)
        
        # Remove file from database
        result = employee_files_collection.update_one(
            {"employee_id": employee_id},
            {"$pull": {"files": {"file_id": file_id}}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="File not found in database")
        
        # If this was the last file for the employee, optionally remove the employee record
        updated_employee_files = employee_files_collection.find_one({"employee_id": employee_id})
        if updated_employee_files and len(updated_employee_files['files']) == 0:
            employee_files_collection.delete_one({"employee_id": employee_id})
            # Also try to remove the employee directory if it's empty
            employee_dir = EMPLOYEE_FILES_DIRECTORY / employee_id
            try:
                if employee_dir.exists() and not any(employee_dir.iterdir()):
                    employee_dir.rmdir()
            except:
                pass  # Directory might not be empty or have permission issues
        
        return {"message": "File deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

@router.get("/list")
async def list_files():
    try:
        files = list(files_collection.find({}, {"filepath": 0}))  # Exclude filepath for security
        # Convert ObjectId to string for JSON serialization
        for file in files:
            file['id'] = str(file.pop('_id'))
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch files: {str(e)}")

@router.get("/{file_id}")
async def get_file(file_id: str):
    try:
        file_data = files_collection.find_one({"_id": file_id})
        
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found.")

        file_path = Path(file_data["filepath"])
        
        if not file_path.is_file():
            # File exists in database but not on disk - clean up database entry
            files_collection.delete_one({"_id": file_id})
            raise HTTPException(status_code=404, detail="File not found on server.")
        
        return FileResponse(
            path=file_path, 
            filename=file_data["filename"],
            media_type=file_data.get("mime_type", "application/octet-stream")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve file: {str(e)}")

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    try:
        file_data = files_collection.find_one({"_id": file_id})
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found.")
        
        # Delete physical file
        file_path = Path(file_data["filepath"])
        if file_path.is_file():
            os.remove(file_path)
        
        # Delete database record
        result = files_collection.delete_one({"_id": file_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="File not found in database.")
        
        return {"message": "File and its metadata deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

@router.get("/{file_id}/info")
async def get_file_info(file_id: str):
    """Get file metadata without downloading the file"""
    try:
        file_data = files_collection.find_one({"_id": file_id}, {"filepath": 0})
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found.")
        
        file_data['id'] = str(file_data.pop('_id'))
        return file_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file info: {str(e)}")

# Bulk operations for employee files
@router.delete("/employee-files/{employee_id}")
async def delete_all_employee_files(employee_id: str):
    """Delete all files for a specific employee"""
    try:
        employee_files = employee_files_collection.find_one({"employee_id": employee_id})
        
        if not employee_files:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Delete all physical files
        for file in employee_files['files']:
            file_path = Path(file['filepath'])
            if file_path.is_file():
                os.remove(file_path)
        
        # Delete database record
        result = employee_files_collection.delete_one({"employee_id": employee_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee files not found in database")
        
        # Try to remove the employee directory
        employee_dir = EMPLOYEE_FILES_DIRECTORY / employee_id
        try:
            if employee_dir.exists():
                import shutil
                shutil.rmtree(employee_dir)
        except:
            pass  # Directory might have permission issues
        
        return {"message": f"All files for employee {employee_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete employee files: {str(e)}")