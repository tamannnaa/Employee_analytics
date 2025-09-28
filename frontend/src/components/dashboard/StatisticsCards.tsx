interface Stats {
  total_employees: number;
  average_salary: number;
  active_employees: number;
  inactive_employees: number;
}

const StatisticsCards: React.FC<{ stats: Stats }> = ({ stats }) => {

  return (
    <div>
        <div>
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
        </div>
    </div>
  );
};

export default StatisticsCards;
