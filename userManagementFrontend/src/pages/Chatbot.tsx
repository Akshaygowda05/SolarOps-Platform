import React, { useState, useEffect, useRef } from "react";
import {api,streamChat} from "../services/api"


export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

interface ChatbotProps {
  userId?: number;
}

export const Chatbot: React.FC<ChatbotProps> = ({ userId = 1 }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the message container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load existing chat history using standard Axios instance
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsHistoryLoading(true);
        const response = await api.get<ChatMessage[]>(`/chat/history/${userId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to load past messages:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;

    setInput("");

    // 1. Append user message to state
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    // 2. Append empty placeholder for incoming assistant stream
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      // 3. Consume real-time SSE stream
      await streamChat(userId, userText, (chunkText: string) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex] && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: updated[lastIndex].content + chunkText,
            };
          }
          return updated;
        });
      });
    } catch (error) {
      console.error("Stream generation error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex] && updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: "⚠️ Failed to receive response from server. Please try again.",
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h2 style={styles.title}>AI Assistant</h2>
      </header>

      {/* Message Feed */}
      <div style={styles.chatFeed}>
        {isHistoryLoading ? (
          <div style={styles.statusText}>Loading history...</div>
        ) : messages.length === 0 ? (
          <div style={styles.statusText}>No previous messages. Say hello!</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  backgroundColor: msg.role === "user" ? "#007bff" : "#f1f3f5",
                  color: msg.role === "user" ? "#ffffff" : "#212529",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 2px 16px"
                      : "16px 16px 16px 2px",
                }}
              >
                <div style={styles.roleLabel}>
                  {msg.role === "user" ? "You" : "Assistant"}
                </div>
                <div style={styles.messageContent}>{msg.content}</div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div style={styles.typingIndicator}>Assistant is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            ...styles.button,
            backgroundColor: isLoading || !input.trim() ? "#b0d4ff" : "#007bff",
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

// CSS-in-JS Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "600px",
    maxWidth: "650px",
    margin: "20px auto",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#ffffff",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #eeeeee",
    backgroundColor: "#ffffff",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  chatFeed: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backgroundColor: "#fafafa",
  },
  statusText: {
    textAlign: "center",
    color: "#888888",
    marginTop: "40px",
    fontSize: "14px",
  },
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    maxWidth: "75%",
    padding: "12px 16px",
    fontSize: "14px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  roleLabel: {
    fontSize: "11px",
    fontWeight: 600,
    marginBottom: "4px",
    opacity: 0.8,
  },
  messageContent: {
    whiteSpace: "pre-wrap",
  },
  typingIndicator: {
    fontSize: "12px",
    color: "#6c757d",
    fontStyle: "italic",
    paddingLeft: "4px",
  },
  inputForm: {
    display: "flex",
    padding: "16px",
    gap: "10px",
    borderTop: "1px solid #eeeeee",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #cccccc",
    borderRadius: "8px",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    transition: "background-color 0.2s ease",
  },
};

export default Chatbot;