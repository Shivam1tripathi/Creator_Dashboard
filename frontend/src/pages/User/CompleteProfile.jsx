import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const CompleteProfile = () => {
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file)); // ✅ show preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("userId", user.id);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const response = await axios.post(
        `${API}/user/complete-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUser = {
        ...user,
        profileCompleted: true,
        bio: response.data.bio,
        credits: response.data.credits,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Profile completed successfully! 🎉");
      navigate("/dashboard");
    } catch (err) {
      console.error("Profile completion error:", err);
      alert(
        err.response?.data?.msg ||
          "Error completing profile. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-600 via-pink-500 to-red-400 p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Add a bio and profile picture to personalize your account.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6"
        >
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                }
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg"
              />
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">Upload your profile picture</p>
          </div>

          {/* Bio */}
          <div>
            <textarea
              id="bio"
              placeholder="Write a short bio about yourself..."
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-[1.02]"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
