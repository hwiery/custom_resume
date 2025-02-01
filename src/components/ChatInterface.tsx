import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { Message } from '../types/message';
import { Chat } from '../types/chat';
import { getChatResponse } from '../api/deepseek';
import LoginModal from './LoginModal';
import ChatService from '../services/chatService';
import { IoEnterOutline } from 'react-icons/io5';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import InputArea from './InputArea';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

interface ChatInterfaceProps {
    selectedChatId?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedChatId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatCount, setChatCount] = useState<number>(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const sessionId = useRef(uuidv4());
    const messageListRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
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

    // 초기 메시지 설정
    useEffect(() => {
        if (!selectedChatId || selectedChatId === 'new') {
            const initialMessages = ChatService.loadTempChat(sessionId.current);
            setMessages(initialMessages);
        }
    }, [selectedChatId]);

    // 메시지가 변경될 때마다 임시 저장
    useEffect(() => {
        if ((!selectedChatId || selectedChatId === 'new') && messages.length > 0) {
            ChatService.saveTempChat(sessionId.current, messages);
        }
    }, [messages, selectedChatId]);

    useEffect(() => {
        if (isAuthenticated && selectedChatId && selectedChatId !== 'new') {
            loadChat(selectedChatId);
        } else if (selectedChatId === 'new') {
            const initialMessages = ChatService.loadTempChat(sessionId.current);
            setMessages(initialMessages);
            setCurrentChat(null);
        }
    }, [selectedChatId, isAuthenticated]);

    const loadChat = async (chatId: string) => {
        try {
            const response = await axios.get(`/api/chat/${chatId}`);
            if (response.data.success) {
                const chat = response.data.data;
                setCurrentChat(chat);
                setMessages(chat.messages);
            }
        } catch (error) {
            console.error('채팅 로드 실패:', error);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!isAuthenticated && chatCount >= 3) {
            setShowLoginModal(true);
            return;
        }

        const newMessage: Message = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            let chatId = currentChat?._id;

            if (!isAuthenticated) {
                setChatCount(prev => prev + 1);
                const aiResponse = await getChatResponse([...messages, newMessage]);
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
                return;
            }

            if (!chatId) {
                const chatResponse = await axios.post('/api/chat', {
                    title: message.substring(0, 50) + '...'
                });

                if (!chatResponse.data.success) {
                    throw new Error('채팅 생성 실패');
                }

                chatId = chatResponse.data.data._id;
                setCurrentChat(chatResponse.data.data);
            }

            await axios.post(`/api/chat/${chatId}/messages`, {
                role: 'user',
                content: message
            });

            const aiResponse = await getChatResponse([...messages, newMessage]);
            
            const assistantMessage: Message = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };

            await axios.post(`/api/chat/${chatId}/messages`, {
                role: 'assistant',
                content: assistantMessage.content
            });

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
                credential: credentialResponse.credential
            });
            
            if (response.data.success) {
                localStorage.setItem('token', credentialResponse.credential);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                localStorage.setItem('isAuthenticated', 'true');
                window.location.reload(); // 페이지 새로고침
            }
        } catch (error) {
            console.error('로그인 실패:', error);
        }
    };

    return (
        <ChatContainer>
            <MainContent ref={messageListRef}>
                <Header>
                    <Title>Tell me your story.</Title>
                </Header>
                <MessageList messages={messages} isLoading={isLoading} />
            </MainContent>
            <InputContainer>
                <InputWrapper>
                    <InputArea onSubmit={handleSendMessage} />
                </InputWrapper>
            </InputContainer>
            <LoginModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    setShowLoginModal(false);
                    setChatCount(0);
                }}
                forceLogin={true}
            />
        </ChatContainer>
    );
};

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    position: relative;
    background-color: white;
`;

const MainContent = styled.div`
    flex: 1;
    width: 100%;
    overflow-y: auto;
    padding-bottom: 160px;
    height: calc(100vh - 160px);
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
    padding: 40px 20px;
    text-align: center;
    width: 100%;
    background: white;
`;

const Title = styled.h1`
    font-family: 'Pretendard Bold', sans-serif;
    font-size: 32px;
    color: #1E3A8A;
    margin: 0;
`;

const InputContainer = styled.div`
    position: fixed;
    bottom: 0;
    left: 280px;
    width: calc(100% - 280px);
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
        left: 0;
        width: 100%;
    }
`;

const InputWrapper = styled.div`
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    position: relative;

    @media (max-width: 768px) {
        max-width: 100%;
        padding: 0 10px;
    }
`;

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
    background-color: white;
`;

const LoginContent = styled.div`
    text-align: center;
    max-width: 400px;
    width: 100%;
`;

const LoginTitle = styled.h2`
    font-family: 'Pretendard Bold', sans-serif;
    font-size: 24px;
    color: #1E3A8A;
    margin-bottom: 24px;
    line-height: 1.4;
`;

export default ChatInterface;
