import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VideoCard from "./VideoCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function VideoFeed() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch feed videos
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/post/video-feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReels(res.data.feed || []);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading feed...
      </div>
    );
  }

  return (
    <div className="bg-black h-screen overflow-y-auto snap-y snap-mandatory relative">
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition"
      >
        ← Back
      </button>
      <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 bg-black/60 p-2 rounded-lg">
        <button
          className="text-white"
          onClick={() => setIsMuted((prev) => !prev)}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (v === 0) setIsMuted(true);
            else setIsMuted(false);
          }}
          className="w-24"
        />
      </div>

      {reels.length > 0 ? (
        reels.map((reel) => (
          <div key={reel.postId} className="h-screen snap-start">
            <VideoCard
              key={reel.postId}
              id={reel.postId}
              userId={reel.userId}
              username={reel.username}
              caption={reel.caption}
              activeId={activeId}
              setActiveId={setActiveId}
              volume={volume}
              totalcomments={reel.Comments}
              isMuted={isMuted}
            />
          </div>
        ))
      ) : (
        <div className="h-screen flex items-center justify-center text-gray-400">
          No videos in your feed
        </div>
      )}
    </div>
  );
}
