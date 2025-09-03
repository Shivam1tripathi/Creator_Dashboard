const API_URL = import.meta.env.VITE_API_URL;

export default function ChatHeader({ userid }) {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-gray-300 bg-white">
      <img
        src={`${API_URL}/user/profile-picture/${userid}`}
        alt="profile"
        className="w-10 h-10 rounded-full"
      />
      <div>
        <h3 className="font-semibold">{userid.username}</h3>
        <p className="text-xs text-gray-500">online</p>
      </div>
    </div>
  );
}
