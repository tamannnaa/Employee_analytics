import os
from app.excel_generator import generate_employee_report

def test_excel_report_generation():
    sample_data = [{
        "employee_id": "EMP001",
        "name": "Test User",
        "email": "test@company.com",
        "department": "QA",
        "position": "Tester",
        "salary": 60000,
        "join_date": "2024-01-01",
        "performance_score": 4.5,
        "is_active": True,
        "skills": ["Python", "Testing"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }]

    filepath = generate_employee_report(sample_data)
    assert os.path.exists(filepath)
