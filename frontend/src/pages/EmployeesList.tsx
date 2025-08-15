import { useState } from "react";
import { searchEmployees, uploadPhoto } from "../api/employee";

const EmployeeList = () => {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  const handleSearch = async () => {
    const res = await searchEmployees(query);
    setEmployees(res);
  };

  const handlePhotoUpload = async (id: string, file: File) => {
    await uploadPhoto(id, file);
    alert("Photo uploaded!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Employee List</h2>
      <input
        placeholder="Search by name, email, department..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <table border={1} cellPadding={5} style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Photo</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.employee_id}>
              <td>{emp.employee_id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
              <td>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) handlePhotoUpload(emp.employee_id, e.target.files[0]);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
