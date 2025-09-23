// PostCard.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";
import PostCommentSection from "./PostCommentSection";
import ReportModal from "./ReportModal"; // 👈 import
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_URL;

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState();
  const [objectFit, setObjectFit] = useState("contain");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reportOpen, setReportOpen] = useState(false); // 👈 modal state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const [likesRes, savedRes, likedRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/post/likes/${post._id}`),
          axios.get(`${API_URL}/user/is-saved/${post._id}`, { headers }),
          axios.post(
            `${API_URL}/post/is-liked`,
            { postId: post._id },
            { headers }
          ),
          axios.get(`${API_URL}/post/get-user/${post._id}`, { headers }),
        ]);

        setLikesCount(likesRes.data.likesCount);
        setSaved(savedRes.data.isSaved);
        setLiked(likedRes.data.isLiked);
        setUser(userRes.data.user);
        setCurrentUser(JSON.parse(localStorage.getItem("user")));
      } catch (error) {
        console.error("Failed to load post data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [post._id]);

  const toggleLike = async () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const { data } = await axios.post(
        `${API_URL}/post/like/${post._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLikesCount(data.totalLikes);
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const toggleSave = async () => {
    setSaved((prev) => !prev);
    try {
      const data = await axios.post(
        `${API_URL}/user/save-post`,
        { postId: post._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(data.data.msg);
    } catch (error) {
      toast.error("Failed to Saved post!");
      setSaved((prev) => !prev);
    }
  };

  const handleShare = async () => {
    try {
      const link = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Post Copied successfully!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to Copied post!");
    }
  };

  const handleReport = async (reason) => {
    try {
      await axios.post(
        `${API_URL}/post/${post._id}/report`,
        { reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Post reported successfully!");
    } catch (error) {
      toast.error("Failed to report post!");
    }
  };

  // Empty handlers
  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (!confirmDelete) return;

      const token = localStorage.getItem("token"); // assuming JWT stored in localStorage
      await axios.delete(`${API_URL}/post/delete-post/${post._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Post deleted successfully!");

      navigate("/");
    } catch (error) {
      toast.error("Failed to delete post.");
    }
  };
  const handleUpdate = () => {
    navigate(`/post/update/${post._id}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow p-4 mt-4 max-w-md mx-auto">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-80 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mt-3"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 mt-5 overflow-hidden transition-transform hover:scale-[1.01]">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100 relative">
          <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
            <img
              src={`${API_URL}/user/profile-picture/${
                post?.user._id || post?.user
              }`}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover border border-gray-300"
            />
            <p className="font-semibold text-gray-800">{user?.username}</p>
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="text-gray-400 text-lg hover:text-gray-600"
            >
              •••
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                <button
                  onClick={() => {
                    setReportOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Report
                </button>

                {currentUser?.id === user?._id && (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Update
                    </button>
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Media */}
        <div
          className="w-full h-80 bg-gray-100 cursor-pointer group"
          onClick={() =>
            setObjectFit((prev) => (prev === "cover" ? "contain" : "cover"))
          }
        >
          {post.type === "image" ? (
            <img
              src={`${API_URL}/post/post-content/${post._id}`}
              alt="post"
              className={`h-full w-full object-${objectFit} transition-all duration-300`}
            />
          ) : (
            <video
              src={`${API_URL}/post/post-content/${post._id}`}
              controls
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-6 text-xl">
            <button
              onClick={toggleLike}
              className="flex cursor-pointer items-center space-x-1 hover:scale-110 transition"
            >
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              <span className="text-sm text-gray-600">{likesCount}</span>
            </button>

            <FaRegComment
              onClick={() => setExpanded((prev) => !prev)}
              className="cursor-pointer hover:text-blue-500 transition hover:scale-110"
            />

            <div className="relative">
              <FiSend
                onClick={handleShare}
                className="cursor-pointer hover:text-blue-500 transition hover:scale-110"
              />
              {copied && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1">
                  Copied!
                </span>
              )}
            </div>
          </div>

          <button
            onClick={toggleSave}
            className="hover:scale-110 cursor-pointer transition"
          >
            {saved ? (
              <FaBookmark className="text-blue-600" />
            ) : (
              <FaRegBookmark />
            )}
          </button>
        </div>

        {/* Caption */}
        <div className="px-4 pb-2 text-sm text-gray-700">
          <span className="font-semibold">{user?.username} </span>
          {post.caption}
          {post.tags &&
            post.tags.map((tag, i) => (
              <span key={i} className="text-blue-500 ml-1">
                #{tag.trim()}
              </span>
            ))}
        </div>

        <PostCommentSection
          postId={post._id}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </>
  );
};

export default PostCard;
