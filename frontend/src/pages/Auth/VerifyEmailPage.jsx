import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data } = await axios.get(
        `${API_URL}/auth/verify-email?token=${token}`
      );
      if (data.success) {
        setMessage(data.msg || "Email verified successfully!");
        toast.success(data.msg || "Email verified successfully!");
        // ✅ Only remove if present
        if (localStorage.getItem("verificationEmail")) {
          localStorage.removeItem("verificationEmail");
        }
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Verification failed. Try again.");
      toast.error(err.response?.data?.msg || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Verify Your Email
        </h2>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {message && (
          <p className="text-green-600 text-center font-medium mt-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center font-medium mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
