import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! 👋 Welcome to TÉFA. How can we help you today?',
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate typing response
        setTimeout(() => {
            const botResponses = [
                "Thank you for your message! Our team will get back to you shortly. 💫",
                "Great question! For sizing queries, please check our size guide on the product page.",
                "We offer free shipping on orders over ₦100,000! 🚚",
                "Our customer service team is available Monday to Saturday, 9am - 6pm WAT.",
            ];

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponses[Math.floor(Math.random() * botResponses.length)],
                isUser: false,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <motion.button
                className="chat-widget-btn"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-widget-window"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <div className="chat-header-avatar">T</div>
                                <div>
                                    <h4>TÉFA Support</h4>
                                    <span className="chat-status">
                                        <span className="chat-status-dot"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`chat-message ${message.isUser ? 'user' : 'bot'}`}
                                >
                                    <div className="chat-bubble">
                                        {message.text}
                                    </div>
                                    <span className="chat-time">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="chat-message bot">
                                    <div className="chat-bubble typing">
                                        <Loader2 size={16} className="spin" />
                                        <span>Typing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-input-container">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="chat-input"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="chat-send-btn"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .chat-widget-btn {
          position: fixed;
          bottom: var(--space-6);
          left: var(--space-6);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-coral), var(--color-coral-dark));
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-widget-window {
          position: fixed;
          bottom: calc(var(--space-6) + 70px);
          left: var(--space-6);
          width: 360px;
          max-width: calc(100vw - 40px);
          height: 480px;
          max-height: calc(100vh - 150px);
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          background: linear-gradient(135deg, var(--color-coral), var(--color-coral-dark));
          color: white;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .chat-header-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 700;
          font-style: italic;
        }

        .chat-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .chat-status {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .chat-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ADE80;
        }

        .chat-close-btn {
          padding: var(--space-2);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          background: var(--color-cream);
        }

        .chat-message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .chat-message.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .chat-message.bot {
          align-self: flex-start;
          align-items: flex-start;
        }

        .chat-bubble {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .chat-message.user .chat-bubble {
          background: var(--color-coral);
          color: white;
          border-bottom-right-radius: var(--radius-sm);
        }

        .chat-message.bot .chat-bubble {
          background: white;
          color: var(--color-text);
          border-bottom-left-radius: var(--radius-sm);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .chat-bubble.typing {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-text-muted);
        }

        .chat-time {
          font-size: 0.6875rem;
          color: var(--color-text-muted);
          margin-top: var(--space-1);
        }

        .chat-input-container {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-4);
          border-top: 1px solid var(--color-nude-light);
          background: white;
        }

        .chat-input {
          flex: 1;
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-nude);
          border-radius: var(--radius-full);
          font-family: 'Quicksand', sans-serif;
          font-size: 0.875rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .chat-input:focus {
          border-color: var(--color-coral);
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-coral);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .chat-send-btn:hover:not(:disabled) {
          background: var(--color-coral-dark);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
};
