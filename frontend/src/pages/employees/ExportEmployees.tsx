import { useState } from "react";
import { exportEmployees } from "../../api/employee";
import Navbar from "../../components/dashboard/Navbar";

const ExportEmployees = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");

  const handleExport = async () => {
    if (!start || !end) {
      alert("Please select both start and end dates.");
      return;
    }
    const blob = await exportEmployees(start, end, format);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_export.${format}`;
    a.click();
  };

  return (
    <>

    <div className="min-h-screen bg-gradient-to-br w-[1500px] flex flex-col justify-center items-center from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar/>
      {/* Full width and height with gradient background */}
      <div className="w-380  min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex justify-center items-center ">
        {/* Inner form container */}
        <div className="bg-white shadow-xl rounded-xl h-100  items-center p-24 w-full max-w-3xl border border-blue-100 flex justify-center">
          {/* Actual form content */}
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
              Export Employees by Joining Date
            </h2><br />

            <div className="flex flex-col gap-5">
              {/* Start Date */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Format Selector */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) =>
                    setFormat(e.target.value as "xlsx" | "csv")
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-900 transition-transform transform hover:scale-[1.02]"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ExportEmployees;
