import { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table";

const API = import.meta.env.VITE_API_URL;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await axios.get(`${API}/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data.users);
        setTotalCredits(res.data.totalCredits);
      } catch (err) {
        console.error("Failed to load admin data:", err.response?.data?.msg);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Admin Panel</h2>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-lg font-bold text-gray-600 uppercase tracking-wider">
                Total Users
              </th>
              <th className="px-4 py-3 text-left text-lg font-bold text-gray-600 uppercase tracking-wider">
                Total Credits
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {users.length}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {totalCredits}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">All Users</h3>
        <Table
          headers={["Name", "Email", "Role", "Credits"]}
          rows={users.map((u) => [u.name, u.email, u.role, u.credits])}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
