import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SavedPostCard from "../../components/SavedPostCard";

const API = import.meta.env.VITE_API_URL; // ✅ base API from .env

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const { data } = await axios.get(`${API}/user/saved`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
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
          <SavedPostCard key={post._id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
