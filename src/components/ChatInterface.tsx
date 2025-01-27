import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { Message } from '../types/message';
import { getChatResponse } from '../api/deepseek';
import LoginModal from './LoginModal';
import ChatService from '../services/chatService';
import { IoEnterOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import Toast from './Toast';
import { useParams, useNavigate } from 'react-router-dom';

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
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const sessionId = useRef(uuidv4());
    const messageListRef = useRef<HTMLDivElement>(null);
    const { setError } = useError();
    const { chatId } = useParams();
    const navigate = useNavigate();

    // 자동 스크롤 기능
    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (chatId) {
            loadChat(chatId);
        } else {
            const savedMessages = ChatService.loadTempChat(sessionId.current);
            setMessages(savedMessages);
        }
    }, [chatId]);

    const loadChat = async (id: string) => {
        try {
            const response = await ChatService.getChat(id);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error loading chat:', error);
            showToast('채팅을 불러오는데 실패했습니다.', 'error');
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            ChatService.saveTempChat(sessionId.current, messages);
        }
    }, [messages]);

    useEffect(() => {
        if (isLoggedIn) {
            const tempMessages = ChatService.loadTempChat(sessionId.current);
            if (tempMessages.length > 0) {
                handleTempChatMigration(tempMessages);
            }
        }
    }, [isLoggedIn]);

    const handleTempChatMigration = async (tempMessages: Message[]) => {
        try {
            const chatResponse = await ChatService.startNewChat(tempMessages);
            ChatService.clearTempChat(sessionId.current);
            navigate(`/chats/${chatResponse.data._id}`);
        } catch (error) {
            console.error('Error migrating temp chat:', error);
            showToast('임시 채팅 데이터 이전 중 오류가 발생했습니다.', 'error');
        }
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
    };

    const handleMessageSend = async (text: string) => {
        if (!isLoggedIn) {
            const newCount = chatCount + 1;
            setChatCount(newCount);
            
            if (newCount >= 3) {
                setForceLogin(true);
                setShowLoginModal(true);
                return;
            }
        }

        const newMessage: Message = {
            id: messages.length + 1,
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const response = await getChatResponse([...messages, newMessage]);
            const computerResponse: Message = {
                id: messages.length + 2,
                text: response,
                sender: 'RESUMER',
                timestamp: new Date()
            };

            const updatedMessages = [...messages, newMessage, computerResponse];
            setMessages(updatedMessages);

            if (isLoggedIn) {
                if (chatId) {
                    // 기존 채팅에 메시지 추가
                    await ChatService.addMessage(chatId, newMessage);
                    await ChatService.addMessage(chatId, computerResponse);
                } else {
                    // 새 채팅 시작
                    const chatResponse = await ChatService.startNewChat(updatedMessages);
                    navigate(`/chats/${chatResponse.data._id}`);
                }
            } else {
                ChatService.saveTempChat(sessionId.current, updatedMessages);
            }
        } catch (error) {
            console.error('Error getting response:', error);
            setError('응답을 받아오는 중 오류가 발생했습니다.');
            showToast('메시지 전송 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        onLogin();
    };

    const handleLoginCancel = () => {
        setShowLoginModal(false);
        if (forceLogin) {
            ChatService.clearTempChat(sessionId.current);
            setMessages([]);
            setChatCount(0);
            setForceLogin(false);
        }
    };

    return (
        <ChatContainer>
            <MainContent ref={messageListRef}>
                <Header>
                    <Title>Tell me your story.</Title>
                </Header>
                <MessageList messages={messages} isLoading={isLoading} />
                <InputContainer>
                    <MessageInput onSendMessage={handleMessageSend} isLoading={isLoading} />
                </InputContainer>
            </MainContent>
            <LoginModal
                isOpen={showLoginModal}
                onClose={handleLoginCancel}
                onSuccess={handleLoginSuccess}
                forceLogin={forceLogin}
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
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
    
    @media (max-width: 1024px) {
        width: 100%;
        padding: 0 20px;
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
`;

const Header = styled.header`
    padding: 40px 0;
    text-align: center;
    width: 100%;
    background: white;
    margin-bottom: 20px;
`;

const Title = styled.h1`
    font-family: 'Pretendard Bold', sans-serif;
    font-size: 32px;
    color: #1E3A8A;
    margin: 0;
    white-space: nowrap;
    
    @media (max-width: 768px) {
        font-size: 28px;
    }
    
    @media (max-width: 480px) {
        font-size: 24px;
    }
`;

const InputContainer = styled.div`
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 760px;
    height: auto;
    min-height: 120px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 0 20px;
    
    @media (max-width: 1024px) {
        width: calc(100% - 40px);
        left: 50%;
    }
    
    & > form {
        width: 100%;
        padding: 20px;
    }
`;

export default ChatInterface;
