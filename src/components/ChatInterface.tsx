import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { Message } from '../types/message';
import { getChatResponse } from '../api/deepseek';
import LoginModal from './LoginModal';
import { saveTempChat, migrateToUserChat } from '../services/chatService';
import { IoEnterOutline } from 'react-icons/io5';

interface ChatInterfaceProps {
    isLoggedIn: boolean;
    onLogin: (userId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isLoggedIn, onLogin }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatCount, setChatCount] = useState<number>(0);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [forceLogin, setForceLogin] = useState<boolean>(false);
    const sessionId = useRef(uuidv4());
    const messageListRef = useRef<HTMLDivElement>(null);

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
        const initialMessage: Message = {
            id: 1,
            text: "안녕하세요! 저는 당신의 이력서 작성을 도와드릴 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?",
            sender: 'RESUMER',
            timestamp: new Date()
        };
        setMessages([initialMessage]);
    }, []);

    // 메시지가 변경될 때마다 임시 저장
    useEffect(() => {
        if (messages.length > 0) {
            saveTempChat(sessionId.current, messages);
        }
    }, [messages]);

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
            setMessages(prev => [...prev, computerResponse]);
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

    const handleLoginSuccess = async (userId: string) => {
        await migrateToUserChat(sessionId.current, userId);
        onLogin(userId);
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
                sessionId={sessionId.current}
            />
        </ChatContainer>
    );
};

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    min-height: 100vh;
`;

const MainContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    height: calc(100vh - 120px);
`;

const Header = styled.header`
    padding: 40px 0;
    text-align: center;
    width: 100%;
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
    left: 55%;
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
    
    & > form {
        width: 100%;
        max-width: 760px;
        padding: 0 20px;
    }
`;

export default ChatInterface;
