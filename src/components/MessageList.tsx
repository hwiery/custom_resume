import React from 'react';
import styled from 'styled-components';
import { Message } from '../types/message';
import LogoIcon from '../assets/Logo.svg';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    return (
        <MessageContainer>
            {messages.map((message) => (
                <MessageWrapper key={message.id} isUser={message.sender === 'user'}>
                    {message.sender !== 'user' && (
                        <IconWrapper>
                            <img src={LogoIcon} alt="RESUMER" width="24" height="24" />
                        </IconWrapper>
                    )}
                    <MessageBubble isUser={message.sender === 'user'}>
                        <MessageText>{message.text}</MessageText>
                    </MessageBubble>
                </MessageWrapper>
            ))}
            {isLoading && (
                <MessageWrapper isUser={false}>
                    <IconWrapper>
                        <img src={LogoIcon} alt="RESUMER" width="24" height="24" />
                    </IconWrapper>
                    <MessageBubble isUser={false}>
                        <LoadingDots>
                            <span>.</span><span>.</span><span>.</span>
                        </LoadingDots>
                    </MessageBubble>
                </MessageWrapper>
            )}
        </MessageContainer>
    );
};

const MessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 0 20px 120px 20px;
`;

const MessageWrapper = styled.div<{ isUser: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    gap: 8px;
    width: 100%;
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

const MessageBubble = styled.div<{ isUser: boolean }>`
    max-width: calc(100% - 48px);
    background-color: ${props => props.isUser ? '#E7F5FF' : '#FFFFFF'};
    padding: 16px 20px;
    border-radius: ${props => props.isUser ? '16px 16px 0 16px' : '16px 16px 16px 0'};
    border: 1px solid ${props => props.isUser ? '#BFE3FF' : '#E5E7EB'};
`;

const MessageText = styled.p`
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    color: #1F2937;
    white-space: pre-wrap;
    font-family: 'Pretendard Regular', sans-serif;
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
