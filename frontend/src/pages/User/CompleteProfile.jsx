import { useEffect, useState } from "react";
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
      setPreview(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    if (user.profileCompleted === true) {
      navigate("/");
    }
  });
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
      window.location.reload();
    } catch (err) {
      console.error("Profile completion error:", err);
      alert(
        err.response?.data?.msg ||
          "Error completing profile. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-700 via-pink-600 to-orange-500 p-6">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-xl p-10 space-y-8 transition-all transform hover:scale-[1.01]">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-extrabold text-gray-900">
            🎉 Complete Your Profile
          </h2>
          <p className="text-gray-500 text-sm">
            Add a bio & profile picture to personalize your journey.
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
            <div className="relative group">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                }
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-xl group-hover:opacity-80 transition"
              />
              <label
                htmlFor="profilePicture"
                className="absolute bottom-2 right-2 bg-purple-600 text-white p-3 rounded-full cursor-pointer hover:bg-purple-700 shadow-lg flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
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
            <p className="text-xs text-gray-400">
              Upload a square image for best results
            </p>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-left text-gray-700 font-medium mb-2"
            >
              Your Bio
            </label>
            <textarea
              id="bio"
              placeholder="Write a short bio about yourself..."
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-md"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-all transform hover:scale-[1.02]"
          >
            🚀 Save & Continue
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center">
          You can always edit your profile later in my profile.
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;
