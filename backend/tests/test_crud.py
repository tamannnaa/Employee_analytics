from app import crud

def test_get_all_employees_returns_list():
    employees = crud.get_all_employees()
    assert isinstance(employees, list)
