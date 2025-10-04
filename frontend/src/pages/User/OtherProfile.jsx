import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/ProfileHeader";
import Gallery from "../../components/Gallery";

const API = import.meta.env.VITE_API_URL; // ✅ use env

const OtherProfile = () => {
  const { id: otherUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true); // 🔴 one loader for both
  const [isFollowing, setIsFollowing] = useState(false);
  const [updatingFollow, setUpdatingFollow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Run both requests in parallel
        const [userRes, mediaRes] = await Promise.all([
          axios.get(`${API}/user/single-user/${otherUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${API}/post/get-allpost/${otherUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }),
        ]);

        // ✅ Set user
        setOtherUser(userRes.data.user);
        setIsFollowing(userRes.data.user.followers?.includes(currentUser.id));

        // ✅ Set posts
        if (mediaRes.data.success) setMedia(mediaRes.data.posts || []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false); // ✅ Done when both finish
      }
    };

    fetchData();
  }, [otherUserId, currentUser]);

  /* Toggle follow */
  const toggleFollow = async () => {
    try {
      setUpdatingFollow(true);
      await axios.post(
        `${API}/user/follow/${otherUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Follow/unfollow error:", err);
    } finally {
      setUpdatingFollow(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {loading ? (
        <div className="flex items-center justify-center gap-1 py-20">
          <span className="w-1.5 h-6 bg-purple-500 rounded animate-[bounce_0.6s_infinite]" />
          <span className="w-1.5 h-6 bg-pink-500 rounded animate-[bounce_0.6s_infinite_0.2s]" />
          <span className="w-1.5 h-6 bg-blue-500 rounded animate-[bounce_0.6s_infinite_0.4s]" />
        </div>
      ) : (
        <>
          {otherUser && (
            <ProfileHeader
              singleuser={otherUser}
              media={media.length}
              isFollowing={isFollowing}
              updatingFollow={updatingFollow}
              toggleFollow={toggleFollow}
            />
          )}

          {/* Gallery Section */}
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">
              {otherUser?.username}'s Posts
            </h3>
            <Gallery media={media} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
};

export default OtherProfile;
