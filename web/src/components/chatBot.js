import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { API_URL } from '../config';

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            const userMessage = { text: input, sender: 'user' };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInput('');
            setLoading(true);

            try {
                const response = await axios.post(`${API_URL}/ask`, { question: input });
                const botMessage = { text: response.data.reply, sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Error fetching bot response:', error);
                const errorMessage = { text: 'Error fetching bot response.', sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            } finally {
                setLoading(false);
            }
        }
    };

    const LoadingDots = () => {
        const [dotCount, setDotCount] = useState(1);

        useEffect(() => {
            const interval = setInterval(() => {
                setDotCount((prev) => (prev % 3) + 1);
            }, 500);

            return () => clearInterval(interval);
        }, []);

        return <span>Bot đang ngẫm nghĩ {'.'.repeat(dotCount)}</span>;
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Tra cứu kiến thức với AI 📚</h1>
            <div
                style={{
                    height: '400px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    padding: '20px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    marginTop: '20px',
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '10px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '10px',
                                borderRadius: '5px',
                                backgroundColor: message.sender === 'user' ? '#E0F7FA' : '#FFF8E1',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }}
                        ></div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '10px',
                                borderRadius: '5px',
                                backgroundColor: '#FFF8E1',
                            }}
                        >
                            <LoadingDots />
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    style={{
                        marginLeft: '10px',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                    }}
                >
                    Gửi
                </button>
            </form>
        </div>
    );
};

export default ChatBot;
