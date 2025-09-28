import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function SavedPostCard({ post, index }) {
  const [posturl, setPostUrl] = useState();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const Fetch = async () => {
      try {
        const url = await axios.get(
          `${API_URL}/post/post-content/${post._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPostUrl(url.data.contentUrl);
      } catch (error) {
        toast.error("network error");
      }
    };
    Fetch();
  }, [post._id]);
  return (
    <motion.div
      key={post._id || index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer"
      onClick={() => navigate(`/post/${post._id}`)}
    >
      {post.type === "image" && (
        <img
          src={posturl}
          alt={post.caption}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
      )}
      {post.type === "video" && (
        <video src={posturl} className="w-full h-56 object-cover" controls />
      )}
      <div className="p-4">
        <p className="font-semibold text-gray-800">{post.caption}</p>
        <p className="text-sm text-gray-500 mt-1">
          by {post.user?.username || "Unknown"}
        </p>
      </div>
    </motion.div>
  );
}
