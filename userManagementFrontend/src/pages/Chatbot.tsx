import React, { useState } from "react";
import { fetchChatbotStream } from "../services/User.service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    setInput("");
    setLoading(true);

    // Add user message + empty assistant message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    try {
      await fetchChatbotStream(text, (chunk:any) => {
        console.log("Frontend received:", chunk);

        setMessages((prev) => {
          const updated = [...prev];

          const lastIndex = updated.length - 1;

          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content:
                updated[lastIndex].content + chunk,
            };
          }

          return updated;
        });
      });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "500px",
        margin: "40px auto",
        fontFamily: "Arial",
      }}
    >
      <h2>JARVIS</h2>

      <div
        style={{
          height: "400px",
          border: "1px solid #ddd",
          padding: "20px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: "15px",
              textAlign:
                message.role === "user"
                  ? "right"
                  : "left",
            }}
          >
            <strong>
              {message.role === "user"
                ? "You"
                : "JARVIS"}
            </strong>

            <div>{message.content}</div>
          </div>
        ))}

        {loading && <div>JARVIS is thinking...</div>}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask JARVIS..."
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
