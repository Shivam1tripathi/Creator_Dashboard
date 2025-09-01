import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t bg-white">
      <input
        type="text"
        className="flex-1 p-2 border rounded-full focus:outline-none"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        className="p-2 rounded-full bg-blue-500 text-white"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
