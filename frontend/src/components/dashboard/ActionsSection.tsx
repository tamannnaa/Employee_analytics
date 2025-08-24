import { Link } from "react-router-dom";

const ActionsSection: React.FC = () => (
  <div>
    <div><h2 className="text-3xl text-gray-900 font-bold mb-10 pt-24">Actions</h2></div><br />
        <div className="mb-20">
            <section id="actions" className="flex flex-wrap gap-4 mb-8">
                      <Link className="bg-white text-blue-600  px-4 py-2 rounded m-4 h-8 w-36 shadow hover:bg-blue-600 hover:text-white hover:scale-105 flex justify-center items-center  transition" to="/employees">Employee List</Link>
                      <Link className="bg-white text-blue-600 px-4 py-2 rounded m-4 h-8 w-36 shadow hover:bg-blue-600 hover:text-white hover:scale-105 flex justify-center items-center transition" to="/employees/import">Bulk Import</Link>
                      <Link className="bg-white text-blue-600 px-4 py-2 rounded m-4 h-8 w-40 shadow hover:bg-blue-600 hover:text-white hover:scale-105 flex justify-center items-center transition" to="/employees/exportpage">Export Employees</Link>
            </section>
        </div>
  </div>
);

export default ActionsSection;
