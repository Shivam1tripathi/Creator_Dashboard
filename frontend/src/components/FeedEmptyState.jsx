export default function FeedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      <div className="w-32 h-32 mb-6">
        <svg
          className="w-full h-full text-purple-400 opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7M3 7l9 6 9-6M3 7h18"
          />
        </svg>
      </div>

      {/* Message */}
      <h2 className="text-xl font-semibold text-gray-200 mb-2">
        No posts available
      </h2>
      <p className="text-gray-400 mb-6 max-w-sm">
        It looks like there are no posts right now. Be the first one to share
        something awesome!
      </p>

      {/* Call to Action */}
      <a
        href="/create-Post"
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        ➕ Create Your First Post
      </a>
    </div>
  );
}
