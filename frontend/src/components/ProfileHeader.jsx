// src/components/ProfileHeader.jsx
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfileHeader({
  singleuser,
  media,
  isFollowing,
  updatingFollow,
  toggleFollow,
  onProfileUpdate, // optional callback
}) {
  const { user: currentUser, setUser } = useAuth();
  const profilePicId = singleuser?._id || currentUser?._id || currentUser?.id;

  // State
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: singleuser?.firstName || "",
    lastName: singleuser?.lastName || "",
    username: singleuser?.username || "",
    bio: singleuser?.bio || "",
    phoneNumber: singleuser?.phoneNumber || "",
    profilePicture: null,
  });
  const [previewPic, setPreviewPic] = useState(
    `${API_URL}/user/profile-picture/${profilePicId}`
  );
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Input change handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files?.[0]) {
      const file = files[0];
      setFormData({ ...formData, profilePicture: file });
      setPreviewPic(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Profile update
  const handleUpdate = async () => {
    if (phoneError) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) form.append(key, formData[key]);
      });

      const { data: updatedUser } = await axios.patch(
        `${API_URL}/user/update-profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // update auth context
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (onProfileUpdate) onProfileUpdate();
      setEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMsg(
        err.response?.data?.msg || "Something went wrong updating profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md p-6 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-5 w-full md:w-2/3">
        <img
          src={previewPic}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {singleuser?.firstName && singleuser?.lastName
              ? `${singleuser.firstName} ${singleuser.lastName}`
              : singleuser?.name || "Anonymous"}
          </h2>
          <h3 className="text-sm font-medium text-purple-600">
            @{singleuser?.username}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {singleuser?.bio || "No description provided."}
          </p>
        </div>
      </div>

      {/* Right: Stats + Button */}
      <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-1/3">
        <div className="flex justify-around w-full text-center">
          {[
            { label: "Followers", value: singleuser?.followers?.length || 0 },
            { label: "Following", value: singleuser?.following?.length || 0 },
            { label: "Posts", value: media || 0 },
            { label: "Credits", value: singleuser?.credits || 0 },
          ].map((stat, i) => (
            <div
              key={i}
              className="px-3 py-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-bold text-gray-800">{stat.value}</h3>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {currentUser?._id !== singleuser?._id ? (
          <button
            onClick={toggleFollow}
            disabled={updatingFollow}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              isFollowing
                ? "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            } ${updatingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {updatingFollow ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-2 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setEditing(false)}
        >
          <div
            className="bg-white p-6 mt-16 rounded-2xl shadow-2xl w-full max-w-md space-y-5 animate-fadeIn 
                  max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              ✨ Edit Profile
            </h2>

            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewPic}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-md"
              />
              <label className="cursor-pointer bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition">
                Change Picture
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[+]?\d{10,15}$/.test(value)) {
                    setFormData({ ...formData, phoneNumber: value });
                    setPhoneError("");
                  } else {
                    setPhoneError("Enter a valid phone number (10–15 digits)");
                  }
                }}
                className={`w-full border px-4 py-2 rounded-lg focus:ring-2 outline-none transition ${
                  phoneError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {phoneError && (
                <p className="text-red-500 text-sm mt-1">{phoneError}</p>
              )}
            </div>

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={loading || !!phoneError}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
