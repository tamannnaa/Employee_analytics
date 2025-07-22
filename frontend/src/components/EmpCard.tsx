import React from 'react';

type Employee = {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  performance_score: number;
};

type Props = {
  employee: Employee;
};

const EmpCard:React.FC<Props>=({employee})=>{
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h3>Name: {employee.name}</h3>
      <p><strong>Department:</strong> {employee.department}</p>
      <p><strong>Position:</strong> {employee.position}</p>
      <p><strong>Email:</strong> {employee.email}</p>
      <p><strong>Salary:</strong> ₹{employee.salary}</p>
      <p><strong>Performance:</strong> {employee.performance_score}</p>
    </div>
  );
};

export default EmpCard;
