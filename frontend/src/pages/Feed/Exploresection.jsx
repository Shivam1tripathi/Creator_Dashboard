import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const ExploreSection = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("users");
  const [results, setResults] = useState([]);
  const [followMap, setFollowMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

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

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  /* ---------------- Search Handler ---------------- */
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const endpoint =
        type === "users"
          ? `${API}/user/search-users?q=${query}`
          : `${API}/post/search-posts?q=${query}`;

      const { data } = await axios.get(endpoint);
      const list = type === "users" ? data.users : data.posts;
      setResults(list);
      setFollowMap({});

      if (type === "users" && currentUser) await prefetchFollowStatus(list);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Prefetch Follow Status ---------------- */
  const prefetchFollowStatus = async (users) => {
    const map = {};
    await Promise.all(
      users.map(async (u) => {
        if (u._id === currentUser._id) return (map[u._id] = false);
        try {
          const { data } = await axios.get(
            `${API}/user/is-following/${currentUser.id}/${u._id}`
          );
          map[u._id] = data.isFollowing;
        } catch {
          map[u._id] = false;
        }
      })
    );
    setFollowMap(map);
  };

  /* ---------------- Toggle Follow ---------------- */
  const toggleFollow = async (targetId) => {
    try {
      await axios.post(
        `${API}/user/follow/${targetId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFollowMap((prev) => ({ ...prev, [targetId]: !prev[targetId] }));
    } catch (err) {
      console.error("Follow toggle error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Explore 🔍
      </h1>

      {/* Search Bar & Tabs */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${type === "users" ? "users" : "posts"}…`}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <div className="flex gap-2">
          {["users", "posts"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setResults([]);
                setFollowMap({});
              }}
              className={`px-4 py-2 rounded-full font-medium transition ${
                type === t
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-center text-gray-500">Searching…</p>
      ) : results.length === 0 && query ? (
        <p className="text-center text-gray-500">No {type} found.</p>
      ) : (
        <div className="space-y-4">
          {/* Users */}
          {type === "users" &&
            results.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <Link
                  to={`/profile/${u._id}`}
                  className="flex items-center gap-4"
                >
                  <img
                    src={`${API}/user/profile-picture/${u._id}`}
                    alt={u.username}
                    className="w-14 h-14 rounded-full object-cover border"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {u.firstName} {u.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">@{u.username}</p>
                  </div>
                </Link>

                {currentUser && currentUser._id !== u._id && (
                  <button
                    onClick={() => toggleFollow(u._id)}
                    className={`px-4 py-1.5 w-28 cursor-pointer rounded-full text-sm font-medium transition ${
                      followMap[u._id]
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {followMap[u._id] ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))}

          {/* Posts */}
          {type === "posts" &&
            results.map((p) => (
              <Link
                key={p._id}
                to={`/post/${p._id}`}
                className="block border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="text-xs text-gray-500 mb-1">
                  Posted by @{p.user?.username || "Unknown"}
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  {p.caption}
                </div>
                {p.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
        </div>
      )}

      {/* Suggested Users Section */}
      {suggestedUsers.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Suggested for you ✨
          </h2>
          <div className="space-y-4">
            {suggestedUsers.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <Link
                  to={`/profile/${u._id}`}
                  className="flex items-center gap-4"
                >
                  <img
                    src={`${API}/user/profile-picture/${u._id}`}
                    alt={u.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <h2 className="text-md font-semibold text-gray-800">
                      {u.firstName} {u.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">@{u.username}</p>
                  </div>
                </Link>

                <button
                  onClick={() => toggleFollow(u._id)}
                  className={`px-4 py-1.5 w-28 cursor-pointer rounded-full text-sm font-medium transition ${
                    followMap[u._id]
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {followMap[u._id] ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreSection;
