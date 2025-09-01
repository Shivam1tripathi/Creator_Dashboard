export default function MessageList({ messages, username }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
      {messages.map((msg, i) => {
        const isMe = msg.sender?.username === username;
        return (
          <div
            key={i}
            className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-xs ${
                isMe ? "bg-blue-500 text-white" : "bg-white text-black border"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
