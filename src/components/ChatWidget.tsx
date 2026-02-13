import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Loader2, Minus, Maximize2, User, Bot, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useStore } from '../data/store';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isWhatsAppLink?: boolean;
  whatsappUrl?: string;
}

export const ChatWidget: React.FC = () => {
  const { user } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
  const [syncError, setSyncError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a unique chatId for this session
  const chatId = useMemo(() => {
    const saved = localStorage.getItem('tefa_chat_id');
    if (saved) return saved;
    const newId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('tefa_chat_id', newId);
    return newId;
  }, []);

  // Sync with Firestore
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          isUser: data.isUser,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        };
      });

      if (firestoreMessages.length > 0) {
        setMessages(prev => {
          // Keep the initial welcome message if it's the first time
          const welcome = prev.find(m => m.id === '1');
          return welcome ? [welcome, ...firestoreMessages] : firestoreMessages;
        });
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      setSyncError(null);
      // Build context-rich message for the owner
      let notificationText = userMessage;

      if (user) {
        const userName = user.email?.split('@')[0] || 'Customer';
        notificationText = `[New Inquiry from ${userName}]\n"${userMessage}"\nEmail: ${user.email}`;
      } else {
        const guestId = chatId.split('_').pop()?.substring(0, 5).toUpperCase() || 'GUEST';
        notificationText = `[Guest ${guestId}]\n"${userMessage}"`;
      }

      // Send notification to owner via WhatsApp Cloud API
      await sendWhatsAppMessage({
        text: userMessage,      // Saved to Firestore (User sees this)
        adminText: notificationText, // Sent to WhatsApp (Admin sees this)
        chatId: chatId
      });

      setIsTyping(false);
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsTyping(false);
      setSyncError(err.message || 'Failed to sync with WhatsApp');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openDirectWhatsApp = () => {
    const recipient = import.meta.env.VITE_WHATSAPP_RECIPIENT_NUMBER || '2348135407871';
    const text = encodeURIComponent(`Hi TÉFA! I'm messaging from the website (ID: ${chatId}).`);
    window.open(`https://wa.me/${recipient}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className="chat-widget-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
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
                  <h4><span className="font-brand">TÉFA</span> Support</h4>
                  <span className="chat-status">
                    <span className="chat-status-dot"></span>
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="chat-header-action-btn" onClick={openDirectWhatsApp} title="Open in WhatsApp">
                  <ExternalLink size={18} />
                </button>
                <button className="chat-header-action-btn" onClick={() => setIsMinimized(true)} title="Minimize">
                  <Minus size={20} />
                </button>
                <button className="chat-header-action-btn" onClick={() => setIsOpen(false)} title="Close">
                  <X size={20} />
                </button>
              </div>
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
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Direct WhatsApp Prompt / Errors */}
            {(messages.length <= 1 || syncError) && (
              <div className="px-4 pb-2">
                {syncError && (
                  <div className="text-[10px] text-red-500 mb-2 px-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    {syncError}
                  </div>
                )}
                <button
                  onClick={openDirectWhatsApp}
                  className="whatsapp-prompt-btn"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mr-2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {syncError ? 'Message failed to sync: Open WhatsApp' : 'Continue on WhatsApp'}
                </button>
              </div>
            )}

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

        .chat-header-action-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chat-header-action-btn:hover {
          background: rgba(255, 255, 255, 0.25);
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

        .whatsapp-prompt-btn {
            width: 100%;
            padding: var(--space-2);
            background: #25D366;
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: 0.8125rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
            box-shadow: 0 2px 8px rgba(37, 211, 102, 0.2);
        }

        .whatsapp-prompt-btn:hover {
            background: #128C7E;
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
          font-family: sans-serif;
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
      `}</style>
    </>
  );
};
