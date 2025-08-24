interface FilterProps {
  department: string;
  setDepartment: (dept: string) => void;
  onFilter: () => void;
}

const FilterEmployee: React.FC<FilterProps> = ({ department, setDepartment, onFilter }) => (
  <div className="flex gap-3 mb-6">
    <input
      type="text"
      placeholder="Filter by department"
      value={department}
      onChange={(e) => setDepartment(e.target.value)}
      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 max-w-68 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      onClick={onFilter}
      className="bg-white text-blue-600 hover:bg-blue-600 h-8 w-20 hover:text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
    >
      Filter
    </button>
  </div>
);
 export default FilterEmployee