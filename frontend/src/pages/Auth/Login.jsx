import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Input from "../../components/Input";
import { toast } from "react-toastify";
import Button from "../../components/Button";

const API = import.meta.env.VITE_API_URL;

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API}/auth/login`, form);

      // Continue with login
      login(data);
      toast.success("Login successfully!");
    } catch (err) {
      setError(
        err.response?.data?.msg || "Invalid credentials, please try again."
      );

      // Error notification
      toast.error("Failed to Login!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-80 h-80 bg-purple-600/30 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-8 rounded-2xl animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-white mb-3 tracking-wide">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Sign in to continue to{" "}
          <span className="text-purple-400 font-semibold">
            Digital Platform
          </span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/70 text-red-200 px-4 py-2 rounded-md mb-4 text-sm shadow-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            color="purple"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            color="purple"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="flex justify-between mt-5 text-sm text-gray-400">
          <a
            href="/forgot-password"
            className="hover:text-purple-300 transition-colors"
          >
            Forgot password?
          </a>
          <a
            href="/register"
            className="hover:text-purple-300 transition-colors"
          >
            Create account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
