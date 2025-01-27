import React from 'react';
import styled from 'styled-components';
import { Message } from '../types/message';
import LoadingIndicator from './LoadingIndicator';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    return (
        <MessageListContainer role="log" aria-live="polite">
            {messages.map((message, index) => (
                <MessageItem 
                    key={message.id} 
                    $isUser={message.sender === 'user'}
                    role="listitem"
                    aria-label={`${message.sender === 'user' ? '사용자' : 'AI'} 메시지`}
                >
                    <MessageContent $isUser={message.sender === 'user'}>
                        {message.text}
                    </MessageContent>
                    <MessageTime aria-label="메시지 시간">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </MessageTime>
                </MessageItem>
            ))}
            {isLoading && (
                <MessageItem 
                    $isUser={false}
                    role="status"
                    aria-label="메시지 로딩 중"
                >
                    <MessageContent $isUser={false}>
                        <LoadingIndicator size={24} color="#666" />
                    </MessageContent>
                </MessageItem>
            )}
        </MessageListContainer>
    );
};

const MessageListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    overflow-y: auto;
    flex: 1;

    @media (max-width: 768px) {
        padding: 16px;
        gap: 12px;
    }
`;

const MessageItem = styled.div<{ $isUser: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    gap: 4px;
    max-width: 85%;
    align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};

    @media (max-width: 768px) {
        max-width: 90%;
    }
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
    padding: 12px 16px;
    border-radius: 16px;
    background-color: ${props => props.$isUser ? '#1a73e8' : '#f1f3f4'};
    color: ${props => props.$isUser ? 'white' : '#1a1a1a'};
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        padding: 10px 14px;
        font-size: 13px;
        border-radius: 14px;
    }
`;

const MessageTime = styled.span`
    font-size: 12px;
    color: #666;
    margin: 0 8px;

    @media (max-width: 768px) {
        font-size: 11px;
        margin: 0 6px;
    }
`;

export default MessageList;
