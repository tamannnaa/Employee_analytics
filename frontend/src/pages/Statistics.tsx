import { useEffect, useState } from "react";
import { getStatistics } from "../api/employee";

const Statistics = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getStatistics().then(setStats);
  }, []);

  if (!stats) return <p>Loading statistics...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Employee Statistics</h2>
      <ul>
        <li>Total Employees: {stats.total_employees}</li>
        <li>Active Employees: {stats.active_employees}</li>
        <li>Inactive Employees: {stats.inactive_employees}</li>
        <li>Average Salary: ${stats.average_salary}</li>
      </ul>
    </div>
  );
};

export default Statistics;
