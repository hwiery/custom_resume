import React from 'react';
import styled from 'styled-components';
import { Chat } from '../types/message';

interface ChatHistoryProps {
    chats: Chat[];
    onChatSelect: (chatId: string) => void;
    currentChatId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chats, onChatSelect, currentChatId }) => {
    const generateTitle = (chat: Chat) => {
        // 첫 번째 사용자 메시지를 기반으로 제목 생성
        const firstUserMessage = chat.messages.find(m => m.sender === 'user');
        if (chat.title) return chat.title;
        if (firstUserMessage) {
            // 메시지를 최대 30자로 제한
            return firstUserMessage.text.length > 30 
                ? `${firstUserMessage.text.substring(0, 30)}...` 
                : firstUserMessage.text;
        }
        return '새로운 대화';
    };

    return (
        <HistoryContainer>
            <HistoryTitle>대화 기록</HistoryTitle>
            <ChatList>
                {chats.map((chat) => (
                    <ChatItem 
                        key={chat._id}
                        onClick={() => onChatSelect(chat._id)}
                        $isActive={currentChatId === chat._id}
                    >
                        <ChatTitle>{generateTitle(chat)}</ChatTitle>
                        <ChatDate>
                            {new Date(chat.updatedAt).toLocaleDateString()}
                        </ChatDate>
                    </ChatItem>
                ))}
            </ChatList>
        </HistoryContainer>
    );
};

const HistoryContainer = styled.div`
    width: 280px;
    height: 100%;
    background-color: #f8f9fa;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
`;

const HistoryTitle = styled.h2`
    padding: 20px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    border-bottom: 1px solid #eee;
`;

const ChatList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px;
`;

const ChatItem = styled.div<{ $isActive: boolean }>`
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    background-color: ${props => props.$isActive ? '#e8f0fe' : 'transparent'};
    margin-bottom: 8px;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${props => props.$isActive ? '#e8f0fe' : '#f1f3f4'};
    }
`;

const ChatTitle = styled.div`
    font-size: 14px;
    color: #1a1a1a;
    margin-bottom: 4px;
    word-break: break-word;
`;

const ChatDate = styled.div`
    font-size: 12px;
    color: #666;
`;

export default ChatHistory; 