import React, { useEffect, useState } from 'react';
import EmpCard from './EmpCard';
import EmpDropdown from './EmpDropdown'


type Employee = {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  performance_score: number;
};

const EmpList: React.FC = () => {
  const [emp, setEmployees] = useState<Employee[]>([]);
  const [selectedID, setSelectedID] = useState<string>('');
  const [selectedEMP, setSelectedEMP] = useState<Employee | null>();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch('http://127.0.0.1:8000/employees');
      const res = await data.json();
      setEmployees(res);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const em = emp.find((e) => e.employee_id === selectedID);
    setSelectedEMP(em || null);
  }, [selectedID, emp]);

  return (
    <div>
      <EmpDropdown
        employees={emp}
        selectedID={selectedID}
        onChange={setSelectedID}
      />
      <br />
      <br />
      {selectedEMP && <EmpCard employee={selectedEMP} />}
    </div>
  );
};

export default EmpList;
