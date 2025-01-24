import React from 'react';
import { Message } from '../types/message';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    return (
        <div className="message-list">
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`message-container ${msg.sender === 'user' ? 'user-message' : 'computer-message'}`}
                >
                    <div className="message-sender">{msg.sender === 'user' ? '사용자' : '컴퓨터'}</div>
                    <div className="message-bubble">
                        {msg.text}
                    </div>
                    <div className="message-timestamp">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="message-container computer-message loading">
                    <div className="message-bubble">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageList;
