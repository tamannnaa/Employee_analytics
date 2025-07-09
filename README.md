**EMPLOYEE DATA ANALYTICS API**
This is a modern Employee Management & Analytics system built with FastAPI, MongoDB, and Python. It generates professional Excel reports and manage employee data effortlessly.

FEATURES
-REST API to manage employees
-Department-wise filtering & summaries
-Salary and performance analytics
-Professionally styled Excel reports with charts & conditional formatting
-MongoDB as the backend database


TECH STACK
-Python 3.11+ : Main programming language
-FastAPI : Web framework for APIs
-MongoDB : NoSQL database
-PyMongo : Mongodb connector
-Pandas & OpenPyXL : Data manipulation and Excel generation
-Uvicorn : local development


PROJECT STRUCTURE
employee_analytics/
├── app/
│   ├── main.py              # FastAPI app & routes
│   ├── models.py            # Request/response models
│   ├── crud.py              # Database operations
│   ├── database.py          # MongoDB connection
│   ├── excel_generator.py   # Excel report generation
│   └── utils.py (optional)  # Helper functions
│
├── exports/                 # Generated Excel reports
├── data/
│   ├── sample_data.json     # Test employee records
├── requirements.txt         # Dependencies
├── .env                     # Environment variables
└── README.md                 # This file


SETUP INSTRUCTIONS
   1. Clone Repository
       
       git clone <your-repo-url>
       cd employee_analytics
    
   2. Create Virtual Environment

       python -m venv venv

   3. Activate the environemnt-
       
       venv\Scripts\activate

   4. Install Dependencies
       
       pip install -r requirements.txt
   
   5. Configure Database- Create a .env file
       
       MONGODB_URL=mongodb://localhost:27017

   6. Import Sample Data
    
       mongoimport --db employee_analytics --collection employees --file sample_data.json --jsonArray
   
   7. Run the Application
    
       uvicorn app.main:app --reload


API ENDPOINTS

  Interactive API docs can be accessed at-
    http://127.0.0.1:8000/docs (Swagger UI)
    http://127.0.0.1:8000/redoc (Optional)


CORE ENDPOINTS

Method	              Endpoint	                  Description
GET	                     /	                     Health check
GET	                  /employees	             Get all employees
GET	           /employees/{employee_id}	         Get specific employee by ID
GET	                 /departments	             List all departments
GET	          /employees/department/{dept}	     Employees filtered by department
POST	             /employees	                 Add new employee
PUT	            /employees/{employee_id}	     Update employee details
GET	            /analytics/salary-stats	         Salary statistics by department
GET	             /analytics/performance	         Top performers data
POST	            /reports/excel	             Generate full Excel report
POST	            /reports/custom	             Generate filtered Excel report


EXCEL REPORTS
The system generates professional Excel reports with:

-Multiple sheets: Employee List, Department Summary, Salary Analysis
-Bar & Pie charts for visualization
-Conditional formatting (e.g., highlights top performers)
-Company-colored, well-formatted tables
-Reports are saved under the exports/ folder.


NOTES
-Ensure MongoDB service is running before starting the app.
-Visit /docs for an easy API testing interface.
-Reports will be saved locally under exports/.
-You can freely modify employee data via API for testing.