import { useEffect, useState } from "react";
import axios from "axios";
import FeedEmptyState from "../../components/FeedEmptyState";

const API = import.meta.env.VITE_API_URL; // ✅ Vite env variable

const Dashboard = () => {
  const [data, setData] = useState({
    credits: 0,
    savedPosts: [],
    reportedPosts: [],
    ProfileComplete: false,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API}/user/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });

        setData(res.data);
      } catch (err) {
        console.error(
          "Failed to load dashboard:",
          err.response?.data?.msg || err.message
        );
      }
    };

    fetchDashboard();
  }, []);

  // Check if dashboard is "empty"
  const isEmpty =
    data.credits === 0 && data.savedPosts.length === 0 && !data.ProfileComplete;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Creator Dashboard</h2>

      {isEmpty ? (
        <FeedEmptyState
          title="No Activity Yet"
          description="Start creating posts, saving content, or completing your profile to see your dashboard here."
        />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-lg font-bold text-gray-600 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-4 py-3 text-left text-lg font-bold text-gray-600 uppercase tracking-wider">
                  Saved Posts
                </th>
                <th className="px-4 py-3 text-left text-lg font-bold text-gray-600 uppercase tracking-wider">
                  Profile Complete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.credits}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {data.savedPosts.length}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      data.ProfileComplete
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {data.ProfileComplete ? "Complete" : "Incomplete"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
