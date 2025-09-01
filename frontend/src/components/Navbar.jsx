import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = () => {
    setTimeout(() => setDropdownOpen(false), 50);
  };

  return (
    <nav className="bg-gray-900/90 backdrop-blur-lg shadow-md border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-white hover:text-purple-400 transition-colors"
        >
          Creator<span className="text-purple-400">Hub</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 relative">
          {user ? (
            <>
              {["/", "/explore", "/create-Post"].map((path, idx) => (
                <Link
                  key={idx}
                  to={path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(path)
                      ? "text-purple-400 border-b-2 border-purple-400 pb-1"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {path === "/"
                    ? "Home"
                    : path === "/explore"
                    ? "Explore"
                    : "Create Post"}
                </Link>
              ))}

              {!user.profileCompleted && (
                <Link
                  to="/complete-profile"
                  className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold hover:bg-orange-500/30 transition"
                >
                  Complete Profile
                </Link>
              )}

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center focus:outline-none cursor-pointer"
                >
                  <img
                    src={`http://localhost:5000/api/user/profile-picture/${user.id}`}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-purple-400 hover:ring-2 hover:ring-purple-500 transition"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[2000] overflow-hidden animate-fadeIn">
                    <Link
                      to="/dashboard"
                      onClick={handleMenuClick}
                      className="block px-5 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/myprofile"
                      onClick={handleMenuClick}
                      className="block px-5 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <Link
                to="/conversation-list"
                className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-semibold hover:bg-orange-500/30 transition"
              >
                Chat
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium ${
                  isActive("/login")
                    ? "text-purple-400 border-b-2 border-purple-400 pb-1"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`text-sm font-medium ${
                  isActive("/register")
                    ? "text-purple-400 border-b-2 border-purple-400 pb-1"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 space-y-3">
          {user ? (
            <>
              {["/", "/explore", "/create-Post"].map((path, idx) => (
                <Link
                  key={idx}
                  to={path}
                  className={`block text-sm font-medium ${
                    isActive(path)
                      ? "text-purple-400"
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {path === "/"
                    ? "Home"
                    : path === "/explore"
                    ? "Explore"
                    : "Create Post"}
                </Link>
              ))}
              <Link
                to="/dashboard"
                className="block text-sm text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/myprofile"
                className="block text-sm text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`block text-sm font-medium ${
                  isActive("/login")
                    ? "text-purple-400"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`block text-sm font-medium ${
                  isActive("/register")
                    ? "text-purple-400"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
