import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatHistoryItem {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatHistoryProps {
    onSelectChat: (chatId: string) => void;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelectChat }) => {
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            loadChatHistory();
        }
    }, [isAuthenticated]);

    const loadChatHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('채팅 히스토리를 불러오는데 실패했습니다.');
            }

            const data = await response.json();
                setChatHistory(data.data);
        } catch (error) {
            console.error('채팅 히스토리 로드 오류:', error);
            setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    };

    if (!isAuthenticated) {
        return (
            <Container>
                <EmptyMessage>로그인하여 채팅 기록을 확인하세요.</EmptyMessage>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container>
                <LoadingMessage>채팅 기록을 불러오는 중...</LoadingMessage>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <ErrorMessage>{error}</ErrorMessage>
            </Container>
        );
    }

    return (
        <Container>
            <Title>채팅 기록</Title>
            {chatHistory.length === 0 ? (
                <EmptyMessage>아직 채팅 기록이 없습니다.</EmptyMessage>
            ) : (
        <HistoryList>
            {chatHistory.map((chat) => (
                <HistoryItem
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                >
                            <ChatTitle>{chat.title}</ChatTitle>
                    <ChatDate>{formatDate(chat.updatedAt)}</ChatDate>
                </HistoryItem>
            ))}
        </HistoryList>
            )}
        </Container>
    );
};

const Container = styled.div`
    padding: 20px;
    height: 100%;
    overflow-y: auto;
`;

const Title = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #333;
`;

const HistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const HistoryItem = styled.div`
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: #e9ecef;
        transform: translateY(-2px);
    }
`;

const ChatTitle = styled.h3`
    font-size: 1rem;
    margin: 0 0 5px 0;
    color: #1a1a1a;
`;

const ChatDate = styled.p`
    font-size: 0.8rem;
    color: #666;
    margin: 0;
`;

const EmptyMessage = styled.p`
    text-align: center;
    color: #666;
    margin-top: 20px;
`;

const LoadingMessage = styled(EmptyMessage)`
    color: #007bff;
`;

const ErrorMessage = styled(EmptyMessage)`
    color: #dc3545;
`;

export default ChatHistory; 