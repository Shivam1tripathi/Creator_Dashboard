import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function BottomInfo({
  isFollowing,
  setIsFollowing,
  userId,
  postId,
  username,
  caption,
}) {
  // ✅ Toggle follow/unfollow
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"))?.id;
  const toggleFollow = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/user/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  return (
    <div className="absolute bottom-3 left-3 text-white w-11/12 md:w-3/4">
      {/* Profile + Username + Follow */}
      <div className="flex items-center space-x-2">
        <img
          src={`${API_URL}/user/profile-picture/${userId}`}
          alt="profile"
          className="w-9 h-9 rounded-full border border-gray-300 object-cover"
        />
        <div className="flex items-center space-x-1">
          <span
            onClick={() => {
              navigate(`/profile/${userId}`);
            }}
            className="text-sm cursor-pointer font-semibold"
          >
            {username}
          </span>
          {currentUser !== userId && (
            <button
              onClick={toggleFollow}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              · {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* Caption */}
      <p className="text-sm mt-1 line-clamp-2">
        {caption
          ? caption.length < 43
            ? caption
            : caption.substring(0, 43) + "..."
          : "No caption available"}
      </p>
    </div>
  );
}
