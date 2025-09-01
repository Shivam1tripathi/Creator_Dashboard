import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import PostCommentSection from "./PostCommentSection";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState();
  const [object, setObject] = useState("contain");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const [likesRes, savedRes, likedRes, userRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/post/likes/${post._id}`),
          axios.get(`http://localhost:5000/api/user/is-saved/${post._id}`, {
            headers,
          }),
          axios.post(
            `http://localhost:5000/api/post/is-liked`,
            { postId: post._id },
            { headers }
          ),
          axios.get(`http://localhost:5000/api/post/get-user/${post._id}`, {
            headers,
            withCredentials: true,
          }),
        ]);

        setLikesCount(likesRes.data.likesCount);
        setSaved(savedRes.data.isSaved);
        setLiked(likedRes.data.isLiked);
        setUser(userRes.data.user);
      } catch (error) {
        console.error("Failed to load post data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [post._id]);

  const toggleLike = async () => {
    try {
      setLiked((prev) => !prev);
      const { data } = await axios.post(
        `http://localhost:5000/api/post/like/${post._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (data.success === false) setLiked((prev) => !prev);
      setLikesCount(data.totalLikes);
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
    }
  };

  const toggleSave = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/user/save-post`,
        { postId: post._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSaved((prev) => !prev);
    } catch (error) {
      console.error("Failed to save/unsave post:", error);
    }
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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 mt-5 overflow-hidden transition-transform hover:scale-[1.01]">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
          <img
            src={`http://localhost:5000/api/user/profile-picture/${
              post?.user._id || post?.user
            }`}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover border border-gray-300"
          />
          <p className="font-semibold text-gray-800">{user?.username}</p>
        </Link>
        <button className="text-gray-400 text-lg hover:text-gray-600">
          •••
        </button>
      </div>

      {/* Media */}
      <div
        className="w-full h-80 bg-gray-100 cursor-pointer group"
        onClick={() =>
          setObject((prev) => (prev === "cover" ? "contain" : "cover"))
        }
      >
        {post.type === "image" ? (
          <img
            src={`http://localhost:5000/api/post/post-content/${post._id}`}
            alt="post"
            className={`h-full w-full object-${object} transition-all duration-300`}
          />
        ) : (
          <video
            src={`http://localhost:5000/api/post/post-content/${post._id}`}
            controls
            className="h-full w-full object-contain"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center px-4 py-3">
        {/* Left: Like, Comment, Share */}
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

          <FiSend className="cursor-pointer hover:text-blue-500 transition hover:scale-110" />
        </div>

        {/* Right: Save */}
        <button
          onClick={toggleSave}
          className="hover:scale-110 cursor-pointer transition"
        >
          {saved ? <FaBookmark className="text-blue-600" /> : <FaRegBookmark />}
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

      {/* Comments Section */}
      <PostCommentSection
        postId={post._id}
        expanded={expanded}
        setExpanded={setExpanded}
      />
    </div>
  );
};

export default PostCard;
