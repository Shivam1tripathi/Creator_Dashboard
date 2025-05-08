import { useEffect, useState } from "react";
import axios from "axios";

import Loader from "../components/Loader";
import Card from "../components/Card";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/feed", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to load feed:", err.response?.data?.msg);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleSave = async (post) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/save",
        { post },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Post saved!");
    } catch (err) {
      console.error("Failed to save post:", err.response?.data?.msg);
    }
  };

  const handleReport = async (post) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/report",
        { post },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Post reported!");
    } catch (err) {
      console.error("Failed to report post:", err.response?.data?.msg);
    }
  };

  const handleShare = (post) => {
    try {
      navigator.clipboard.writeText(post.link);
      alert("Post link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-4  space-y-4">
      <h2 className="text-2xl font-bold">Feed</h2>
      <div className="flex flex-wrap px-20 justify-between">
        {posts.map((post, idx) => (
          <Card
            post={post}
            onSave={handleSave}
            onShare={handleShare}
            onReport={handleReport}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
