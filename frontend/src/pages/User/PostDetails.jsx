import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostCard from "../../components/PostCard";

const API = import.meta.env.VITE_API_URL; // ✅ use env base URL

const PostDetails = () => {
  const { id } = useParams(); // post id from route
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`${API}/post/get-singlepost/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Fetched single post:", data.post);
        setPost(data.post);
      } catch (err) {
        console.error("Error loading post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!post)
    return <div className="text-center mt-20 text-red-500">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <PostCard post={post} />
    </div>
  );
};

export default PostDetails;
