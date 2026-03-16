import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    
    const socketRef = useRef(null);
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (isAuthenticated && user) {
            connectSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isAuthenticated, user]);

    const connectSocket = () => {
        const token = localStorage.getItem('accessToken');
        
        socketRef.current = io('http://localhost:3000', {
            auth: { token },
            transports: ['websocket']
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Connected to chat server');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('❌ Disconnected from chat server');
            setIsConnected(false);
        });

        socketRef.current.on('chat_history', (history) => {
            setMessages(history);
        });

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
            
            if (!isOpen && message.userId !== user?.id) {
                setUnreadCount(prev => prev + 1);
                
                // Показываем уведомление
                if (Notification.permission === 'granted') {
                    new Notification(`Новое сообщение от ${message.userName}`, {
                        body: message.text,
                        icon: '/logo192.png'
                    });
                }
            }
        });

        socketRef.current.on('user_online', (userData) => {
            setOnlineUsers(prev => [...prev, userData]);
        });

        socketRef.current.on('user_offline', ({ userId }) => {
            setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
        });

        socketRef.current.on('online_users', (users) => {
            setOnlineUsers(users);
        });

        socketRef.current.on('user_typing', ({ userId, name, isTyping }) => {
            setTypingUsers(prev => {
                if (isTyping) {
                    return [...prev, { userId, name }];
                } else {
                    return prev.filter(u => u.userId !== userId);
                }
            });
        });

        socketRef.current.on('messages_read', (messageIds) => {
            setMessages(prev => 
                prev.map(msg => 
                    messageIds.includes(msg.id) ? { ...msg, read: true } : msg
                )
            );
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Chat connection error:', error);
            showToast('Ошибка подключения к чату', 'error');
        });
    };

    const sendMessage = (text, attachments = []) => {
        if (!text.trim() && attachments.length === 0) return;
        
        socketRef.current.emit('send_message', { text, attachments });
    };

    const startTyping = () => {
        socketRef.current.emit('typing', true);
    };

    const stopTyping = () => {
        socketRef.current.emit('typing', false);
    };

    const markAsRead = (messageIds) => {
        socketRef.current.emit('mark_read', messageIds);
        setUnreadCount(0);
    };

    const openChat = () => {
        setIsOpen(true);
        setUnreadCount(0);
        
        // Запрашиваем разрешение на уведомления
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    const closeChat = () => {
        setIsOpen(false);
    };

    return (
        <ChatContext.Provider value={{
            isOpen,
            messages,
            onlineUsers,
            typingUsers,
            unreadCount,
            isConnected,
            sendMessage,
            startTyping,
            stopTyping,
            markAsRead,
            openChat,
            closeChat
        }}>
            {children}
        </ChatContext.Provider>
    );
};