from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Read connection string
MONGODB_URL = os.getenv("MONGODB_URL")

# Create a MongoDB client
client = MongoClient(MONGODB_URL)

# Import database
db = client["employee_analytics"]

def get_database():
    return db
