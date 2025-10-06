import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Home,
  Compass,
  PlusCircle,
  Video,
  User,
  LogOut,
  MessageSquare,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/explore", label: "Explore", icon: <Compass size={18} /> },
    {
      path: "/create-post",
      label: "Create Post",
      icon: <PlusCircle size={18} />,
    },
    { path: "/video-feed", label: "Short Video", icon: <Video size={18} /> },
    {
      path: "/conversation-list",
      label: "Chat",
      icon: <MessageSquare size={18} />,
    },
  ];

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset states on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* NAVBAR WRAPPER */}
      <nav className="bg-gray-900/90 backdrop-blur-lg shadow-md border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-extrabold flex items-center gap-1 tracking-tight text-white hover:text-purple-400 transition-colors"
          >
            <img src="/CreatorhubProfile.png" className="w-10 rounded-full" />
            Lynk<span className="text-purple-400">Kr</span>
          </Link>

          {/* -------- DESKTOP VIEW -------- */}
          <div className="hidden md:flex items-center gap-6 relative">
            {user ? (
              <>
                {navLinks.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive(path)
                        ? "text-purple-400 border-b-2 border-purple-400 pb-1"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`text-sm font-medium ${
                      isActive("/admin")
                        ? "text-purple-400 border-b-2 border-purple-400 pb-1"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Admin
                  </Link>
                )}

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
                      src={`${API_URL}/user/profile-picture/${user.id}`}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border-2 border-purple-400 hover:ring-2 hover:ring-purple-500 transition"
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[2000] animate-fadeInScale">
                      <Link
                        to="/dashboard"
                        className="block px-5 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/myprofile"
                        className="block px-5 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-5 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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

          {/* -------- MOBILE MENU BUTTON -------- */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <Menu size={26} />
          </button>
        </div>
      </nav>

      {/* Spacer */}
      <div className="pt-16"></div>

      {/* -------- MOBILE DRAWER -------- */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          ></div>

          <div
            className={`fixed top-0 right-0 w-72 h-full bg-gray-900 border-l border-gray-800 shadow-lg z-50 p-6 transform transition-transform duration-300 md:hidden ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {user ? (
              <>
                {/* User Profile */}
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={`${API_URL}/user/profile-picture/${user.id}`}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border-2 border-purple-400"
                  />
                  <div>
                    <p className="text-white font-semibold">{user.username}</p>
                    <p className="text-gray-400 text-xs">{user.role}</p>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-3">
                  {navLinks.map(({ path, label, icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                        isActive(path)
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  ))}

                  <Link
                    to="/myprofile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive("/myprofile")
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:bg-gray-800 hover:text-red-300 w-full text-left"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
