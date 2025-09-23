import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const UpdatePost = () => {
  const { pid } = useParams(); // post id from route
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState(""); // image or video
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch post details on mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${API_URL}/post/get-singlepost/${pid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCaption(data.post.caption || "");
        setTags(data.post.tags?.join(", ") || "");
        setType(data.post.type); // image or video
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to fetch post");
      }
    };
    fetchPost();
  }, [pid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/post/update/${pid}`,
        {
          caption,
          tags: tags.split(",").map((tag) => tag.trim()), // convert string -> array
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(data.msg || "Post updated successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Post</h2>

        {/* Media Preview */}
        <div className="mb-6 flex justify-center">
          {type === "image" ? (
            <img
              src={`${API_URL}/post/post-content/${pid}`}
              alt="Post Preview"
              className="w-2/4 h-64 object-cover rounded-xl shadow"
            />
          ) : (
            <video
              controls
              className="w-2/4 h-64 object-cover rounded-xl shadow"
            >
              <source src={`${API_URL}/post/post-content/${pid}`} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {message && <p className="text-green-600 mb-3">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter caption"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. travel, photography, summer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePost;
