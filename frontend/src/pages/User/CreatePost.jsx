import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL; // ✅ Use env variable

const CreatePost = () => {
  const [type, setType] = useState("image");
  const [content, setContent] = useState(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("❌ File size exceeds 50MB. Please upload a smaller file.");
        setContent(null);
        setPreview("");
        return;
      }
      setContent(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return alert("Please upload an image or video.");

    const formData = new FormData();
    formData.append("type", type);
    formData.append("caption", caption);
    formData.append("tags", tags);
    formData.append("content", content);

    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/post/create-post`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });

      if (data.success) {
        alert("✅ Post created successfully!");
        setCaption("");
        setTags("");
        setContent(null);
        setPreview("");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create post. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white border rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">
        ✨ Create a Post
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post Type */}
        <div>
          <label className="block mb-1 font-medium">Post Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="image">📷 Image</option>
            <option value="video">🎥 Video</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block mb-1 font-medium">
            Upload {type} (15 MB LIMIT)
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
              Choose File
              <input
                type="file"
                accept={
                  type === "image"
                    ? "image/png, image/jpeg"
                    : "video/mp4, video/webm"
                }
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {content && (
              <span className="text-sm text-gray-600 truncate max-w-xs">
                {content.name}
              </span>
            )}
          </div>

          {preview && (
            <div className="mt-4">
              {type === "image" ? (
                <img
                  src={preview}
                  alt="preview"
                  className="h-48 rounded-lg border object-cover mx-auto"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="h-48 rounded-lg border object-contain mx-auto"
                />
              )}
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block mb-1 font-medium">Caption</label>
          <input
            type="text"
            value={caption}
            required
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Say something..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block mb-1 font-medium">
            Tags (comma separated)
          </label>
          <input
            type="text"
            required
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. travel, food, tech"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "⏳ Uploading..." : "🚀 Submit Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
