import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { Message } from '../types/message';
import { getChatResponse } from '../api/deepseek';
import LoginModal from './LoginModal';
import { chatService } from '../services/chatService';
import { IoEnterOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../types/error';

interface ChatInterfaceProps {
    isLoggedIn: boolean;
    onLogin: () => void;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    isLoggedIn, 
    onLogin, 
    isSidebarOpen, 
    onToggleSidebar 
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatCount, setChatCount] = useState<number>(0);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [forceLogin, setForceLogin] = useState<boolean>(false);
    const sessionId = useRef(uuidv4());
    const messageListRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    // 자동 스크롤 기능
    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 초기 메시지 설정
    useEffect(() => {
        const loadChat = async () => {
            try {
                if (isLoggedIn && user) {
                    const chat = await chatService.getChat(sessionId.current);
                    setMessages(chat.messages);
                } else {
                    const savedMessages = chatService.loadTempChat(sessionId.current);
                    setMessages(savedMessages);
                }
            } catch (error) {
                console.error('Failed to load chat:', error);
                const savedMessages = chatService.loadTempChat(sessionId.current);
                setMessages(savedMessages);
            }
        };
        loadChat();
    }, [isLoggedIn, user]);

    // 메시지가 변경될 때마다 저장
    useEffect(() => {
        const saveMessages = async () => {
            if (messages.length > 0) {
                try {
                    if (isLoggedIn && user) {
                        await chatService.saveChat(sessionId.current, messages);
                    } else {
                        chatService.saveTempChat(sessionId.current, messages);
                    }
                } catch (error) {
                    console.error('Failed to save chat:', error);
                }
            }
        };
        saveMessages();
    }, [messages, isLoggedIn, user]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        try {
            // 사용자 메시지 추가
            const newMessage: Message = {
                id: Date.now(),
                text,
                sender: 'user',
                timestamp: new Date()
            };

            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);

            // AI 응답 받기
            const response = await getChatResponse(updatedMessages);
            
            // AI 응답 메시지 추가
            const computerResponse: Message = {
                id: Date.now() + 1,
                text: response,
                sender: 'RESUMER',
                timestamp: new Date()
            };

            const finalMessages = [...updatedMessages, computerResponse];
            setMessages(finalMessages);

            // 메시지 저장
            if (isLoggedIn && user) {
                await chatService.saveChat(sessionId.current, finalMessages);
            } else {
                chatService.saveTempChat(sessionId.current, finalMessages);
            }
        } catch (error) {
            console.error('Error in chat:', error);
            const errorMessage: Message = {
                id: Date.now() + 2,
                text: getErrorMessage(error),
                sender: 'RESUMER',
                timestamp: new Date()
            };
            setMessages([...messages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        onLogin();
        setShowLoginModal(false);
        setForceLogin(false);
        setChatCount(0);
    };

    return (
        <ChatContainer role="main" aria-label="채팅 인터페이스">
            <MainContent ref={messageListRef} role="log" aria-live="polite" aria-label="메시지 목록">
                <Header>
                    <Title role="heading" aria-level={1}>Tell me your story.</Title>
                </Header>
                <MessageList 
                    messages={messages} 
                    isLoading={isLoading} 
                />
                <InputContainer role="form" aria-label="메시지 입력">
                    <MessageInput 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading} 
                    />
                </InputContainer>
            </MainContent>
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleLoginSuccess}
                forceLogin={forceLogin}
            />
        </ChatContainer>
    );
};

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: calc(100% - 280px);
    max-width: 760px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    background-color: white;
    
    @media (max-width: 768px) {
        width: 100%;
        max-width: 100%;
    }
`;

const MainContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    padding-bottom: 120px;
    height: 100vh;
    background-color: white;
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #F8F9FA;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #DDE1E6;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #CED4DA;
    }

    @media (max-width: 768px) {
        padding-bottom: 100px;
    }

    @media (max-height: 600px) {
        height: calc(100vh - 60px);
    }
`;

const Header = styled.header`
    padding: 40px 20px;
    text-align: center;
    width: 100%;
    background: white;

    @media (max-width: 768px) {
        padding: 20px 16px;
    }
`;

const Title = styled.h1`
    font-family: 'Pretendard Bold', sans-serif;
    font-size: 32px;
    color: #1E3A8A;
    margin: 0;
    
    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const InputContainer = styled.div`
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 280px);
    max-width: 760px;
    height: auto;
    min-height: 100px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    
    @media (max-width: 768px) {
        width: 100%;
        min-height: 80px;
        padding: 0 8px;
    }
    
    & > form {
        width: 100%;
        max-width: 720px;
        padding: 16px;
        margin: 0 auto;
    }

    @media (max-height: 600px) {
        position: sticky;
    }
`;

export default ChatInterface;
