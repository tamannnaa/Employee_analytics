import type { Employee } from "../../pages/employees/Employees";


interface EmployeeTableProps {
  employees: Employee[];
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => (
  <div className="overflow-x-auto">
    <br />
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
    <br />
  </div>
);
export default EmployeeTable;