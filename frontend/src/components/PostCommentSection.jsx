import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const PostCommentSection = ({ postId, expanded, setExpanded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `${API_URL}/post/post-comments/${postId}`
      );

      setComments(data.comments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError("Unable to load comments. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const tempComment = {
      _id: Date.now(),
      text: newComment,
      createdAt: new Date().toISOString(),
      user: { _id: "me", username: "You" }, // temporary until API response
    };

    setComments([tempComment, ...comments]); // optimistic update
    setNewComment("");

    try {
      setPosting(true);
      await axios.post(
        `${API_URL}/post/addpostcomment/${postId}`,
        { text: tempComment.text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchComments(); // refresh to sync with backend
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to post comment. Please try again.");
      setComments(comments.filter((c) => c._id !== tempComment._id)); // rollback
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="px-4 pb-4 border-t border-gray-100 mt-2">
      {/* Toggle comments */}
      {comments.length != 0 && (
        <div
          className="text-sm px-1 text-blue-500 mb-2 cursor-pointer hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide comments" : `View all ${comments.length} comments`}
        </div>
      )}
      {/* Error */}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* Comments List */}
      {expanded && (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((c) => (
              <Link
                to={c.user?._id !== "me" ? `/profile/${c.user?._id}` : "#"}
                key={c._id}
                className="flex items-start gap-3"
              >
                <img
                  src={`${API_URL}/user/profile-picture/${c.user._id}`}
                  className="w-7 h-7 rounded-full object-cover border"
                  alt="avatar"
                />
                <div className="bg-gray-100 px-3 py-2 rounded-lg shadow-sm flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-800">
                      {c.user.username}:
                    </span>{" "}
                    {c.text}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          )}
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
          disabled={posting}
        />
        <button
          onClick={handleAddComment}
          disabled={posting}
          className="text-sm bg-blue-500 cursor-pointer text-white px-3 py-1 rounded-full hover:bg-blue-600 transition disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostCommentSection;
