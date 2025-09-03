import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../../components/PostCard";

const API = import.meta.env.VITE_API_URL;

const TrendingPage = () => {
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "photos"
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      setError("");

      if (activeTab === "videos") {
        const { data } = await axios.get(`${API}/post/trending-videos`);
        if (data.success) setVideos(data.videos);
        else setError("Failed to load trending videos.");
      } else {
        const { data } = await axios.get(`${API}/post/trending-photos`);
        if (data.success) setPhotos(data.photos);
        else setError("Failed to load trending photos.");
      }
    } catch (err) {
      console.error("Error fetching trending data:", err);
      setError("Server error while fetching trending data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        🔥 Trending
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-6 py-2 rounded-full cursor-pointer font-medium transition ${
            activeTab === "videos"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-6 py-2 rounded-full cursor-pointer font-medium transition ${
            activeTab === "photos"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Photos
        </button>
      </div>

      {/* Content */}
      {loading && (
        <p className="text-center text-gray-500">Loading {activeTab}...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && activeTab === "videos" && videos.length === 0 && (
        <p className="text-center text-gray-500">No trending videos found.</p>
      )}
      {!loading && !error && activeTab === "photos" && photos.length === 0 && (
        <p className="text-center text-gray-500">No trending photos found.</p>
      )}

      <div className="space-y-6">
        {activeTab === "videos" &&
          videos.map((video) => <PostCard key={video._id} post={video} />)}

        {activeTab === "photos" &&
          photos.map((photo) => <PostCard key={photo._id} post={photo} />)}
      </div>
    </div>
  );
};

export default TrendingPage;
