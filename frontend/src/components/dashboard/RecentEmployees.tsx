interface Employee {
  employee_id: string;
  name: string;
  department: string;
  join_date: string;
  salary: number;
}

const RecentEmployees: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const sorted = [...employees].sort(
    (a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
  );

  return (
    <div>
        <div><h2 className="text-3xl text-gray-900 font-bold mb-10 pt-24">Recent Employees</h2></div><br /><br />
        <div className="mb-20">
            <section id="recent-employees" className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 border p-12 rounded">
              <thead className="bg-gray-200 p-8">
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

export default RecentEmployees;
