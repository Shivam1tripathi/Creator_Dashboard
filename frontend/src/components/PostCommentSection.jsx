import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PostCommentSection = ({ postId, expanded, setExpanded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/post/post-comments/${postId}`
      );
      setComments(data.comments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/post/addpostcomment/${postId}`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewComment("");
      fetchComments(); // refresh comments
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="px-4 pb-4 border-t border-gray-100 mt-2">
      {/* Toggle comments */}
      <div
        className="text-sm px-1 text-blue-500 mb-2 cursor-pointer hover:underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide comments" : `View all ${comments.length} comments`}
      </div>

      {/* Comments List */}
      {expanded && (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {comments.map((c) => (
            <Link
              to={`/profile/${c.user._id}`}
              key={c._id}
              className="flex items-start gap-3"
            >
              <img
                src={`http://localhost:5000/api/user/profile-picture/${c.user._id}`}
                className="w-7 h-7 rounded-full object-cover border"
                alt="avatar"
              />
              <div className="bg-gray-100 px-3 py-2 rounded-lg shadow-sm flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-gray-800">
                    {c.user.username}
                  </span>{" "}
                  {c.text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <div className="flex items-center mt-3 gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border border-gray-300 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Add a comment..."
        />
        <button
          onClick={handleAddComment}
          className="text-sm bg-blue-500 cursor-pointer text-white px-3 py-1 rounded-full hover:bg-blue-600 transition"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default PostCommentSection;
