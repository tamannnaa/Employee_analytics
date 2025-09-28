import { useState, useEffect } from "react";
import {api} from '../api/axios'
import Navbar from "../components/dashboard/Navbar";
import ActionsSection from "../components/dashboard/ActionsSection";
import DepartmentsSection from "../components/dashboard/DepartmentsSection";
import RecentEmployees from "../components/dashboard/RecentEmployees";
import StatisticsCards from "../components/dashboard/StatisticsCards";

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

  return (
    <div className="min-h-screen bg-gradient-to-br w-[1500px] flex flex-col justify-center items-center from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar />
            <br /><br />
        <div className=" px-6">
            <div><h2 className="text-3xl text-gray-900 font-bold mb-10 ">Employee Dashboard</h2></div><br />

            <StatisticsCards stats={stats}/>
            <br /><br />

            <ActionsSection/>
            <br /><br />

            <DepartmentsSection departments={departments}/>
            <br /><br />

            <RecentEmployees employees={employees}/>
            <br /><br />
        </div>

        
    </div>
  )
}

export default Dashboard