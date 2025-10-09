import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, Menu, Sun, Moon, LogOut, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import '../css/ChatPage.css';

// Configuration
const API_BASE_URL = 'https://anandnihal.onrender.com';
const SOCKET_URL = 'https://anandnihal.onrender.com/';

// --- Helper Components & Hooks ---

const useChatScroll = (chatRef, messageCount) => {
  useEffect(() => {
    const node = chatRef.current;
    if (node) {
      const isScrolledToBottom = node.scrollHeight - node.clientHeight <= node.scrollTop + 150;
      if (isScrolledToBottom) {
        node.scrollTop = node.scrollHeight;
      }
    }
  }, [chatRef, messageCount]);
};

const Avatar = ({ name }) => {
  const getInitials = (name = '') => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  return <div className="avatar">{getInitials(name)}</div>;
};

const TypingIndicator = () => (
  <div className="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

export default function ChatPage() {
  const { user, token, logout } = useUser();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('chat-theme') || 'light');

  // Refs
  const socketRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const selectedConversationRef = useRef(selectedConversation);
  selectedConversationRef.current = selectedConversation;

  useChatScroll(messagesAreaRef, messages.length);

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // --- Effects ---

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!user || !token) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('setup', user);
    socket.on('message received', (newMessage) => {
      const currentConvId = selectedConversationRef.current?._id;
      if (currentConvId === newMessage.conversation._id) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        setConversations((prev) =>
          prev.map((convo) =>
            convo._id === newMessage.conversation._id
              ? { ...convo, latestMessage: newMessage, unreadCount: (convo.unreadCount || 0) + 1 }
              : convo
          )
        );
      }
    });
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [user, token]);

  useEffect(() => {
    if (!token) return;
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/convo/');
        setConversations(data || []);
      } catch (error) { console.error('Failed to fetch conversations:', error); }
    };
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c._id === conversationId);
      if (convo) {
        setSelectedConversation(convo);
        setIsTyping(false);
      } else {
        navigate('/chat');
      }
    } else {
      setSelectedConversation(null);
    }
  }, [conversationId, conversations, navigate]);

  useEffect(() => {
    if (!selectedConversation || !token) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/message/${selectedConversation._id}`);
        setMessages((data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        socketRef.current.emit('join conversation', selectedConversation._id);
      } catch (error) { console.error('Failed to fetch messages', error); }
    };
    const markAsRead = async () => {
      if (selectedConversation.unreadCount > 0) {
        try {
          await api.put(`/convo/read/${selectedConversation._id}`);
          setConversations((prev) =>
            prev.map((c) =>
              c._id === selectedConversation._id ? { ...c, unreadCount: 0 } : c
            )
          );
        } catch (error) { console.error('Failed to mark as read', error); }
      }
    };
    fetchMessages();
    markAsRead();
  }, [selectedConversation, token]);

  // --- Handlers ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    socketRef.current.emit('stop typing', selectedConversation._id);
    try {
      const payload = { content: newMessage, conversationId: selectedConversation._id };
      const { data: sentMessage } = await api.post('/message/', payload);
      socketRef.current.emit('new message', sentMessage);
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) { console.error('Failed to send message:', error); }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !selectedConversation) return;
    socketRef.current.emit('typing', selectedConversation._id);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socketRef.current.emit('stop typing', selectedConversation._id);
    }, 3000);
    setTypingTimeout(timeout);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const getOtherParticipant = useCallback((convo) => {
    if (!convo || !user) return { name: 'Unknown' };
    return convo.provider?._id === user._id ? convo.user : convo.provider;
  }, [user]);

  const otherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;
  const isChatVisibleMobile = !!conversationId;

  return (
    <div className={`chat-page-container ${isChatVisibleMobile ? 'show-chat' : ''}`}>
      {/* Left Panel: Conversation List */}
      <div className="conversation-list-panel">
        <div className="chatNav-header">
          {/* --- Left Hamburger Icon --- */}
          <button
            className="chatNav-menuButton"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Menu size={22} />
          </button>

          {/* --- Center Title --- */}
          <h3 className="chatNav-title">Chats</h3>

          {/* --- Side Drawer Menu --- */}
          <div className={`chatNav-sideMenu ${isDropdownOpen ? "open" : ""}`}>
            <div className="chatNav-menuContent">
              <button onClick={() => { navigate('/'); setIsDropdownOpen(false); }}>
                <Home size={18} /> Home
              </button>
              <button onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}>
                <LayoutDashboard size={18} /> My Account
              </button>
              <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          {/* --- Overlay --- */}
          {isDropdownOpen && (
            <div
              className="chatNav-overlay"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>

        <div className="conversations">
          {conversations.map((convo) => {
            const other = getOtherParticipant(convo);
            return (
              <div
                key={convo._id}
                className={`conversation-item ${selectedConversation?._id === convo._id ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${convo._id}`)}
              >
                <Avatar name={other?.fullName || other?.name} />
                <div className="convo-details">
                  <p className="convo-name">{other?.fullName || other?.name}</p>
                  <p className="convo-preview">
                    {convo.latestMessage ? convo.latestMessage.content.substring(0, 25) + '...' : 'No messages yet'}
                  </p>
                </div>
                {convo.unreadCount > 0 && <span className="unread-badge">{convo.unreadCount}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Chat Box */}
      <div className="chat-box-panel">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <button className="back-button icon-button" onClick={() => navigate('/chat')}>
                <ArrowLeft size={22} />
              </button>
              <Avatar name={otherUser?.fullName || otherUser?.name} />
              <h3>{otherUser?.fullName || otherUser?.name}</h3>
              <div className="header-actions">
                <button onClick={toggleTheme} className="icon-button">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
            </div>

            <div className="messages-area" ref={messagesAreaRef}>
              {messages.map((msg) => (
                <div key={msg._id} className={`message-bubble-wrapper ${msg.sender?._id === user?._id ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    <span className="message-content">{msg.content}</span>
                    <span className="timestamp">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && <TypingIndicator />}
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button type="submit"><Send size={20} /></button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h2>Select a conversation to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
}