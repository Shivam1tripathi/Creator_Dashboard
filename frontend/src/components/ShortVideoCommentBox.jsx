import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

// ⬅️ Custom function to calculate "time ago"
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function ShortVideoCommentBox({ postId, onClose }) {
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState([]);

  const fetchComments = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/post/post-comments/${postId}`
      );
      setCommentList(data.comments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/post/addpostcomment/${postId}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tempComment = {
        _id: Date.now(),
        text: newComment,
        createdAt: new Date().toISOString(),
        user: { _id: "me", username: "You" }, // temporary until API response
      };

      setCommentList((prev) => [...prev, tempComment]);
      fetchComments();
      setNewComment("");
    } catch (err) {
      toast.error("Failed to add comment!");
    }
  };

  return (
    <div
      className="
    fixed bottom-0 right-0 md:top-2 md:right-20 
    w-full h-[70%] md:w-[380px] md:h-full 
    z-[9999] 
    flex justify-center md:justify-start
    rounded-t-2xl
    items-end md:items-stretch
  "
      onClick={onClose}
    >
      {/* Wrapper */}
      <div
        className="
      bg-white 
      w-full h-full max-md:h-full md:h-5/6  md:w-[380px] 
      rounded-t-2xl md:rounded-none md:rounded-l-2xl 
      flex flex-col shadow-2xl
      animate-slideUp md:animate-slideLeft
    "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="font-semibold text-lg text-gray-800">Comments</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {commentList.length > 0 ? (
            commentList.map((c, i) => (
              <div key={i} className="flex space-x-3 items-start">
                {/* Avatar */}
                <img
                  src={`${API_URL}/user/profile-picture/${c.user._id}`}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold"
                />
                {/* Comment Content */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {c.user?.username || "User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {c.createdAt ? timeAgo(c.createdAt) : ""}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 leading-snug">
                    {c.text}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">
              No comments yet. Be the first!
            </p>
          )}
        </div>

        {/* Input box */}
        <div className="flex items-center border-t px-4 py-3 bg-gray-50">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white text-black placeholder-gray-500"
            placeholder="Add a comment..."
          />

          <button
            onClick={handleAddComment}
            className="ml-3 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium transition shadow-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
