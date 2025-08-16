import { useEffect, useState } from "react";
import { api } from "../api/axios";


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
        department: newEmployeeDept
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
      <div className="bg-white shadow-xl rounded-xl p-24 m-20 w-380  border  border-blue-100">
        <br /><h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Employees
        </h2>
        <br />
        

        {/* Filter by Department */}
        <div className="flex gap-3 mb-6">
         &nbsp; <input
            type="text"
            placeholder="Filter by department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 max-w-68 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => fetchEmployees(department)}
            className="bg-white text-blue-600 hover:bg-blue-600 h-8 w-20 hover:text-white font-semibold px-4 py-2 rounded-lg shadow-md  transition-transform transform hover:scale-[1.02]"
          >
            Filter
          </button>
        </div>
        <br />

        {/* Add New Employee */}
        <div className="flex gap-3 mb-6">
          &nbsp;<input
            type="text"
            placeholder="Employee Name"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 max-w-68  focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Department"
            value={newEmployeeDept}
            onChange={(e) => setNewEmployeeDept(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 max-w-68  focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAddEmployee}
            className="bg-white text-green-600 hover:bg-green-600 h-8 w-20 hover:text-white  font-semibold px-4 py-2 rounded-lg shadow-md  transition-transform transform hover:scale-[1.02]"
          >
            Add
          </button>
        </div>
        <br />
        <div>
                <a className="text-blue-600" href="/dashboard">&nbsp;Go to Home</a>
              </div>
              <br />
        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-blue-100 text-left">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Department</th>
                <th className="border border-gray-300 px-4 py-2">Joining Date</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50">
                  <td className="border border-gray-300 px-4 py-2">{emp.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.department}</td>
                  <td className="border border-gray-300 px-4 py-2">{emp.join_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
      
    </div>
  );
};

export default Employees;
