import { useEffect, useState } from "react";
import ProfileHeader from "../../components/ProfileHeader";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Gallery from "../../components/Gallery";

const MyProfile = () => {
  const [singleUser, setSingleUser] = useState();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/post/get-allpost/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        if (data.success) {
          setMedia(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);
  useEffect(() => {
    const fetchSingleUser = async () => {
      try {
        if (!user?.id) return; // Prevent running if user isn't loaded

        const res = await axios.get(
          `http://localhost:5000/api/user/single-user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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
