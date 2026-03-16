import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.scss';

const ChatWidget = () => {
    const {
        isOpen,
        messages,
        onlineUsers,
        typingUsers,
        unreadCount,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        openChat,
        closeChat
    } = useChat();

    const { user } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const isAdmin = user?.role === 'admin' || user?.role === 'support';

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length > 0) {
            const unreadMessages = messages
                .filter(msg => !msg.read && msg.userId !== user?.id)
                .map(msg => msg.id);
            
            if (unreadMessages.length > 0) {
                markAsRead(unreadMessages);
            }
        }
    }, [isOpen, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
            stopTyping();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        
        startTyping();
        
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        const timeout = setTimeout(() => {
            stopTyping();
        }, 1000);
        
        setTypingTimeout(timeout);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        // Здесь можно добавить загрузку файлов
        console.log('Files to upload:', files);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageStatus = (msg) => {
        if (msg.userId === user?.id) {
            return msg.read ? '✓✓' : '✓';
        }
        return '';
    };

    if (!isOpen) {
        return (
            <button 
                className="chat-toggle"
                onClick={openChat}
            >
                💬
                {unreadCount > 0 && (
                    <span className="chat-badge">{unreadCount}</span>
                )}
            </button>
        );
    }

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h3>Чат поддержки</h3>
                    <span className={`online-status ${onlineUsers.length > 1 ? 'online' : 'offline'}`}>
                        {onlineUsers.length > 1 ? 'Оператор онлайн' : 'Нет оператора'}
                    </span>
                </div>
                <button className="chat-close" onClick={closeChat}>×</button>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        className={`message ${msg.userId === user?.id ? 'own' : 'other'}`}
                    >
                        {msg.userId !== user?.id && (
                            <div className="message-author">
                                {msg.userName}
                                {msg.userRole !== 'user' && (
                                    <span className="operator-badge">оператор</span>
                                )}
                            </div>
                        )}
                        <div className="message-content">
                            <p>{msg.text}</p>
                            {msg.attachments?.length > 0 && (
                                <div className="message-attachments">
                                    {msg.attachments.map((att, i) => (
                                        <img key={i} src={att} alt="attachment" />
                                    ))}
                                </div>
                            )}
                            <div className="message-meta">
                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                                <span className="message-status">{getMessageStatus(msg)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.map(u => u.name).join(', ')} печатает...
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите сообщение..."
                    rows="1"
                />
                <div className="chat-actions">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        multiple
                    />
                    <button 
                        className="attach-btn"
                        onClick={() => fileInputRef.current.click()}
                    >
                        📎
                    </button>
                    <button 
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;