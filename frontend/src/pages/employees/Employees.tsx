import { useState, useEffect } from "react";
import { api } from "../../api/axios";
import FilterEmployee from "../../components/employees/FilterEmployee";
import AddEmployeeForm from "../../components/employees/AddEmployee";
import EmployeeTable from "../../components/employees/EmployeeTable";
import Navbar from "../../components/dashboard/Navbar";

export interface Employee {
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
    <div className="min-h-screen bg-gradient-to-br w-[1500px] flex flex-col justify-center items-center from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar/>
      <div className="bg-white shadow-xl w-[1400px] mx-auto rounded-xl p-24 m-20 border border-blue-100">
        <br /><br />
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
          Employees
        </h2>
        <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 sm:flex-row">
        <FilterEmployee department={department} setDepartment={setDepartment} onFilter={() => fetchEmployees(department)} /> 
          <br /><br />
          </div>
          <br />


          <div className="mb-6 rounded-lg bg-white p-6 shadow-md animate-fade-in-down">
        <AddEmployeeForm
          newEmployeeName={newEmployeeName}
          setNewEmployeeName={setNewEmployeeName}
          newEmployeeDept={newEmployeeDept}
          setNewEmployeeDept={setNewEmployeeDept}
          onAdd={handleAddEmployee}
        /> <br />
        </div>
        <br />
        

         <div className="mt-8 overflow-hidden rounded-lg bg-white shadow-md">
        <EmployeeTable employees={employees} />
        <br />
        </div>
        <br />
      </div>
    </div>
  );
};

export default Employees;
