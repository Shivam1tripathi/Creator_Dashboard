import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [data, setData] = useState({
    credits: 0,
    followers: 0,
    following: 0,
    posts: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    bio: "",
    username: "",
    firstName: "",
    lastName: "",
    profilePicture: "",
    status: "offline",
  });

  const { user } = useAuth();

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

  return (
    <div className="p-6 space-y-6">
      {/* User Info Section */}
      <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6">
        <img
          src={`${API}/user/profile-picture/${user?.id}`}
          alt="Profile"
          className="w-20 h-20 rounded-full border object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {data.firstName} {data.lastName}
          </h2>
          <p className="text-sm text-purple-600">@{data.username}</p>
          <p className="text-gray-600 text-sm mt-1">
            {data.bio || "No bio available."}
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
              data.status === "online"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {data.status === "online" ? "Online" : "Last seen recently"}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Credits", value: data.credits },
          { label: "Followers", value: data.followers },
          { label: "Following", value: data.following },
          { label: "Posts", value: data.posts },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Engagement Summary */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Engagement Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Likes", value: data.likes },
            { label: "Comments", value: data.comments },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg text-center hover:bg-gray-50 transition"
            >
              <h4 className="text-xl font-bold text-gray-900">{stat.value}</h4>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
