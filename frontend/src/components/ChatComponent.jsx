import { useEffect, useState } from "react";
import socket from "./socket";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatComponent({ conversationId, username }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("joinConversation", conversationId);

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [conversationId]);

  const handleSend = (text) => {
    const message = { text, sender: { username } };
    socket.emit("sendMessage", { conversationId, message });
    setMessages((prev) => [...prev, message]); // show instantly
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border rounded-lg shadow-lg">
      <ChatHeader username="Friend" />
      <MessageList messages={messages} username={username} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
