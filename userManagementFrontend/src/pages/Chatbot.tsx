import React, { useState, useRef, useEffect } from 'react';
import { chatbot } from '../services/User.service';


export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    // Smooth scroll to the bottom when new text comes in
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        
        // 1. Instantly display user's message
        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);

        try {
            // 2. Call your Axios API function
            const response = await chatbot(userMessage);
            
            // 3. Parse the SSE string data from Axios
            const rawData = response.data; // This is your "data: {...}\n\ndata: {...}" string
            
            // Split the chunk into individual lines
            const lines = rawData.split('\n');
            let finalAssistantText = '';

            for (let line of lines) {
                line = line.trim();
                if (!line.startsWith('data:')) continue;

                // Strip out "data: " to leave just the pure JSON string
                const jsonString = line.replace('data:', '').trim();
                
                try {
                    const parsed = JSON.parse(jsonString);

                    if (parsed.type === 'thinking') {
                        setIsThinking(true);
                    } else if (parsed.type === 'assistant') {
                        setIsThinking(false); // Stop showing thinking state
                        finalAssistantText += parsed.content;
                    }
                } catch (err) {
                    console.error("Failed parsing line:", jsonString, err);
                }
            }

            // 4. Update the chat window with the final clean text
            if (finalAssistantText) {
                setMessages((prev) => [...prev, { sender: 'assistant', text: finalAssistantText }]);
            }

        } catch (error) {
            console.error("API Error:", error);
            setMessages((prev) => [...prev, { sender: 'system', text: "❌ Error connecting to robot network." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Top Clean Header */}
            <div style={styles.header}>
                <div style={styles.statusDot}></div>
                <h2 style={styles.headerTitle}>Robot Automation Core AI</h2>
            </div>

            {/* Chat Body */}
            <div style={styles.chatWindow}>
                {messages.length === 0 && (
                    <div style={styles.placeholder}>
                        🤖 Waiting for commands... Try typing "Run Robot 01"
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        style={{
                            ...styles.messageRow,
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            ...styles.messageBox,
                            ...(msg.sender === 'user' ? styles.userBox : styles.assistantBox),
                            ...(msg.sender === 'system' ? styles.systemBox : {})
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Animated Thinking Indicator */}
                {isThinking && (
                    <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                        <div style={{ ...styles.messageBox, ...styles.assistantBox, color: '#888' }}>
                            <span style={styles.pulseAnimation}>🤖 Bot is analyzing steps...</span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} style={styles.inputForm}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter robot system instructions..."
                    style={styles.inputField}
                />
                <button type="submit" style={styles.sendButton}>
                    Execute
                </button>
            </form>
        </div>
    );
}

// Manager-approved polished UI Styles
const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '85vh', maxWidth: '700px', margin: '40px auto', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', backgroundColor: '#fff' },
    header: { padding: '16px 20px', backgroundColor: '#1a1f2c', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #2d323f' },
    statusDot: { width: '10px', height: '10px', backgroundColor: '#4caf50', borderRadius: '50%', boxShadow: '0 0 8px #4caf50' },
    headerTitle: { margin: 0, fontSize: '16px', fontWeight: '600', letterSpacing: '0.5px' },
    chatWindow: { flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '16px' },
    placeholder: { textAlign: 'center', color: '#a0aec0', marginTop: '100px', fontSize: '15px' },
    messageRow: { display: 'flex', width: '100%' },
    messageBox: { padding: '12px 18px', borderRadius: '12px', maxWidth: '70%', fontSize: '14.5px', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
    userBox: { backgroundColor: '#3b82f6', color: 'white', borderBottomRightRadius: '2px' },
    assistantBox: { backgroundColor: 'white', color: '#1e293b', borderBottomLeftRadius: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' },
    systemBox: { backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', width: '100%', maxWidth: '100%', textAlign: 'center' },
    inputForm: { display: 'flex', padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', gap: '12px' },
    inputField: { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
    sendButton: { padding: '0 24px', backgroundColor: '#1a1f2c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    pulseAnimation: { fontStyle: 'italic', display: 'inline-block' }
};