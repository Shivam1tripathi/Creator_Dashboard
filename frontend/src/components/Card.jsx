export default function Card({ post, onSave, onShare, onReport }) {
  const displayTitle =
    post.title?.length > 40
      ? `${post.title.substring(0, 40)}...`
      : post.title || post.text;

  const imageUrl =
    post.image ||
    "https://color-literacy.com/wp-content/uploads/2018/08/dummy_img-300x180.png";

  return (
    <div className="bg-white w-80 h-full shadow-md rounded p-4 m-4 flex flex-col justify-between">
      <div>
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-48 object-cover rounded mb-3"
        />
        <h2 className="text-lg font-semibold mb-2">{displayTitle}</h2>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm mb-4 inline-block"
        >
          View Source
        </a>
      </div>
      {onSave && (
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onSave(post)}
            className="px-3 py-1 text-sm cursor-pointer font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition"
          >
            Save
          </button>
          <button
            onClick={() => onShare(post)}
            className="px-3 py-1 text-sm cursor-pointer font-medium text-white bg-green-600 hover:bg-green-700 rounded transition"
          >
            Share
          </button>
          <button
            onClick={() => onReport(post)}
            className="px-3 py-1 text-sm cursor-pointer font-medium text-white bg-red-600 hover:bg-red-700 rounded transition"
          >
            Report
          </button>
        </div>
      )}
    </div>
  );
}
