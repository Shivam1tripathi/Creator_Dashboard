import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "../../components/ProfileHeader";
import Gallery from "../../components/Gallery";

const OtherProfile = () => {
  const { id: otherUserId } = useParams();
  const { user: currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [updatingFollow, setUpdatingFollow] = useState(false);

  /* Fetch user info */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/single-user/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOtherUser(res.data.user);
        setIsFollowing(res.data.user.followers?.includes(currentUser.id));
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    fetchUser();
  }, [otherUserId, currentUser]);

  /* Fetch user's posts */
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/post/get-allpost/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        if (data.success) setMedia(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [otherUserId]);

  /* Toggle follow */
  const toggleFollow = async () => {
    try {
      setUpdatingFollow(true);
      await axios.post(
        `http://localhost:5000/api/user/follow/${otherUserId}`,
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
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">
          {otherUser?.username}'s Posts
        </h3>
        <Gallery media={media} loading={loading} />
      </div>
    </div>
  );
};

export default OtherProfile;
