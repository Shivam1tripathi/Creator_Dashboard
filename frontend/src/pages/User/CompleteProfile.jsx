import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const CompleteProfile = () => {
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
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
      if (err.response) {
        alert(`Error: ${err.response.data.msg || "Something went wrong"}`);
      } else {
        alert("Error completing profile. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-200 via-pink-200 to-red-200 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center">
          Complete Your Profile
        </h2>

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6"
        >
          <textarea
            id="bio"
            placeholder="Write a short bio..."
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-md p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />

          <div>
            <label
              htmlFor="profilePicture"
              className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-colors"
            >
              {profilePicture ? (
                <p className="text-purple-700 font-medium">
                  {profilePicture.name}
                </p>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    className="w-10 h-10 mb-3 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    ></path>
                  </svg>
                  <p className="text-sm text-purple-500">
                    Click to upload or drag and drop
                  </p>
                </>
              )}
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition-colors duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
