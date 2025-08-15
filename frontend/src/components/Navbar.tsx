import { useState, useEffect } from "react";

const Navbar: React.FC = () => {
  const navItems = [
    { label: "Statistics", href: "#statistics" },
    { label: "Actions", href: "#actions" },
    { label: "Departments", href: "#departments" },
    { label: "Salary Trend", href: "#salary-trend" },
    { label: "Recent Employees", href: "#recent-employees" },
  ];

  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = "";
      navItems.forEach(item => {
        const el = document.querySelector(item.href);
        if (el && el.getBoundingClientRect().top <= 80) {
          currentSection = item.href;
        }
      });
      setActive(currentSection);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16 items-center w-full">
          <div className="flex justify-between w-full">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-gray-900 font-semibold text-lg tracking-wide px-6 py-3 mx-4 rounded-md
                            transition-all duration-300 transform
                            ${active === item.href ? "border-b-2 border-blue-500 text-blue-600" : ""}
                            hover:text-purple-700 
                            hover:scale-105`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;