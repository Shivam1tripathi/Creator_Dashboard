import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/user/saved",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading your saved posts...
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-600">
        <p className="text-xl font-semibold">No saved posts yet</p>
        <p className="text-sm">
          Start saving posts you like, and they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Saved Posts</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post, index) => (
          <motion.div
            key={post._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-md cursor-pointer overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer"
            onClick={() => navigate(`/post/${post._id}`)} // 👈 Navigate to detail page
          >
            {post.type === "image" && (
              <img
                src={`http://localhost:5000/api/post/post-content/${post._id}`}
                alt={post.caption}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
            )}
            {post.type === "video" && (
              <video
                src={`http://localhost:5000/api/post/post-content/${post._id}`}
                className="w-full h-56 object-cover"
                controls
              />
            )}
            <div className="p-4">
              <p className="font-semibold text-gray-800">{post.caption}</p>
              <p className="text-sm text-gray-500 mt-1">
                by {post.user?.username || "Unknown"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
