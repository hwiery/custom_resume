import React from 'react';
import { Message } from '../types/message';
import styled from 'styled-components';
import LogoIcon from '../assets/Logo.svg';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    const getMessageKey = (message: Message, index: number) => {
        // timestamp가 string인 경우 Date 객체로 변환
        const timestamp = typeof message.timestamp === 'string' 
            ? new Date(message.timestamp).getTime() 
            : message.timestamp instanceof Date 
                ? message.timestamp.getTime() 
                : index;
        return `message-${timestamp}-${index}`;
    };

    return (
        <MessageListContainer>
            {messages.map((message, index) => (
                <MessageItem key={getMessageKey(message, index)} className={message.role}>
                    {message.role === 'assistant' && (
                        <IconWrapper>
                            <img src={LogoIcon} alt="RESUMER" width="24" height="24" />
                        </IconWrapper>
                    )}
                    <MessageBubble $isUser={message.role === 'user'}>
                        <MessageText>{message.content}</MessageText>
                    </MessageBubble>
                </MessageItem>
            ))}
            {isLoading && (
                <MessageItem className="assistant">
                    <IconWrapper>
                        <img src={LogoIcon} alt="RESUMER" width="24" height="24" />
                    </IconWrapper>
                    <MessageBubble $isUser={false}>
                        <LoadingDots>       
                            <span>.</span><span>.</span><span>.</span>
                        </LoadingDots>
                    </MessageBubble>
                </MessageItem>
            )}
        </MessageListContainer>
    );
};

const MessageListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    overflow-y: auto;
    flex-grow: 1;
`;

const MessageItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    
    &.user {
        flex-direction: row-reverse;
    }
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
        width: 32px;
        height: 32px;
        padding: 4px;
        background: #F8FAFC;
        border-radius: 50%;
    }
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
    max-width: 70%;
    background-color: ${props => props.$isUser ? '#0A66C2' : '#FFFFFF'};
    color: ${props => props.$isUser ? 'white' : '#1C1E21'};
    padding: 1rem;
    border-radius: ${props => props.$isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0'};
    border: ${props => props.$isUser ? 'none' : '1px solid #666666'};
`;

const MessageText = styled.div`
    white-space: pre-wrap;
    word-break: break-word;
`;

const LoadingDots = styled.div`
    display: flex;
    gap: 4px;
    
    span {
        animation: bounce 1s infinite;
        
        &:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
    
    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-4px);
        }
    }
`;

export default MessageList;