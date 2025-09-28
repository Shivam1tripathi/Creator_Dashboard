import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const MediaCard = ({ item }) => {
  const token = localStorage.getItem("token");
  const [posturl, setPostUrl] = useState();
  useEffect(() => {
    const Fetch = async () => {
      try {
        const url = await axios.get(
          `${API_URL}/post/post-content/${item._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPostUrl(url.data.contentUrl);
      } catch (error) {
        toast.error("network error");
      }
    };
    Fetch();
  }, [item._id]);
  return (
    <Link to={`/post/${item._id}`} key={item._id}>
      {item.type === "image" ? (
        <img
          src={posturl}
          alt="uploaded"
          loading="lazy"
          className="w-full h-64 object-cover rounded-xl border border-gray-700/30 shadow-md hover:shadow-purple-500/30 hover:scale-[1.03] transition-transform duration-300"
        />
      ) : (
        <video
          src={posturl}
          className="w-full h-64 object-cover rounded-xl border border-gray-700/30 shadow-md hover:shadow-purple-500/30 hover:scale-[1.03] transition-transform duration-300"
          muted
          loop
          playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => e.currentTarget.pause()}
        />
      )}
    </Link>
  );
};

export default MediaCard;
