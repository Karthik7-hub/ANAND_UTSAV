import React, { useState, useEffect, useRef, useMemo } from 'react'; // ✅ ADDED useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../context/ThemeContext'; // ✅ ADDED ThemeContext
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Menu, Sun, Moon, ArrowLeft, LayoutDashboard, Clock, AlertCircle } from 'lucide-react'; // ✅ ADDED icons
import '../css/ChatPage.css';
import { format, isToday, isYesterday, isThisWeek, differenceInCalendarDays } from 'date-fns'; // ✅ ADDED date-fns

// --- Configuration ---
const API_BASE_URL = 'https://anandnihal.onrender.com';
const SOCKET_URL = 'https://anandnihal.onrender.com/';

// --- Helper Components (Copied from ChatPage) ---
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
    <div className="message-bubble-wrapper received">
        <div className="message-bubble">
            <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div>
);

const MessageSkeleton = () => (
    <>
        <div className="skeleton-bubble received" />
        <div className="skeleton-bubble sent" />
        <div className="skeleton-bubble sent small" />
        <div className="skeleton-bubble received" />
    </>
);

// ✅ ADDED: New helper function for the date separators
const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
    return format(date, 'dd/MM/yyyy');
};


export default function ProviderChatPage() {
    const { provider, token } = useProvider();
    const { conversationId: conversationIdFromUrl } = useParams();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // --- State ---
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // --- Refs ---
    const socketRef = useRef(null);
    const messagesAreaRef = useRef(null);
    const selectedConversationRef = useRef(selectedConversation);
    selectedConversationRef.current = selectedConversation;

    // ✅ FIX: Memoize the api object to prevent infinite re-renders
    const api = useMemo(() => {
        return axios.create({
            baseURL: API_BASE_URL,
            headers: { Authorization: `Bearer ${token}` },
        });
    }, [token]);

    useEffect(() => {
        if (messagesAreaRef.current) {
            messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // --- Effects ---
    useEffect(() => {
        if (!provider || !token) return;
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.emit('setup', provider);
        socket.on('connected', () => console.log('Socket connected for Provider ✅'));

        socket.on('message received', (newMessage) => {
            // Ignore messages broadcasted by yourself
            if (newMessage.sender._id === provider._id) {
                return;
            }
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
    }, [provider, token]);

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
    }, [token, api]);

    useEffect(() => {
        if (conversationIdFromUrl && conversations.length > 0) {
            const convo = conversations.find((c) => c._id === conversationIdFromUrl);
            if (convo) setSelectedConversation(convo);
            else navigate('/provider/chat');
        } else {
            setSelectedConversation(null);
        }
    }, [conversationIdFromUrl, conversations, navigate]);

    useEffect(() => {
        if (!selectedConversation || !token) {
            setMessages([]);
            return;
        };
        setMessages([]);

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const { data } = await api.get(`/message/${selectedConversation._id}`);
                setMessages((data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
                socketRef.current.emit('join conversation', selectedConversation._id);
            } catch (error) {
                console.error('Failed to fetch messages', error);
            } finally {
                setIsLoadingMessages(false);
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
    }, [selectedConversation, token, api]);

    // --- Handlers ---
    // ✅ CHANGED: Replaced with the new optimistic version
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const tempId = `temp_${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            content: newMessage,
            sender: provider, // Use provider object
            createdAt: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage('');
        socketRef.current.emit('stop typing', selectedConversation._id);

        try {
            const payload = { content: optimisticMessage.content, conversationId: selectedConversation._id };
            const { data: sentMessage } = await api.post('/message/', payload);

            setMessages((prev) =>
                prev.map((msg) => (msg._id === tempId ? { ...sentMessage, status: 'sent' } : msg))
            );

            socketRef.current.emit('new message', {
                ...sentMessage,
                conversation: {
                    _id: selectedConversation._id,
                    participants: [selectedConversation.user, selectedConversation.provider],
                },
            });

        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempId ? { ...optimisticMessage, status: 'error' } : msg
                )
            );
        }
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

    const getOtherParticipant = (convo) => {
        if (!convo || !provider) return { name: 'Unknown' };
        return convo.provider?._id === provider._id ? convo.user : convo.provider;
    };

    const otherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;
    const isChatVisibleMobile = !!conversationIdFromUrl;

    // ✅ ADDED: Helper component for message status
    const MessageStatus = ({ status }) => {
        if (status === 'sending') {
            return <Clock size={12} className="timestamp" style={{ marginLeft: '4px', marginRight: '0' }} />;
        }
        if (status === 'error') {
            return <AlertCircle size={12} className="timestamp" style={{ color: '#ff4d4d', marginLeft: '4px', marginRight: '0' }} />;
        }
        return null;
    };

    // ✅ ADDED: Helper component for date separator
    const DateSeparator = ({ date }) => (
        <div className="date-separator">
            <span>{date}</span>
        </div>
    );

    const formatTimestamp = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // --- Render ---
    return (
        <div className={`chat-page-container ${isChatVisibleMobile ? 'show-chat' : ''}`}>
            <div className="conversation-list-panel">
                <div className="chatNav-header">
                    <button className="chatNav-menuButton" onClick={() => setIsDropdownOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <h3 className="chatNav-title">Chats</h3>
                    <div className={`chatNav-sideMenu ${isDropdownOpen ? "open" : ""}`}>
                        <div className="chatNav-menuContent">
                            <button onClick={() => { navigate('/provider/dashboard'); setIsDropdownOpen(false); }}><LayoutDashboard size={18} />My Dashboard</button>
                        </div>
                    </div>
                    {isDropdownOpen && <div className="chatNav-overlay" onClick={() => setIsDropdownOpen(false)} />}
                </div>
                <div className="conversations">
                    {conversations.map((convo) => {
                        const other = getOtherParticipant(convo);
                        return (
                            <div
                                key={convo._id}
                                className={`conversation-item ${selectedConversation?._id === convo._id ? 'active' : ''}`}
                                onClick={() => navigate(`/provider/chat/${convo._id}`)}
                            >
                                <Avatar name={other?.fullName || other?.name} />
                                <div className="convo-details">
                                    <p className="convo-name">{other?.fullName || other?.name}</p>
                                    <p className="convo-preview">
                                        {convo.latestMessage ? convo.latestMessage.content.substring(0, 30) : 'No messages yet'}
                                        {convo.latestMessage?.content.length > 30 ? '...' : ''}
                                    </p>
                                </div>
                                <div className="convo-meta">
                                    <span className="convo-timestamp">{convo.latestMessage ? formatTimestamp(convo.latestMessage.createdAt) : ''}</span>
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
                            <button className="back-button icon-button" onClick={() => navigate('/provider/chat')}><ArrowLeft size={22} /></button>
                            <Avatar name={otherUser?.fullName || otherUser?.name} />
                            <h3>{otherUser?.fullName || otherUser?.name}</h3>
                            <div className="header-actions">
                                <button onClick={toggleTheme} className="icon-button">
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="messages-area" ref={messagesAreaRef}>
                            {/* ✅ CHANGED: Replaced map logic with date separator version */}
                            {isLoadingMessages ? <MessageSkeleton />
                                : messages.map((msg, index) => {
                                    const isSentByProvider = msg.sender?._id === provider?._id;

                                    let showDateSeparator = false;
                                    if (index === 0) {
                                        showDateSeparator = true;
                                    } else {
                                        const prevMsg = messages[index - 1];
                                        if (differenceInCalendarDays(new Date(msg.createdAt), new Date(prevMsg.createdAt)) > 0) {
                                            showDateSeparator = true;
                                        }
                                    }

                                    return (
                                        <React.Fragment key={msg._id}>
                                            {showDateSeparator && <DateSeparator date={formatDateSeparator(msg.createdAt)} />}
                                            <div className={`message-bubble-wrapper ${isSentByProvider ? 'sent' : 'received'}`}>
                                                <div className="message-bubble">
                                                    <span className="message-content">{msg.content}</span>
                                                    <span className="timestamp">{formatTimestamp(msg.createdAt)}</span>
                                                    {isSentByProvider && <MessageStatus status={msg.status} />}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })
                            }
                            {isTyping && !isLoadingMessages && <TypingIndicator />}
                        </div>

                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <textarea
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleTyping}
                                rows="1"
                                // ✅ ADD THIS onInput HANDLER
                                onInput={(e) => {
                                    e.target.style.height = 'auto'; // Reset height
                                    e.target.style.height = `${e.target.scrollHeight}px`; // Set to content height
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();

                                        // ✅ ADD THIS to reset the height on send
                                        e.target.style.height = 'auto';

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