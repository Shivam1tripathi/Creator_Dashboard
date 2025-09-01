import { useState } from "react";
import axios from "axios";

const CreatePost = () => {
  const [type, setType] = useState("image");
  const [content, setContent] = useState(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState("");

  const MAX_FILE_SIZE = 50 * 1024 * 1024; //50 mb

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 50MB. Please upload a smaller file.");
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
      const { data } = await axios.post(
        "http://localhost:5000/api/post/create-post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      if (data.success) {
        alert("Post created successfully!");
        setCaption("");
        setTags("");
        setContent(null);
        setPreview("");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Post Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Upload {type}</label>

          <div className="flex items-center space-x-4">
            <label className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
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
            <div className="mt-3">
              {type === "image" ? (
                <img
                  src={preview}
                  alt="preview"
                  className="h-40 rounded-md border object-cover"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="h-40 rounded-md border object-contain"
                />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Caption</label>
          <input
            type="text"
            value={caption}
            required
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            placeholder="Say something..."
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Tags (comma separated)
          </label>
          <input
            type="text"
            required
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
            placeholder="e.g. travel, food, tech"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Submit Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
