import { useEffect, useState } from "react";
import { getStatistics } from "../../api/employee";
import Navbar from "../../components/dashboard/Navbar";
import { FaSpinner } from "react-icons/fa";

const Statistics = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getStatistics().then(setStats).catch(err => console.error("Failed to fetch stats:", err));
  }, []);

  // Improved loading state
  if (!stats) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
        <p className="mt-4 text-lg text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  // Helper to format salary
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(salary);
  };

  return (
    // Main container is no longer centering its direct children
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-gray-800">
      <Navbar /><br /><br /><br />
      
      {/* A new 'main' container to center the content on the page */}
      <main className="flex justify-center items-center py-20 px-4"><br />
        <div className="w-full max-w-md bg-white/70 backdrop-blur-sm p-8 rounded-2xl  border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
            Employee Statistics
          </h2><br /><br />
          <ul className="text-lg space-y-6">
            <li className="flex justify-between"><strong>Total Employees:</strong> <span className="font-semibold">{stats.total_employees}</span></li><br />
            <li className="flex justify-between"><strong>Active Employees:</strong> <span className="font-semibold text-green-600">{stats.active_employees}</span></li><br />
            <li className="flex justify-between"><strong>Inactive Employees:</strong> <span className="font-semibold text-red-600">{stats.inactive_employees}</span></li><br />
            <li className="flex justify-between"><strong>Average Salary:</strong> <span className="font-semibold">{formatSalary(stats.average_salary)}</span></li><br />
          </ul>
         
        </div>
      </main>
    </div>
  );
};

export default Statistics;