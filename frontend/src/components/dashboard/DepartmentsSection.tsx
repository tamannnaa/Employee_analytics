import React from 'react';

const DepartmentsSection: React.FC<{ departments: Record<string, number> }> = ({ departments }) => (
  <div className="w-full py-12 bg-slate-50">
    
    
    {/* Use max-width and auto margins to center the content and control its size on large screens */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section id="departments" className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        {Object.keys(departments).length > 0 ? (
          // This responsive grid adjusts the number of columns based on screen size, preventing overflow
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Object.entries(departments).map(([dept, count]) => (
              <div key={dept} className="bg-gray-50 p-4 rounded-lg text-center shadow-sm hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out">
                {/* Truncate ensures long department names don't break the layout */}
                <h4 className="font-semibold text-gray-800 truncate" title={dept}>{dept}</h4>
                <p className="text-3xl font-bold text-indigo-600">{count}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No department data available.</p>
        )}
      </section>
    </div>
  </div>
);

export default DepartmentsSection;