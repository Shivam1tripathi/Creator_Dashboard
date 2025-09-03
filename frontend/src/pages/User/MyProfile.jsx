import { useEffect, useState } from "react";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Gallery from "../../components/Gallery";

const API = import.meta.env.VITE_API_URL; // ✅ Use env variable

const MyProfile = () => {
  const [singleUser, setSingleUser] = useState();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /* Fetch posts */
  useEffect(() => {
    const fetchMedia = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/post/get-allpost/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        if (data.success) setMedia(data.posts || []);
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [user]);

  /* Fetch current user details */
  useEffect(() => {
    const fetchSingleUser = async () => {
      if (!user?.id) return; // wait for auth
      try {
        const res = await axios.get(`${API}/user/single-user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSingleUser(res.data.user);
      } catch (err) {
        console.error(
          "Failed to load user:",
          err.response?.data?.msg || err.message
        );
      }
    };

    fetchSingleUser();
  }, [user]);

  return (
    <>
      <ProfileHeader singleuser={singleUser} media={media.length} />
      <Gallery media={media} loading={loading} />
    </>
  );
};

export default MyProfile;
