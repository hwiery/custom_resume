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
import axiosInstance from '../api/axios';
import { AxiosError } from 'axios';

interface ChatInterfaceProps {
    isLoggedIn: boolean;
    onLogin: (credentialResponse?: any) => void | Promise<void>;
    selectedChatId?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const INITIAL_MESSAGE: Message = {
    id: 0,
    text: "안녕하세요! 저는 당신의 이력서 작성을 도와드릴 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?\n\n다음과 같은 것들을 도와드릴 수 있습니다:\n1. 이력서 작성 가이드\n2. 경력 기술 방법 조언\n3. 자기소개서 작성 도움\n4. 포트폴리오 구성 제안\n\n무엇을 도와드릴까요?",
    sender: 'RESUMER',
    timestamp: new Date()
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isLoggedIn, onLogin, selectedChatId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatCount, setChatCount] = useState<number>(0);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [forceLogin, setForceLogin] = useState<boolean>(false);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
    const sessionId = useRef(uuidv4());
    const messageListRef = useRef<HTMLDivElement>(null);

    // 로그인 상태와 토큰 확인
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('로그인 상태 확인:', {
            isLoggedIn,
            hasToken: !!token,
            tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
        });
    }, [isLoggedIn]);

    // 자동 스크롤 기능
    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 선택된 채팅 히스토리 로드
    useEffect(() => {
        if (isLoggedIn && selectedChatId && selectedChatId !== 'new') {
            loadChatHistory(selectedChatId);
        } else if (selectedChatId === 'new') {
            setMessages([INITIAL_MESSAGE]);
            setCurrentChatId(undefined);
        }
    }, [isLoggedIn, selectedChatId]);

    // 초기 메시지 설정
    useEffect(() => {
        const savedMessages = ChatService.loadTempChat(sessionId.current);
        if (savedMessages.length > 0) {
            setMessages(savedMessages);
        } else {
            setMessages([INITIAL_MESSAGE]);
        }
    }, []);

    // 메시지가 변경될 때마다 임시 저장
    useEffect(() => {
        if (messages.length > 0) {
            ChatService.saveTempChat(sessionId.current, messages);
        }
    }, [messages]);

    const loadChatHistory = async (chatId: string) => {
        try {
            const response = await axiosInstance.get(`/api/chat/history/${chatId}`);
            if (response.data.success) {
                const history = response.data.data;
                setMessages(history.messages.map((msg: any, index: number) => ({
                    id: index + 1,
                    text: msg.content,
                    sender: msg.isUser ? 'user' : 'RESUMER',
                    timestamp: new Date(msg.timestamp)
                })));
                setCurrentChatId(chatId);
            }
        } catch (error) {
            console.error('채팅 히스토리 로드 중 오류:', error);
        }
    };

    const handleMessageSend = async (text: string) => {
        console.log('메시지 전송 시도:', {
            isLoggedIn,
            currentChatId,
            text,
            hasToken: !!localStorage.getItem('token')
        });

        if (!isLoggedIn) {
            const newCount = chatCount + 1;
            setChatCount(newCount);
            console.log('비로그인 상태 채팅:', { count: newCount, maxBeforeLogin: 3 });
            
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
            if (isLoggedIn) {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('토큰이 없습니다. 로그인이 필요합니다.');
                    setShowLoginModal(true);
                    return;
                }

                try {
                    if (!currentChatId) {
                        console.log('새 채팅 히스토리 생성 시도:', {
                            message: text,
                            token: token.substring(0, 10) + '...'
                        });

                        const response = await axiosInstance.post('/api/chat/history', {
                            messages: [{
                                content: text,
                                isUser: true,
                                timestamp: new Date()
                            }]
                        });
                        
                        console.log('채팅 히스토리 생성 응답:', response.data);
                        if (response.data.success) {
                            setCurrentChatId(response.data.data._id);
                        }
                    } else {
                        console.log('기존 채팅에 메시지 추가 시도:', {
                            chatId: currentChatId,
                            message: text
                        });

                        await axiosInstance.post(`/api/chat/history/${currentChatId}/message`, {
                            content: text,
                            isUser: true
                        });
                    }
                } catch (error) {
                    const axiosError = error as AxiosError;
                    console.error('채팅 저장 오류:', {
                        error: axiosError.isAxiosError ? {
                            status: axiosError.response?.status,
                            data: axiosError.response?.data,
                            message: axiosError.message
                        } : error
                    });
                    if (axiosError.isAxiosError && axiosError.response?.status === 401) {
                        setShowLoginModal(true);
                    }
                }
            }

            const response = await getChatResponse([...messages, newMessage]);
            const computerResponse: Message = {
                id: messages.length + 2,
                text: response,
                sender: 'RESUMER',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, computerResponse]);

            // AI 응답 저장
            if (isLoggedIn && currentChatId) {
                try {
                    await axiosInstance.post(`/api/chat/history/${currentChatId}/message`, {
                        content: computerResponse.text,
                        isUser: false
                    });
                } catch (error) {
                    console.error('AI 응답 저장 오류:', error);
                }
            }
        } catch (error) {
            console.error('Error getting response:', error);
            const errorMessage: Message = {
                id: messages.length + 2,
                text: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                sender: 'RESUMER',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
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
