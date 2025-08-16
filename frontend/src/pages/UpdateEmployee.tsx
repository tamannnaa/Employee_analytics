import React, { useState, useEffect } from "react";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";

function UpdateEmployee() {
  const { employeeId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: 0,
    is_active: true,
  });

  useEffect(() => {
    // Fetch employee details
    api
      .get(`/employees/${employeeId}`)
      .then((res) => setFormData(res.data))
      .catch((err) => console.error(err));
  }, [employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    api
      .put(`/employees/${employeeId}`, formData)
      .then((res) => alert(res.data.message))
      .catch((err) => alert(err.response?.data?.detail || "Error"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Employee: {employeeId}</h2>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name"/>
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email"/>
      <input name="department" value={formData.department} onChange={handleChange} placeholder="Department"/>
      <input name="position" value={formData.position} onChange={handleChange} placeholder="Position"/>
      <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Salary"/>
      <label>
        Active
        <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} />
      </label>
      <button type="submit">Update</button>
    </form>
  );
}

export default UpdateEmployee;
