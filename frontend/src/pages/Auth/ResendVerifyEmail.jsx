import { useState } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";

const ResendVerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [verifyurl, setVerifyUrl] = useState();
  const handleResend = async () => {
    try {
      setLoading(true);
      setMessage("");

      const email = localStorage.getItem("verificationEmail");
      if (!email) {
        setMessage("❌ Email not found in session.");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
        { email }
      );
      setVerifyUrl(res.data.verifyUrl);
      setMessage(`✅ ${res.data.msg || "Verification email resent!"}`);
      setDisabled(true);

      // Start 30s countdown
      let timeLeft = 30;
      setCountdown(timeLeft);
      sendEmail();
      const interval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);
          setDisabled(false);
        }
      }, 1000);
    } catch (err) {
      setMessage(
        `❌ ${err.response?.data?.msg || "Failed to resend verification email"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    const templateParams = {
      user_email: localStorage.getItem("verificationEmail"),
      verify_link: verifyurl,
    };

    try {
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID_2,
        import.meta.env.VITE_EMAILJS_Resend_Email_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY_2
      );

      toast.success("✅ Verification Email sent!");
    } catch (error) {
      toast.error("❌ Email failed");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          📧 Verify Your Email
        </h1>
        <p className="text-gray-600 mb-6">
          We’ve sent a verification link to your email. <br />
          Please check your inbox and click the link to activate your account.
        </p>

        <button
          onClick={handleResend}
          disabled={disabled || loading}
          className={`w-full py-2 px-4 rounded-lg font-medium transition ${
            disabled || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Sending..."
            : disabled
            ? `Resend available in ${countdown}s`
            : "Resend Verification Email"}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResendVerifyEmail;
