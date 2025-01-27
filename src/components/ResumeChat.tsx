import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHistory from './ChatHistory';
import { Message, Chat } from '../types/message';
import { getChatResponse } from '../services/chatService';

const ResumeChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string>();

    useEffect(() => {
        // 로컬 스토리지에서 채팅 기록 불러오기
        const savedChats = localStorage.getItem('chats');
        if (savedChats) {
            setChats(JSON.parse(savedChats));
        }
    }, []);

    const saveChat = (messages: Message[]) => {
        const newChat: Chat = {
            _id: currentChatId || Date.now().toString(),
            userId: 'user123', // 실제 구현시 사용자 ID 사용
            sessionId: Date.now().toString(),
            messages,
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false
        };

        setChats(prevChats => {
            const updatedChats = currentChatId
                ? prevChats.map(chat => chat._id === currentChatId ? newChat : chat)
                : [newChat, ...prevChats];
            
            localStorage.setItem('chats', JSON.stringify(updatedChats));
            return updatedChats;
        });

        if (!currentChatId) {
            setCurrentChatId(newChat._id);
        }
    };

    const handleSendMessage = async (input: string) => {
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        try {
            const userMessage: Message = {
                id: Date.now(),
                text: input,
                sender: 'user',
                timestamp: new Date()
            };

            const newMessages = [...messages, userMessage];
            setMessages(newMessages);

            const response = await getChatResponse(newMessages);
            const assistantMessage: Message = {
                id: Date.now() + 1,
                text: response,
                sender: 'RESUMER',
                timestamp: new Date()
            };

            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
            saveChat(updatedMessages);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatSelect = (chatId: string) => {
        const selectedChat = chats.find(chat => chat._id === chatId);
        if (selectedChat) {
            setCurrentChatId(chatId);
            setMessages(selectedChat.messages);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(undefined);
        setMessages([]);
    };

    return (
        <ChatContainer>
            <ChatHistory 
                chats={chats}
                onChatSelect={handleChatSelect}
                currentChatId={currentChatId}
            />
            <ChatContent>
                <ChatHeader>
                    <HeaderTitle>
                        {currentChatId ? '계속하기' : '새로운 대화'}
                    </HeaderTitle>
                    <NewChatButton onClick={handleNewChat}>
                        새로운 대화
                    </NewChatButton>
                </ChatHeader>
                <MessageList messages={messages} isLoading={isLoading} />
                <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </ChatContent>
        </ChatContainer>
    );
};

const ChatContainer = styled.div`
    display: flex;
    height: 100vh;
    background-color: white;
`;

const ChatContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ChatHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background-color: white;
`;

const HeaderTitle = styled.h1`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
`;

const NewChatButton = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background-color: #1a73e8;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #1557b0;
    }
`;

export default ResumeChat;
