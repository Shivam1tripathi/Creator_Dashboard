import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Gallery = ({ media, loading }) => {
  const [mediaType, setMediaType] = useState("photo");

  const filteredMedia = media.filter((item) =>
    mediaType === "photo" ? item.type === "image" : item.type === "video"
  );

  useEffect(() => {
    console.log(media);
  }, [media]);

  return (
    <div className="mx-auto p-4">
      {/* Filter Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg shadow-md overflow-hidden border border-gray-600/30 bg-gray-800">
          <button
            className={`px-6 py-2 font-medium transition-all cursor-pointer duration-300 ${
              mediaType === "photo"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700/50"
            }`}
            onClick={() => setMediaType("photo")}
          >
            📷 Photos
          </button>
          <button
            className={`px-6 py-2 font-medium cursor-pointer transition-all duration-300 ${
              mediaType === "video"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700/50"
            }`}
            onClick={() => setMediaType("video")}
          >
            🎥 Videos
          </button>
        </div>
      </div>

      {/* Media Display */}
      {loading ? (
        <p className="text-center text-gray-400 animate-pulse">Loading...</p>
      ) : filteredMedia.length === 0 ? (
        <p className="text-center text-gray-500">
          No {mediaType === "photo" ? "photos" : "videos"} found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <Link to={`/post/${item._id}`} key={item._id}>
              {item.type === "image" ? (
                <img
                  src={`http://localhost:5000/api/post/post-content/${item._id}`}
                  alt="uploaded"
                  className="w-full h-64 object-cover rounded-xl border border-gray-700/30 shadow-md hover:shadow-purple-500/30 hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <video
                  src={`http://localhost:5000/api/post/post-content/${item._id}`}
                  className="w-full h-64 object-cover rounded-xl border border-gray-700/30 shadow-md hover:shadow-purple-500/30 hover:scale-105 transition-transform duration-300"
                  controls={false}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
