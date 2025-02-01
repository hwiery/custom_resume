import React from 'react';
import { Message } from '../types/message';
import styled from 'styled-components';
import LogoIcon from '../assets/Logo.svg';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    return (
        <MessageListContainer>
            {messages.map((message, index) => (
                <MessageItem key={`${message.timestamp.getTime()}-${index}`} className={message.role}>
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
    background-color: ${props => props.$isUser ? '#0A66C2' : '#F0F2F5'};
    color: ${props => props.$isUser ? 'white' : '#1C1E21'};
    padding: 1rem;
    border-radius: ${props => props.$isUser ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0'};
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
