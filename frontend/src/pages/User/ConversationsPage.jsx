import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Send, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [updatingFollowId, setUpdatingFollowId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const socket = useRef(null);

  // ✅ Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Socket setup
  useEffect(() => {
    socket.current = io(SOCKET_URL);
    socket.current.emit("addUser", user.id);
    socket.current.on("getUsers", (users) => setOnlineUsers(users));
    socket.current.on("newMessage", (data) => {
      if (data.senderId && data.senderId !== user.id) {
        setMessages((prev) => [
          ...prev,
          { text: data.text, sender: { _id: data.senderId }, _id: Date.now() },
        ]);
      } else if (data.sender && data.sender._id !== user.id) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => socket.current.disconnect();
  }, [user.id, selectedConv]);

  // ✅ Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API}/conversations/${user.id}`);
        setConversations(res.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user.id]);

  // ✅ Fetch messages + follow status
  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API}/messages/${selectedConv._id}?page=1&limit=20`
        );
        setMessages(res.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();

    const otherUser = selectedConv.participants.find((p) => p._id !== user.id);
    if (otherUser) {
      axios
        .get(`${API}/user/is-following/${user.id}/${otherUser._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setIsFollowing(res.data.isFollowing))
        .catch((err) => console.error("Error fetching follow status:", err));
    }
  }, [selectedConv, user.id]);

  // ✅ Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const res = await axios.post(`${API}/messages`, {
        conversationId: selectedConv._id,
        sender: user.id,
        text: newMessage,
      });
      const sentMessage = { ...res.data, sender: { _id: user.id } };
      setMessages((prev) => [...prev, sentMessage]);
      const receiverId = selectedConv.participants.find(
        (p) => p._id !== user.id
      )._id;
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

  // ✅ Toggle follow
  const toggleFollow = async (userId) => {
    try {
      setUpdatingFollowId(userId);
      const { data } = await axios.post(
        `${API}/user/follow/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error("Follow/unfollow error:", err);
    } finally {
      setUpdatingFollowId(null);
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
      {/* ✅ Mobile: Show sidebar OR chat */}
      {isMobile ? (
        <>
          {!selectedConv ? (
            // Sidebar (mobile)
            <div className="flex-1 border-r border-gray-200 bg-white shadow-xl overflow-y-auto">
              <h2 className="text-xl font-bold px-4 py-3 border-b sticky top-0 bg-white">
                💬 Chats
              </h2>
              <ul className="space-y-2 p-3">
                {conversations.map((conv) => {
                  const otherUser = conv.participants.find(
                    (p) => p._id !== user.id
                  );
                  const isOnline = onlineUsers.includes(otherUser._id);
                  return (
                    <li
                      key={conv._id}
                      className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedConv(conv)}
                    >
                      <img
                        src={`${API}/user/profile-picture/${otherUser._id}`}
                        alt={otherUser?.firstName}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div className="ml-3 flex-1">
                        <h3 className="font-semibold text-gray-800">
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
          ) : (
            // Chat (mobile)
            <div className="flex-1 flex flex-col">
              {/* Chat Header with back button */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  {(() => {
                    const otherUser = selectedConv.participants.find(
                      (p) => p._id !== user.id
                    );
                    return (
                      <>
                        <img
                          src={`${API}/user/profile-picture/${otherUser._id}`}
                          alt={otherUser?.firstName}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <h2 className="font-semibold text-base">
                          {otherUser?.firstName}
                        </h2>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender?._id === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[75%] shadow-md ${
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
              <div className="p-3 border-t bg-white flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-full px-3 py-2 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        // ✅ Desktop Layout (original)
        <>
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 bg-white shadow-xl overflow-y-auto">
            <h2 className="text-2xl font-bold px-6 py-4 border-b sticky top-0 bg-white">
              💬 Chats
            </h2>
            <ul className="space-y-2 p-3">
              {conversations.map((conv) => {
                const otherUser = conv.participants.find(
                  (p) => p._id !== user.id
                );
                const isOnline = onlineUsers.includes(otherUser._id);

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
                        src={`${API}/user/profile-picture/${otherUser._id}`}
                        alt={otherUser?.firstName}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
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

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const otherUser = selectedConv.participants.find(
                        (p) => p._id !== user.id
                      );
                      return (
                        <>
                          <img
                            src={`${API}/user/profile-picture/${otherUser._id}`}
                            alt={otherUser?.firstName}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                          <h2 className="font-semibold text-lg">
                            {otherUser?.firstName}
                          </h2>
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() =>
                      toggleFollow(
                        selectedConv.participants.find((p) => p._id !== user.id)
                          ._id
                      )
                    }
                    disabled={
                      updatingFollowId ===
                      selectedConv.participants.find((p) => p._id !== user.id)
                        ._id
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isFollowing
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    } ${
                      updatingFollowId ===
                      selectedConv.participants.find((p) => p._id !== user.id)
                        ._id
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    {updatingFollowId ===
                    selectedConv.participants.find((p) => p._id !== user.id)._id
                      ? "..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
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
        </>
      )}
    </div>
  );
}
