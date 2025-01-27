import React from 'react';
import styled from 'styled-components';
import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ko } from 'date-fns/locale';

interface ChatHistoryProps {
  chats: Array<{
    _id: string;
    title: string;
    lastMessage: string;
    lastMessageDate: string;
    createdAt: string;
  }>;
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  onChatSelect,
  selectedChatId
}) => {
  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    return formatDistanceToNow(messageDate, { addSuffix: true, locale: ko });
  };

  return (
    <HistoryContainer>
      {chats.map((chat) => (
        <HistoryItem
          key={chat._id}
          onClick={() => onChatSelect(chat._id)}
          selected={chat._id === selectedChatId}
        >
          <Title>{chat.title}</Title>
          <LastMessage>{chat.lastMessage}</LastMessage>
          <TimeStamp>{formatDate(chat.lastMessageDate)}</TimeStamp>
        </HistoryItem>
      ))}
    </HistoryContainer>
  );
};

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const HistoryItem = styled.div<{ selected?: boolean }>`
  padding: 16px;
  background-color: ${props => props.selected ? '#F3F4F6' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #F3F4F6;
  }
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
`;

const LastMessage = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: #9CA3AF;
`;

export default ChatHistory; 
