import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MediaCard from "./MediaCard";

const API_URL = import.meta.env.VITE_API_URL;

const Gallery = ({ media, loading }) => {
  const [mediaType, setMediaType] = useState("photo");

  const filteredMedia = media.filter((item) =>
    mediaType === "photo" ? item.type === "image" : item.type === "video"
  );

  return (
    <div className="mx-auto p-4">
      {/* Filter Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full shadow-md overflow-hidden border border-gray-600/30 bg-gray-800/80 backdrop-blur-md">
          {["photo", "video"].map((type) => (
            <button
              key={type}
              className={`px-6 py-2 font-medium transition-all cursor-pointer duration-300 ${
                mediaType === type
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700/50"
              }`}
              onClick={() => setMediaType(type)}
            >
              {type === "photo" ? "📷 Photos" : "🎥 Videos"}
            </button>
          ))}
        </div>
      </div>

      {/* Media Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-700/40 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <p className="text-center text-gray-500">
          No {mediaType === "photo" ? "photos" : "videos"} found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <MediaCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
