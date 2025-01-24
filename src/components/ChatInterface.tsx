import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { Message } from '../types/message';
import { getChatResponse } from '../api/deepseek';

interface ChatInterfaceProps {
    onMessageSend: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onMessageSend }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 자동 스크롤 기능
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 초기 메시지 설정
    useEffect(() => {
        const initialMessage: Message = {
            id: 1,
            text: "안녕하세요! 저는 당신의 이력서 작성을 도와드릴 AI 어시스턴트입니다. 어떤 도움이 필요하신가요?",
            sender: 'computer',
            timestamp: new Date()
        };
        setMessages([initialMessage]);
    }, []);

    const handleSendMessage = async (text: string) => {
        onMessageSend(); // 메시지 전송 시 콜백 호출
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
                sender: 'computer',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, computerResponse]);
        } catch (error) {
            console.error('Error getting response:', error);
            const errorMessage: Message = {
                id: messages.length + 2,
                text: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                sender: 'computer',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-interface">
            <header className="chat-header">
                <h1>이력서 작성 도우미</h1>
                <p className="subtitle">AI와 함께 나만의 이력서를 만들어보세요</p>
            </header>
            <MessageList messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
            <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default ChatInterface;
