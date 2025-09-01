import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Send } from "lucide-react";
import { io } from "socket.io-client";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]); // ✅ Track online users
  const { user } = useAuth();
  const socket = useRef(null);

  // ✅ Initialize socket connection once
  useEffect(() => {
    socket.current = io("http://localhost:5000");

    // Register user online
    socket.current.emit("addUser", user.id);

    // Listen for all online users
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(users); // users = array of online userIds
    });

    // Listen for messages
    socket.current.on("newMessage", (data) => {
      if (selectedConv?.participants.some((p) => p._id === data.senderId)) {
        setMessages((prev) => [
          ...prev,
          { text: data.text, sender: { _id: data.senderId } },
        ]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user.id, selectedConv]);

  // ✅ Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/conversations/${user.id}`
        );
        setConversations(res.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user.id]);

  // ✅ Fetch messages when selecting a conversation
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedConv._id}?page=1&limit=20`
        );
        setMessages(res.data.messages); // oldest first
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedConv]);

  // ✅ Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const res = await axios.post("http://localhost:5000/api/messages", {
        conversationId: selectedConv._id,
        sender: user.id,
        text: newMessage,
      });

      const sentMessage = res.data;
      setMessages((prev) => [...prev, sentMessage]);

      // Get receiverId
      const receiverId = selectedConv.participants.find(
        (p) => p._id !== user.id
      )._id;

      // Send real-time
      socket.current.emit("sendMessage", {
        senderId: user.id,
        receiverId,
        text: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="flex w-full h-[90vh] bg-gradient-to-br from-gray-50 to-gray-200">
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 border-r border-gray-200 bg-white shadow-xl overflow-y-auto">
        <h2 className="text-2xl font-bold px-6 py-4 border-b sticky top-0 bg-white">
          💬 Chats
        </h2>
        <ul className="space-y-2 p-3">
          {conversations.map((conv) => {
            const otherUser = conv.participants.find((p) => p._id !== user.id);
            const isOnline = onlineUsers.includes(otherUser._id); // ✅ Check online

            return (
              <li
                key={conv._id}
                className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all ${
                  selectedConv?._id === conv._id
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="relative">
                  <img
                    src={`http://localhost:5000/api/user/profile-picture/${otherUser._id}`}
                    alt={otherUser?.firstName}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  {/* ✅ Online status dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                      isOnline
                        ? "bg-green-500 border-white"
                        : "bg-gray-400 border-white"
                    }`}
                  ></span>
                </div>

                <div className="ml-3 flex-1">
                  <h3
                    className={`font-semibold ${
                      selectedConv?._id === conv._id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {otherUser?.firstName}
                  </h3>
                  <p
                    className={`text-sm ${
                      isOnline ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT CHAT WINDOW */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex ${
                    msg.sender?._id === user.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs shadow-md ${
                      msg.sender?._id === user.id
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full flex items-center"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            👈 Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
