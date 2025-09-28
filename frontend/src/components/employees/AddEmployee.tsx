interface AddEmployeeFormProps {
  newEmployeeName: string;
  setNewEmployeeName: (name: string) => void;
  newEmployeeDept: string;
  setNewEmployeeDept: (dept: string) => void;
  onAdd: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  newEmployeeName,
  setNewEmployeeName,
  newEmployeeDept,
  setNewEmployeeDept,
  onAdd,
}) => (
  <div className="flex gap-3 mb-6">
    <br />
    <input
      type="text"
      placeholder="Employee Name"
      value={newEmployeeName}
      onChange={(e) => setNewEmployeeName(e.target.value)}
      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 max-w-68 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <input
      type="text"
      placeholder="Department"
      value={newEmployeeDept}
      onChange={(e) => setNewEmployeeDept(e.target.value)}
      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 max-w-68 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      onClick={onAdd}
      className="bg-white text-green-600 hover:bg-green-600 h-8 w-20 hover:text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
    >
      Add
    </button>
    <br />
  </div>
);
export default AddEmployeeForm;