import { useState } from "react";
import { bulkImport } from "../../api/employee";
import Navbar from "../../components/dashboard/Navbar";

const BulkImport = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    await bulkImport(file);
    alert("Import complete!");
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br w-[1500px] flex flex-col justify-center items-center from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar/>
      {/* Full width and height with gradient background */}
      <div className="w-380 min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex justify-center items-center ">
        {/* Inner form container */}
        <div className="bg-white shadow-xl h-60  items-center rounded-xl p-24 w-full max-w-3xl border border-blue-100 flex justify-center">
          {/* Actual form content */}
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              Bulk Import Employees
            </h2><br />

            <div className="flex flex-col gap-5">
              {/* File Input */}
              <div>
                <label className="text-gray-700 font-medium mb-2 block">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-900 transition-transform transform hover:scale-[1.02]"
              >
                Import
              </button>

            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default BulkImport;
