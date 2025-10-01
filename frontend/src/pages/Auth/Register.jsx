import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";

let usernameTimer;
const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const [verifyurl, setVerifyUrl] = useState();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });

      if (name === "username") {
        clearTimeout(usernameTimer);
        setUsernameError("");
        setCheckingUsername(true);
        usernameTimer = setTimeout(() => checkUsername(value), 500);
      }
    }
  };

  const checkUsername = async (username) => {
    if (!username) return;
    try {
      await axios.post(`${API}/auth/uniqueusername`, { username });
      setUsernameError(""); // ✅ available
    } catch (err) {
      setUsernameError(err.response?.data?.msg || "Username not available");
    } finally {
      setCheckingUsername(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError) return;

    setLoading(true); // ✅ disable button when request starts
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const { data } = await axios.post(`${API}/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setVerifyUrl(data.verifyUrl);

      sendEmail();
      if (data.result === true) {
        localStorage.setItem("verificationEmail", form.email);
        navigate("/Resend-verify-email");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false); // ✅ re-enable after request finishes
    }
  };

  const sendEmail = async () => {
    const templateParams = {
      user_name: form.firstName + " " + form.lastName,
      user_email: form.email,
      verify_link: verifyurl,
    };

    try {
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("✅ Verification Email sent!");
    } catch (error) {
      toast.error("❌ Email failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-16 left-16 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-16 right-16 animate-pulse"></div>

      {/* Register Card */}
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Create an Account
        </h2>
        <p className="text-center text-gray-300 mb-6 text-sm">
          Sign up to get started with your digital platform
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First & Last Name */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border border-gray-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <label className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400">
                First Name
              </label>
            </div>

            <div className="relative flex-1">
              <Input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder=" "
                className="peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border border-gray-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <label className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400">
                Last Name
              </label>
            </div>
          </div>

          {/* Username & Phone */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder=" "
                className={`peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border ${
                  usernameError ? "border-red-400" : "border-gray-500/30"
                } text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500 outline-none`}
              />
              <label className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400">
                Username
              </label>
              {checkingUsername && (
                <span className="text-xs text-gray-400 mt-1">Checking...</span>
              )}
              {usernameError && (
                <span className="text-xs text-red-400 mt-1">
                  {usernameError}
                </span>
              )}
              {!usernameError && form.username && !checkingUsername && (
                <span className="text-xs text-green-400 mt-1">
                  ✓ Username available
                </span>
              )}
            </div>

            <div className="relative flex-1">
              <Input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  // ✅ Allow only digits and max 10
                  if (/^\d{0,10}$/.test(value)) {
                    setForm({ ...form, phone: value });
                  }
                }}
                placeholder=" "
                className={`peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border 
      ${
        form.phone && form.phone.length !== 10
          ? "border-red-400"
          : "border-gray-500/30"
      } 
      text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500 outline-none`}
              />
              <label className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400">
                Phone Number
              </label>

              {/* Error message */}
              {form.phone && form.phone.length !== 10 && (
                <span className="text-xs text-red-400 mt-1 block">
                  Phone number must be 10 digits
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border border-gray-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <label className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400">
              Email Address
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full px-3 pt-5 pb-2 rounded-lg bg-white/5 border border-gray-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <label className="absolute left-3 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-400">
              Password
            </label>
          </div>

          <Button
            type="submit"
            disabled={!!usernameError || loading} // disable if error OR loading
            className={`w-full font-semibold py-3 rounded-lg shadow-lg transition-transform transform 
    ${
      loading
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-purple-600 hover:bg-purple-700 text-white hover:scale-105"
    }
  `}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-purple-300 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
