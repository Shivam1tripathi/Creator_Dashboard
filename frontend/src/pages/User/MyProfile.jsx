import { useEffect, useState } from "react";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Gallery from "../../components/Gallery";

const API = import.meta.env.VITE_API_URL; // ✅ Use env variable

const MyProfile = () => {
  const [singleUser, setSingleUser] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true); // 🔴 start true
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch user + posts in parallel
        const [userRes, mediaRes] = await Promise.all([
          axios.get(`${API}/user/single-user/${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${API}/post/get-allpost/${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }),
        ]);

        // ✅ Set user
        setSingleUser(userRes.data.user);

        // ✅ Set media
        if (mediaRes.data.success) setMedia(mediaRes.data.posts || []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false); // ✅ finish only after both
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center gap-1 py-20">
          <span className="w-1.5 h-6 bg-purple-500 rounded animate-[bounce_0.6s_infinite]" />
          <span className="w-1.5 h-6 bg-pink-500 rounded animate-[bounce_0.6s_infinite_0.2s]" />
          <span className="w-1.5 h-6 bg-blue-500 rounded animate-[bounce_0.6s_infinite_0.4s]" />
        </div>
      ) : (
        <>
          <ProfileHeader singleuser={singleUser} media={media.length} />
          <Gallery media={media} loading={loading} />
        </>
      )}
    </>
  );
};

export default MyProfile;
