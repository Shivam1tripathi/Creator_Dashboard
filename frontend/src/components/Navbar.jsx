import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  let currentUser = user || JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    currentUser = user || JSON.parse(localStorage.getItem("user"));
  }, []);
  // ✅ fallback

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        Creator Dashboard
      </Link>
      <div className="flex gap-4 items-center">
        {currentUser ? (
          <>
            <Link to="/dashboard" className="text-gray-700 cursor-pointer">
              Dashboard
            </Link>
            <Link to="/feed" className="text-gray-700 cursor-pointer">
              Feed
            </Link>
            {!currentUser.profileCompleted && (
              <Link
                to="/complete-profile"
                className="text-orange-600 font-semibold cursor-pointer"
              >
                Complete Profile
              </Link>
            )}
            {currentUser.role === "admin" && (
              <Link to="/admin" className="text-gray-700 cursor-pointer">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="text-red-500 font-medium cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700">
              Login
            </Link>
            <Link to="/register" className="text-gray-700">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
