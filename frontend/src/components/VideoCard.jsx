import { useEffect, useState, useRef } from "react";
import ActionBar from "./ActionBar";
import BottomInfo from "./BottomInfo";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function VideoCard({
  id,
  userId,
  username,
  caption,
  totalcomments,
  activeId,
  setActiveId,
  volume,
  isMuted,
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [posturl, setPostUrl] = useState();
  const [muted, setMuted] = useState(true); // ✅ default mute
  const videoRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"))?.id;
  const token = localStorage.getItem("token");
  useEffect(() => {
    const Fetch = async () => {
      try {
        const url = await axios.get(`${API_URL}/post/post-content/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPostUrl(url.data.contentUrl);
      } catch (error) {
        toast.error("network error");
      }
    };
    Fetch();
  }, [id]);

  // ✅ Handle visibility with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, [id, setActiveId]);

  // ✅ Play/Pause only if active
  useEffect(() => {
    if (!videoRef.current) return;
    if (activeId === id) {
      videoRef.current.play().catch(() => {});
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [activeId, id, isMuted, volume]);

  // ✅ Sync mute state with video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // ✅ Fetch follow + saved status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const followRes = await axios.get(
          `${API_URL}/user/is-following/${currentUser}/${userId}`
        );
        setIsFollowing(followRes.data.isFollowing);

        const savedRes = await axios.get(`${API_URL}/user/is-saved/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(savedRes.data.isSaved);
      } catch (err) {
        console.error("Error fetching profile or follow status:", err);
      }
    };

    if (userId && currentUser) {
      fetchData();
    }
  }, [userId, currentUser, id]);

  return (
    <div className="w-full h-screen flex justify-center items-start snap-start bg-black">
      {/* Reel container */}
      <div className="relative w-[360px] h-[580px] max-md:w-[400px] mt-5 max-md:mt-16 max-md:h-[650px] bg-gray-900 rounded-xl overflow-hidden">
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={posturl}
          loop
          playsInline
        />

        {/* Right side icons */}
        <ActionBar
          saved={saved}
          postId={id}
          userId={userId}
          setSaved={setSaved}
          totalcomments={totalcomments}
          activeId={activeId}
        />

        {/* Bottom profile/info */}
        <BottomInfo
          isFollowing={isFollowing}
          userId={userId}
          postId={id}
          setIsFollowing={setIsFollowing}
          username={username}
          caption={caption}
        />
      </div>
    </div>
  );
}
