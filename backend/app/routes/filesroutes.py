from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
import os
from datetime import datetime
from ..database import get_database

router = APIRouter(prefix="/files", tags=["File Management"])
db = get_database()
files_collection = db["files"]

# Define a directory to store uploaded files
UPLOAD_DIRECTORY = Path("uploaded_files")
UPLOAD_DIRECTORY.mkdir(exist_ok=True)

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