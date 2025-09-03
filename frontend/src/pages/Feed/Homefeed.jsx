import axios from "axios";
import { useEffect, useState, useRef } from "react";
import PostCard from "../../components/PostCard";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const Homefeed = () => {
  const [posts, setPosts] = useState([]);
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [updatingFollowId, setUpdatingFollowId] = useState(null);
  const fetchedPages = useRef(new Set());

  /* ---------------- Fetch Posts ---------------- */
  const fetchPosts = async () => {
    if (fetchedPages.current.has(page)) return;
    fetchedPages.current.add(page);
    setLoading(true);

    try {
      const config = {};

      if (localStorage.getItem("token")) {
        config.headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
      }

      const { data } = await axios.get(
        `${API}/feed/paginated?page=${page}&limit=3`,
        config
      );

      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(page < data.totalPages);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Fetch Suggested Users ---------------- */
  const fetchSuggestedUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/user/suggested-users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuggestedUsers(data.suggestions || []);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
    }
  };

  /* ---------------- Fetch Top Users ---------------- */
  const fetchTopUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/user/top-followed`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTopUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching top users:", err);
    }
  };

  /* ---------------- Toggle Follow ---------------- */
  const toggleFollow = async (userId, listType) => {
    try {
      setUpdatingFollowId(userId);
      const { data } = await axios.post(
        `${API}/user/follow/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (listType === "suggested") {
        setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));
      } else if (listType === "top") {
        setTopUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? {
                  ...u,
                  isFollowing: data.isFollowing,
                  followersCount: data.followersCount,
                }
              : u
          )
        );
      }

      await Promise.all([fetchSuggestedUsers(), fetchTopUsers()]);
    } catch (err) {
      console.error("Follow/unfollow error:", err);
    } finally {
      setUpdatingFollowId(null);
    }
  };

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    fetchPosts();
  }, [page]);

  useEffect(() => {
    fetchSuggestedUsers();
    fetchTopUsers();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-6 max-w-7xl mx-auto">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col space-y-4 p-5 bg-white/90 backdrop-blur rounded-xl shadow-xl h-fit sticky top-20 self-start">
        <h3 className="text-lg font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
          📌 Navigation
        </h3>
        <ul className="space-y-2 text-gray-700">
          {[
            { to: "/", label: "Home", icon: "🏠" },
            { to: "/trending-posts", label: "Trending", icon: "🔥" },
            { to: "/saved-posts", label: "Saved", icon: "⭐" },
          ].map((item, i) => (
            <li key={i}>
              <Link
                to={item.to}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all duration-200"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Center Feed */}
      <main className="max-w-2xl mx-auto w-full space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-6 cursor-pointer py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:shadow-md transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            🎉 You have seen all posts!
          </p>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block space-y-6 p-5 bg-white/90 backdrop-blur rounded-xl shadow-xl h-fit sticky top-20 self-start">
        {/* Suggested Users */}
        <section>
          <h3 className="text-lg font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
            ✨ Suggested Users
          </h3>
          {suggestedUsers.length === 0 ? (
            <p className="text-gray-500 text-sm mt-2">
              No suggestions available.
            </p>
          ) : (
            <ul className="space-y-3 mt-3">
              {suggestedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between cursor-pointer items-center p-2 rounded-lg border hover:shadow-lg transition-all duration-200 bg-white/60"
                >
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={`${API}/user/profile-picture/${user._id}`}
                      className="w-10 h-10 rounded-full object-cover border"
                      alt={user.username}
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-800">
                        @{user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        Suggested for you
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => toggleFollow(user._id, "suggested")}
                    disabled={updatingFollowId === user._id}
                    className={`px-3 py-1 cursor-pointer text-xs font-medium rounded-full transition-all ${
                      updatingFollowId === user._id
                        ? "bg-blue-400 text-white opacity-50"
                        : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {updatingFollowId === user._id ? "..." : "Follow"}
                  </button>
                </div>
              ))}
            </ul>
          )}
        </section>

        {/* Top Users */}
        <section>
          <h3 className="text-lg font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
            🏆 Top Users
          </h3>
          {topUsers.length === 0 ? (
            <p className="text-gray-500 text-sm mt-2">No top users found.</p>
          ) : (
            <ul className="space-y-3 mt-3">
              {topUsers.map((user, index) => (
                <Link
                  to={`/profile/${user._id}`}
                  key={user._id}
                  className="block group"
                >
                  <div className="flex justify-between items-center p-3 rounded-lg border hover:shadow-lg transition-all duration-200 bg-white/60 group-hover:bg-white">
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <span
                        className={`w-7 h-7 flex items-center justify-center text-xs font-bold text-white rounded-full ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-400 to-gray-600"
                            : index === 2
                            ? "bg-gradient-to-r from-amber-600 to-yellow-700"
                            : "bg-blue-400"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <img
                        src={`${API}/user/profile-picture/${user._id}`}
                        className="w-9 h-9 rounded-full object-cover border"
                        alt={user.username}
                      />

                      <div>
                        <span className="block text-sm font-semibold text-gray-800">
                          {currentUser.id !== user._id
                            ? "@" + user.username
                            : "You"}
                        </span>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Score: {user.rankScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentUser.id !== user._id && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFollow(user._id, "top");
                        }}
                        disabled={updatingFollowId === user._id}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                          user.isFollowing
                            ? "bg-green-600 text-white"
                            : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        } ${updatingFollowId === user._id ? "opacity-50" : ""}`}
                      >
                        {updatingFollowId === user._id
                          ? "..."
                          : user.isFollowing
                          ? "Following"
                          : "Follow"}
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
};

export default Homefeed;
