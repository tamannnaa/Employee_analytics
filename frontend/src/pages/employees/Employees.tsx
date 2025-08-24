import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import FilterEmployee from "../../components/employees/FilterEmployee";
import AddEmployeeForm from "../../components/employees/AddEmployee";
import EmployeeTable from "../../components/employees/EmployeeTable";

interface Employee {
  id: string;
  name: string;
  department: string;
  join_date: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [department, setDepartment] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeDept, setNewEmployeeDept] = useState("");

  const fetchEmployees = async (dept?: string) => {
    try {
      const url = dept ? `/employees/department/${dept}` : "/employees";
      const res = await api.get(url);
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employees");
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName || !newEmployeeDept) {
      return alert("Please provide name and department");
    }
    try {
      await api.post("/employees", {
        name: newEmployeeName,
        department: newEmployeeDept,
      });
      alert("Employee added successfully");
      setNewEmployeeName("");
      setNewEmployeeDept("");
      fetchEmployees(department);
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="w-400 min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex justify-center items-start py-20 px-20">
      <div className="bg-white shadow-xl rounded-xl p-24 m-20 w-380 border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Employees
        </h2>

        <FilterEmployee department={department} setDepartment={setDepartment} onFilter={() => fetchEmployees(department)} />

        <AddEmployeeForm
          newEmployeeName={newEmployeeName}
          setNewEmployeeName={setNewEmployeeName}
          newEmployeeDept={newEmployeeDept}
          setNewEmployeeDept={setNewEmployeeDept}
          onAdd={handleAddEmployee}
        />

        <div>
          <a className="text-blue-600" href="/dashboard">
            Go to Home
          </a>
        </div>

        <EmployeeTable employees={employees} />
      </div>
    </div>
  );
};

export default Employees;
