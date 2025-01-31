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

interface ChatInterfaceProps {
    selectedChatId?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedChatId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatCount, setChatCount] = useState<number>(0);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [forceLogin, setForceLogin] = useState<boolean>(false);
    const sessionId = useRef(uuidv4());
    const messageListRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);

    // 로그인 상태와 토큰 확인
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('로그인 상태 확인:', {
            isLoggedIn: !!token,
            hasToken: !!token,
            tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
        });
    }, []);

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
        const savedMessages = ChatService.loadTempChat(sessionId.current);
        setMessages(savedMessages);
    }, []);

    // 메시지가 변경될 때마다 임시 저장
    useEffect(() => {
        if (messages.length > 0) {
            ChatService.saveTempChat(sessionId.current, messages);
        }
    }, [messages]);

    useEffect(() => {
        if (isAuthenticated && selectedChatId && selectedChatId !== 'new') {
            loadChat(selectedChatId);
        } else {
            setMessages([]);
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

    const handleMessageSend = async (text: string) => {
        const newMessage: Message = {
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                if (!currentChat) {
                    // 새로운 채팅 시작
                    const response = await axios.post('/api/chat', {
                        title: text.substring(0, 50) + '...',
                        message: text
                    });

                    if (response.data.success) {
                        setCurrentChat(response.data.data);
                        setMessages([newMessage]);
                    }
                } else {
                    // 기존 채팅에 메시지 추가
                    const response = await axios.post(`/api/chat/${currentChat._id}/messages`, {
                        role: 'user',
                        content: text
                    });

                    if (response.data.success) {
                        setMessages([...messages, newMessage]);
                    }
                }

                // AI 응답 처리
                const aiResponse = await getChatResponse([...messages, newMessage]);

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date()
                };

                if (currentChat) {
                    await axios.post(`/api/chat/${currentChat._id}/messages`, {
                        role: 'assistant',
                        content: assistantMessage.content
                    });
                }

                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: "로그인이 필요한 서비스입니다.",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error('Error getting response:', error);
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

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        setForceLogin(false);
        setChatCount(0);
    };

    const handleSendMessage = async (message: string) => {
        if (!isAuthenticated) {
            console.log('로그인이 필요합니다.');
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

            if (!chatId) {
                // 새로운 채팅 시작
                const chatResponse = await axios.post('/api/chat', {
                    title: message.substring(0, 50) + '...'
                });

                if (!chatResponse.data.success) {
                    throw new Error('채팅 생성 실패');
                }

                chatId = chatResponse.data.data._id;
                setCurrentChat(chatResponse.data.data);
            }

            // 메시지 추가
            await axios.post(`/api/chat/${chatId}/messages`, {
                role: 'user',
                content: message
            });

            // AI 응답 처리
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

    return (
        <ChatContainer>
            <MainContent ref={messageListRef}>
                <Header>
                    <Title>Tell me your story.</Title>
                </Header>
                <MessageList messages={messages} isLoading={isLoading} />
                <InputContainer>
                    <InputArea onSubmit={handleSendMessage} />
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
    
    @media (max-width: 1024px) {
        width: 100%;
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
    left: 65%;
    transform: translateX(-50%);
    width: calc(100% - 280px);
    max-width: 760px;
    height: auto;
    min-height: 120px;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    
    @media (max-width: 1024px) {
        width: 100%;
    }
    
    & > form {
        width: 100%;
        padding: 20px;
    }
`;

export default ChatInterface;
