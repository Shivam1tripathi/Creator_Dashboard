import { useEffect, useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import ShortVideoCommentBox from "./ShortVideoCommentBox";

const API_URL = import.meta.env.VITE_API_URL;

export default function ActionBar({ postId, totalcomments, activeId }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setShowComments(false); // auto close when switching reel
  }, [activeId]);

  // ✅ Fetch likes & saved state on mount
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Likes count
        const likesRes = await axios.get(`${API_URL}/post/likes/${postId}`);
        setLikes(likesRes.data.likes.length || 0);

        // Check if liked
        const likedRes = await axios.post(
          `${API_URL}/post/is-liked`,
          { postId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(likedRes.data.isLiked);

        // Check if saved
        const savedRes = await axios.get(`${API_URL}/user/is-saved/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(savedRes.data.isSaved);
      } catch (err) {
        console.error("Failed to fetch post data:", err);
      }
    };
    fetchPostData();
  }, [postId]);

  // ❤️ Like / Unlike
  const toggleLike = async () => {
    try {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));

      const { data } = await axios.post(
        `${API_URL}/post/like/${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const likedRes = await axios.post(
        `${API_URL}/post/is-liked`,
        { postId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setLikes(data.totalLikes);
      setLiked(likedRes.data.isLiked);
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      toast.error("Failed to update like!");
    }
  };

  // 📌 Save / Unsave
  const toggleSave = async () => {
    try {
      const { data } = await axios.post(
        `${API_URL}/user/save-post`,
        { postId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSaved((prev) => !prev);
      toast.success(data.msg);
    } catch (error) {
      console.error("Save post error:", error);
      toast.error("Failed to update saved status!");
    }
  };

  // 🔗 Share
  const handleShare = async () => {
    try {
      const link = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link!");
    }
  };

  return (
    <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-5 text-white">
      {/* ❤️ Like */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={toggleLike}
      >
        <Heart
          className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : ""}`}
        />
        <span className="text-xs">{likes}</span>
      </div>

      {/* 💬 Comments */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => setShowComments(true)}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="text-xs">{totalcomments || 0}</span>
      </div>
      {showComments && (
        <ShortVideoCommentBox
          postId={postId}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* 🔗 Share */}
      <div className="relative flex flex-col items-center">
        <Share2 onClick={handleShare} className="w-7 h-7 cursor-pointer" />
        {copied && (
          <span className="absolute top-8 bg-black text-white text-xs rounded px-2 py-1">
            Copied!
          </span>
        )}
      </div>

      {/* 📌 Save */}
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={toggleSave}
      >
        <Bookmark className={`w-7 h-7 ${saved ? "fill-white" : ""}`} />
      </div>
    </div>
  );
}
