import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';
import '../css/ChatPage.css';

// Configuration
const API_BASE_URL = 'https://anandnihal.onrender.com';
const SOCKET_URL = 'https://anandnihal.onrender.com/';

export default function ChatPage() {
  const { user, token } = useUser();
  const { conversationId: conversationIdFromUrl } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(selectedConversation);
  selectedConversationRef.current = selectedConversation;

  // Axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // -----------------------
  // 1️⃣ Socket Initialization
  // -----------------------
  useEffect(() => {
    if (!user || !token) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('setup', user);
    socket.on('connected', () => console.log('Socket connected ✅'));

    // Listen for incoming messages
    socket.on('message received', (newMessage) => {
      // Wrap message with conversation participants for frontend check
      const messageWithParticipants = {
        ...newMessage,
        conversation: {
          ...newMessage.conversation,
          participants: [
            newMessage.conversation.user,
            newMessage.conversation.provider,
          ],
        },
      };

      const currentConvId = selectedConversationRef.current?._id;
      if (currentConvId === messageWithParticipants.conversation._id) {
        setMessages((prev) => [...prev, messageWithParticipants]);
      } else {
        // Update conversations list for unread count
        setConversations((prev) =>
          prev.map((convo) =>
            convo._id === messageWithParticipants.conversation._id
              ? {
                  ...convo,
                  latestMessage: messageWithParticipants,
                  unreadCount: (convo.unreadCount || 0) + 1,
                }
              : convo
          )
        );
      }
    });

    // Typing events
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [user, token]);

  // -----------------------
  // 2️⃣ Fetch Conversations
  // -----------------------
  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/convo/');
        setConversations(data || []);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    fetchConversations();
  }, [token]);

  // -----------------------
  // 3️⃣ Select Conversation from URL
  // -----------------------
  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const convo = conversations.find((c) => c._id === conversationIdFromUrl);
      if (convo) setSelectedConversation(convo);
    }
  }, [conversationIdFromUrl, conversations]);

  // -----------------------
  // 4️⃣ Fetch Messages & Join Room
  // -----------------------
  useEffect(() => {
    if (!selectedConversation || !token) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/message/${selectedConversation._id}`);
        setMessages((data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        socketRef.current.emit('join conversation', selectedConversation._id);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
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
        } catch (error) {
          console.error('Failed to mark as read', error);
        }
      }
    };

    fetchMessages();
    markAsRead();
  }, [selectedConversation, token]);

  // -----------------------
  // 5️⃣ Auto-scroll messages
  // -----------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // -----------------------
  // 6️⃣ Send Message
  // -----------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const payload = { content: newMessage, conversationId: selectedConversation._id };
      const { data: sentMessage } = await api.post('/message/', payload);

      // Wrap message with participants for frontend
      const messageWithParticipants = {
        ...sentMessage,
        conversation: {
          _id: selectedConversation._id,
          participants: [selectedConversation.user, selectedConversation.provider],
        },
      };

      socketRef.current.emit('new message', messageWithParticipants);
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      socketRef.current.emit('stop typing', selectedConversation._id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // -----------------------
  // 7️⃣ Typing Handler
  // -----------------------
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

  // -----------------------
  // 8️⃣ Helpers
  // -----------------------
  const getOtherParticipant = (convo) => {
    if (!convo || !user) return { name: 'Unknown' };
    return convo.provider?._id === user._id ? convo.user : convo.provider;
  };

  // -----------------------
  // 9️⃣ Render
  // -----------------------
  return (
    <div className="chat-page-container">
      {/* Left Panel */}
      <div className="conversation-list-panel">
        <div className="list-header"><h3>Conversations</h3></div>
        <div className="conversations">
          {conversations.length > 0 ? (
            conversations.map((convo) => {
              const otherUser = getOtherParticipant(convo);
              return (
                <div
                  key={convo._id}
                  className={`conversation-item ${selectedConversation?._id === convo._id ? 'active' : ''}`}
                  onClick={() => navigate(`/chat/${convo._id}`)}
                >
                  <div className="convo-details">
                    <p className="convo-name">{otherUser?.fullName || otherUser?.name}</p>
                    <p className="convo-preview">
                      {convo.latestMessage ? convo.latestMessage.content.substring(0, 25) + '...' : 'No messages yet'}
                    </p>
                  </div>
                  {convo.unreadCount > 0 && <span className="unread-badge">{convo.unreadCount}</span>}
                </div>
              );
            })
          ) : <p className="no-convos">No conversations found.</p>}
        </div>
      </div>

      {/* Right Panel */}
      <div className="chat-box-panel">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>{getOtherParticipant(selectedConversation)?.fullName || getOtherParticipant(selectedConversation)?.name}</h3>
            </div>

            <div className="messages-area">
              {messages.map((msg) => (
                <div key={msg._id} className={`message-bubble ${msg.sender?._id === user?._id || msg.sender === user?._id ? 'sent' : 'received'}`}>
                  <p>{msg.content}</p>
                  <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}

              {isTyping && <div className="typing-indicator">Typing...</div>}

              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleTyping}
                rows="2"
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
