import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {api} from '../api/axios'
import { Autocomplete, TextField } from "@mui/material";
import Navbar from "../components/Navbar";

interface Employee {
  employee_id: string;
  name: string;
  department: string;
  join_date: string;
  salary: number;
}

interface Stats {
  total_employees: number;
  average_salary: number;
  active_employees: number;
  inactive_employees: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    total_employees: 0,
    average_salary: 0,
    active_employees: 0,
    inactive_employees: 0,
  });

  const [departments, setDepartments] = useState<Record<string, number>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchOptions, setSearchOptions] = useState<string[]>([]);
  const [salaryTrend, setSalaryTrend] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get("/employees/statistics");
        console.log("Stats API response:", statsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }

      try {
        const empRes = await api.get("/employees");
        console.log("Employees API response:", empRes.data);

        const empList: Employee[] = Array.isArray(empRes.data)
          ? empRes.data
          : Array.isArray(empRes.data?.data)
          ? empRes.data.data
          : [];

        setEmployees(empList);

        const deptCount: Record<string, number> = {};
        empList.forEach(emp => {
          deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
        });
        setDepartments(deptCount);

        setSearchOptions(empList.map(emp => emp.name));

        const sortedByJoin = [...empList].sort(
          (a, b) => new Date(a.join_date).getTime() - new Date(b.join_date).getTime()
        );
        setSalaryTrend(sortedByJoin.map(emp => emp.salary));
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployees([]);
        setDepartments({});
        setSearchOptions([]);
        setSalaryTrend([]);
      }
    };

    fetchData();
  }, []);

  const maxSalary = salaryTrend.length > 0 ? Math.max(...salaryTrend) : 1;

    return (
      
  <div className="bg-gray-100 pt-24 min-h-screen">
    <Navbar />
    <div className="p-6">
      <h2 className="text-3xl text-gray-900 font-bold mb-6 pt-24">Employee Dashboard</h2>
       

        {/* Statistics */}
        <section id="statistics" className="flex flex-wrap justify-center gap-6 mb-8">
          {["Total Employees", "Average Salary", "Active Employees", "Inactive Employees"].map((title, idx) => {
            const value =
              title === "Total Employees"
                ? stats.total_employees
                : title === "Average Salary"
                ? `$${stats.average_salary}`
                : title === "Active Employees"
                ? stats.active_employees
                : stats.inactive_employees;
            const color =
              title === "Total Employees"
                ? "text-blue-600"
                : title === "Average Salary"
                ? "text-green-600"
                : title === "Active Employees"
                ? "text-teal-600"
                : "text-red-600";
            return (
              <div key={idx} className="h-18 w-48 bg-white p-12 rounded-lg m-6 shadow hover:shadow-lg transition  text-center">
                <h3 className="text-lg font-semibold p-8 mb-2">{title}</h3>
                <p className={` p-8 text-3xl font-bold ${color}`}>{value}</p>
              </div>
            );
          })}
        </section>

        {/* Actions */}
        <section id="actions" className="flex flex-wrap gap-4 mb-8">
          <Link className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition" to="/employees/list">Employee List</Link>
          <Link className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition" to="/employees/import">Bulk Import</Link>
          <Link className="bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600 transition" to="/employees/exportpage">Export Employees</Link>
        </section>

        {/* Search */}
        <div className="mb-8 max-w-sm">
          <Autocomplete
            options={searchOptions}
            renderInput={(params) => <TextField {...params} label="Search Employee" />}
          />
        </div>

        {/* Departments */}
        <section id="departments" className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">Department Distribution</h3>
          {Object.keys(departments).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(departments).map(dept => (
                <div key={dept} className="bg-gray-50 p-4 rounded text-center shadow hover:shadow-md transition">
                  <h4 className="font-semibold">{dept}</h4>
                  <p className="text-2xl font-bold">{departments[dept]}</p>
                </div>
              ))}
            </div>
          ) : <p>No departments found</p>}
        </section>

        {/* Salary Trend */}
        <section id="salary-trend" className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">Salary Trend</h3>
          {salaryTrend.length > 0 ? (
            <div className="flex items-end space-x-1 h-48">
              {salaryTrend.map((salary, idx) => (
                <div key={idx} className="bg-green-500 w-4 rounded" style={{ height: `${(salary/maxSalary)*100}%` }} title={`$${salary}`}></div>
              ))}
            </div>
          ) : <p>No salary data available</p>}
        </section>

        {/* Recent Employees */}
        <section id="recent-employees" className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">Recent Employees</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 border rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Department</th>
                  <th className="py-2 px-4 text-left">Join Date</th>
                  <th className="py-2 px-4 text-left">Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees?.length > 0 ? (
                  employees
                    .sort((a,b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime())
                    .slice(0,5)
                    .map(emp => (
                      <tr key={emp.employee_id} className="border-b hover:bg-gray-100 transition">
                        <td className="py-2 px-4">{emp.name}</td>
                        <td className="py-2 px-4">{emp.department}</td>
                        <td className="py-2 px-4">{new Date(emp.join_date).toLocaleDateString()}</td>
                        <td className="py-2 px-4">${emp.salary}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2 px-4 text-center">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
    
  );
};

export default Dashboard;
