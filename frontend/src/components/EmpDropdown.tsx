import React from 'react';

type Employee = {
  employee_id: string;
  name: string;
};

type Props = {
  employees: Employee[];
  selectedID: string;
  onChange: (id: string) => void;
};

const EmpDropdown: React.FC<Props> = ({ employees, selectedID, onChange }) => {
  return (
    <select value={selectedID} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select employee</option>
      {employees.map((emp) => (
        <option key={emp.employee_id} value={emp.employee_id}>
          {emp.name}
        </option>
      ))}
    </select>
  );
};

export default EmpDropdown;
