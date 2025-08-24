const DepartmentsSection: React.FC<{ departments: Record<string, number> }> = ({ departments }) => (
  <div>
    <div><h2 className="text-3xl text-gray-900 font-bold mb-10 pt-24">Departments</h2></div><br /><br />
        <div className="p-10">
            <section id="departments" className="bg-white p-16 h-52 flex justify-center items-center w-250 rounded-lg shadow mb-8">
          {Object.keys(departments).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 w-200  gap-6">
              {Object.keys(departments).map(dept => (
                <div key={dept} className="bg-gray-50 p-4 rounded text-center shadow hover:shadow-md transition">
                  <h4 className="font-semibold">{dept}</h4>
                  <p className="text-2xl font-bold">{departments[dept]}</p>
                </div>
              ))}
            </div>
          ) : <p>No departments found</p>}
        </section>
        </div>
  </div>
);

export default DepartmentsSection;
