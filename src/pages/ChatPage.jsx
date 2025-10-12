import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Menu, Sun, Moon, LogOut, ArrowLeft, Home, LayoutDashboard, Clock, AlertCircle } from 'lucide-react';
import '../css/ChatPage.css';
import { useTheme } from '../context/ThemeContext';
import { format, isToday, isYesterday, isThisWeek, differenceInCalendarDays } from 'date-fns';

// --- Configuration ---
const API_BASE_URL = 'https://anandnihal.onrender.com';
const SOCKET_URL = 'https://anandnihal.onrender.com/';

// --- Helper Functions & Components ---
const useChatScroll = (chatRef, dependency, isLoadingMessages, isTyping) => {
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatRef, dependency, isTyping]);
  useEffect(() => {
    if (!isLoadingMessages && chatRef.current) {
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isLoadingMessages, chatRef]);
};

const Avatar = ({ name }) => { /* ... same as before ... */
  const getInitials = (name = '') => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  return <div className="avatar">{getInitials(name)}</div>;
};
const formatDateSeparator = (dateString) => { /* ... same as before ... */
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
  return format(date, 'dd/MM/yyyy');
};
const TypingIndicator = () => ( /* ... same as before ... */
  <div className="message-bubble-wrapper received">
    <div className="message-bubble">
      <div className="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  </div>
);
const MessageSkeleton = () => ( /* ... same as before ... */
  <>
    <div className="skeleton-bubble received" />
    <div className="skeleton-bubble sent" />
    <div className="skeleton-bubble sent small" />
    <div className="skeleton-bubble received" />
  </>
);


export default function ChatPage() {
  const { user, token, logout } = useUser();
  const { conversationId: conversationIdFromUrl } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingConversationId, setTypingConversationId] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const selectedConversationRef = useRef(selectedConversation);
  selectedConversationRef.current = selectedConversation;

  const isTyping = selectedConversation && typingConversationId === selectedConversation._id;

  // ✨ --- ALL BEST FEATURES ARE NOW INCLUDED --- ✨
  useChatScroll(messagesAreaRef, messages.length, isLoadingMessages, isTyping);

  const api = useMemo(() => axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  // ... All useEffects and handlers are now the fully-featured versions ...

  useEffect(() => {
    if (!user || !token) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('setup', user);
    socket.on('connected', () => console.log('Socket connected ✅'));

    socket.on('message received', (newMessage) => {
      if (newMessage.sender._id === user._id) return;
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

    socket.on('typing', (data) => {
      setTypingConversationId(data.conversationId);
    });
    socket.on('stop typing', (data) => {
      if (typingConversationId === data.conversationId) {
        setTypingConversationId(null);
      }
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [user, token, typingConversationId]);

  useEffect(() => {
    if (!token) return;
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/convo/');
        setConversations(data || []);
      } catch (error) { console.error('Failed to fetch conversations:', error); }
    };
    fetchConversations();
  }, [token, api]);

  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const convo = conversations.find((c) => c._id === conversationIdFromUrl);
      if (convo) setSelectedConversation(convo);
      else navigate('/chat');
    } else {
      setSelectedConversation(null);
    }
  }, [conversationIdFromUrl, conversations, navigate]);

  useEffect(() => {
    if (!selectedConversation || !token) {
      setMessages([]);
      return;
    }
    setMessages([]);
    setIsLoadingMessages(true);
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/message/${selectedConversation._id}`);
        setMessages((data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        socketRef.current.emit('join conversation', selectedConversation._id);
      } catch (error) { console.error('Failed to fetch messages', error); }
      finally { setIsLoadingMessages(false); }
    };
    const markAsRead = async () => {
      if (selectedConversation.unreadCount > 0) {
        try {
          await api.put(`/convo/read/${selectedConversation._id}`);
          setConversations((prev) => prev.map((c) => c._id === selectedConversation._id ? { ...c, unreadCount: 0 } : c));
        } catch (error) { console.error('Failed to mark as read', error); }
      }
    };
    fetchMessages();
    markAsRead();
  }, [selectedConversation, token, api]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      _id: tempId, content: newMessage, sender: user,
      createdAt: new Date().toISOString(), status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    socketRef.current.emit('stop typing', { conversationId: selectedConversation._id });

    try {
      const payload = { content: newMessage, conversationId: selectedConversation._id };
      const { data: sentMessage } = await api.post('/message/', payload);
      setMessages((prev) => prev.map((msg) => (msg._id === tempId ? { ...sentMessage, status: 'sent' } : msg)));
      socketRef.current.emit('new message', { ...sentMessage, conversation: { _id: selectedConversation._id, user: selectedConversation.user, provider: selectedConversation.provider } });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.map((msg) => (msg._id === tempId ? { ...optimisticMessage, status: 'error' } : msg)));
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !selectedConversation) return;
    socketRef.current.emit('typing', { conversationId: selectedConversation._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socketRef.current.emit('stop typing', { conversationId: selectedConversation._id });
    }, 3000);
    setTypingTimeout(timeout);
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const getOtherParticipant = (convo) => (!convo || !user) ? { name: 'Unknown' } : (convo.provider?._id === user._id ? convo.user : convo.provider);
  const otherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;
  const isChatVisibleMobile = !!conversationIdFromUrl;

  const MessageStatus = ({ status }) => {
    if (status === 'sending') return <Clock size={12} className="timestamp" />;
    if (status === 'error') return <AlertCircle size={12} className="timestamp error" />;
    return null;
  };
  const DateSeparator = ({ date }) => <div className="date-separator"><span>{date}</span></div>;
  const formatTimestamp = (dateString) => dateString ? new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`chat-page-container ${isChatVisibleMobile ? 'show-chat' : ''}`}>
      {/* ... JSX remains the same ... */}
      <div className="conversation-list-panel">
        <div className="chatNav-header">
          <button className="chatNav-menuButton" onClick={() => setIsDropdownOpen(!isDropdownOpen)}><Menu size={22} /></button>
          <h3 className="chatNav-title">Chats</h3>
          <div className={`chatNav-sideMenu ${isDropdownOpen ? "open" : ""}`}>
            <div className="chatNav-menuContent">
              <button onClick={() => { navigate('/'); setIsDropdownOpen(false); }}><Home size={18} /> Home</button>
              <button onClick={() => { navigate('/dashboard'); setIsDropdownOpen(false); }}><LayoutDashboard size={18} /> My Account</button>
              <button onClick={() => { handleLogout(); setIsDropdownOpen(false); }}><LogOut size={18} /> Logout</button>
            </div>
          </div>
          {isDropdownOpen && <div className="chatNav-overlay" onClick={() => setIsDropdownOpen(false)} />}
        </div>
        <div className="conversations">
          {conversations.map((convo) => {
            const other = getOtherParticipant(convo);
            return (
              <div key={convo._id} className={`conversation-item ${selectedConversation?._id === convo._id ? 'active' : ''}`} onClick={() => navigate(`/chat/${convo._id}`)}>
                <Avatar name={other?.fullName || other?.name} />
                <div className="convo-details">
                  <p className="convo-name">{other?.fullName || other?.name}</p>
                  <p className="convo-preview">
                    {convo.latestMessage ? convo.latestMessage.content.substring(0, 30) : 'No messages yet'}
                    {convo.latestMessage?.content.length > 30 ? '...' : ''}
                  </p>
                </div>
                <div className="convo-meta">
                  <span className="convo-timestamp">{formatTimestamp(convo.latestMessage?.createdAt)}</span>
                  {convo.unreadCount > 0 && <span className="unread-badge">{convo.unreadCount}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="chat-box-panel">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <button className="back-button icon-button" onClick={() => navigate('/chat')}><ArrowLeft size={22} /></button>
              <Avatar name={otherUser?.fullName || otherUser?.name} />
              <h3>{otherUser?.fullName || otherUser?.name}</h3>
              <div className="header-actions">
                <button onClick={toggleTheme} className="icon-button">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
              </div>
            </div>
            <div className="messages-area" ref={messagesAreaRef}>
              {isLoadingMessages ? <MessageSkeleton /> : messages.map((msg, index) => {
                const isSentByUser = msg.sender?._id === user?._id;
                let showDateSeparator = index === 0 || differenceInCalendarDays(new Date(msg.createdAt), new Date(messages[index - 1].createdAt)) > 0;
                return (
                  <React.Fragment key={msg._id}>
                    {showDateSeparator && <DateSeparator date={formatDateSeparator(msg.createdAt)} />}
                    <div className={`message-bubble-wrapper ${isSentByUser ? 'sent' : 'received'}`}>
                      <div className="message-bubble">
                        <span className="message-content">{msg.content}</span>
                        <span className="timestamp">{formatTimestamp(msg.createdAt)}</span>
                        {isSentByUser && <MessageStatus status={msg.status} />}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {isTyping && !isLoadingMessages && <TypingIndicator />}
            </div>
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <textarea placeholder="Type a message..." value={newMessage} onChange={handleTyping} rows="1"
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.target.style.height = 'auto';
                    handleSendMessage(e);
                  }
                }}
              />
              <button type="submit"><Send size={20} /></button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected"><h2>Select a conversation to start chatting</h2></div>
        )}
      </div>
    </div>
  );
}