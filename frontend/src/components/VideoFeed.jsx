import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VideoCard from "./VideoCard";

const API_URL = import.meta.env.VITE_API_URL;

export default function VideoFeed() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Initial loader
  const [fetchingMore, setFetchingMore] = useState(false); // ✅ Loader for infinite scroll
  const [activeId, setActiveId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  const navigate = useNavigate();

  // ✅ Fetch feed videos (with pagination)
  const fetchFeed = useCallback(
    async (pageNum) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setFetchingMore(true);

        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/post/video-feed?page=${pageNum}&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data?.feed?.length > 0) {
          setReels((prev) =>
            pageNum === 1 ? res.data.feed : [...prev, ...res.data.feed]
          );
          setHasMore(pageNum < res.data.totalPages);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [API_URL]
  );

  useEffect(() => {
    fetchFeed(page);
  }, [page, fetchFeed]);

  // ✅ Infinite scroll observer
  const lastVideoRef = useCallback(
    (node) => {
      if (fetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchingMore, hasMore]
  );

  // ✅ Full screen loader for first fetch
  if (loading && page === 1) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-lg">
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

      {/* ✅ Volume & Mute Control */}
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
            setIsMuted(v === 0);
          }}
          className="w-24"
        />
      </div>

      {reels.length > 0 ? (
        reels.map((reel, idx) => {
          if (idx === reels.length - 1) {
            // ✅ Attach ref to last element for infinite scroll
            return (
              <div
                key={reel.postId}
                ref={lastVideoRef}
                className="h-screen snap-start"
              >
                <VideoCard
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
            );
          } else {
            return (
              <div key={reel.postId} className="h-screen snap-start">
                <VideoCard
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
            );
          }
        })
      ) : (
        <div className="h-screen flex items-center justify-center text-gray-400">
          No videos in your feed
        </div>
      )}

      {/* ✅ Loader for infinite scroll */}
      {fetchingMore && (
        <div className="h-20 flex items-center justify-center text-gray-400">
          Loading more...
        </div>
      )}
    </div>
  );
}
