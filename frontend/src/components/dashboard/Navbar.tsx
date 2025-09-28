import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", to: "/dashboard" },
    { label: "Statistics", to: "/employees/statistics" },
    { label: "Actions", to: "/employees" },
    { label: "Bulk Import", to: "/employees/import" },
    { label: "Bulk Export", to: "/employees/exportpage" },
    { label: "Files", to: "/files" },
    { label: "Reports", to: "/reports" },
    { label: "Analytics", to: "/analytics/dashboard-stats" },
    { label: "Profile", to: "/auth/profile" },
  ];

  return (
    <nav className=" top-0 left-0 z-50 bg-white shadow-md w-full">
      <div className="flex justify-center gap-6 items-center h-16 mx-12 px-12"> 
        <div className="flex  gap-10"> 
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-gray-900 font-semibold text-lg tracking-wide px-3 py-2 rounded-md
                          transition-all duration-300 transform
                          ${
                            location.pathname === item.to
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : ""
                          }
                          hover:text-purple-700 
                          hover:scale-105`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
