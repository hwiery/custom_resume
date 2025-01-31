import React, { useRef, useState, useEffect } from 'react';
import { Message } from '../types/message';
import { getChatResponse } from '../api/deepseek';
import MessageList from './MessageList';
import InputArea from './InputArea';
import chatService from '../services/chatService';

interface ResumeChatProps {
    onMessageUpdate?: (messages: Message[]) => void;
    selectedChatId?: string;
}

export const ResumeChat: React.FC<ResumeChatProps> = ({ onMessageUpdate, selectedChatId = 'new' }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const initialMessages = chatService.loadTempChat(selectedChatId);
        setMessages(initialMessages);
        onMessageUpdate?.(initialMessages);
    }, [selectedChatId]);

    const handleUserInput = async (input: string) => {
        if (!input.trim() || isProcessing) return;
        
        setIsProcessing(true);
        try {
            const userMessage: Message = {
                role: 'user',
                content: input,
                timestamp: new Date()
            };
            
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);
            chatService.saveTempChat(selectedChatId, newMessages);
            onMessageUpdate?.(newMessages);

            const response = await getChatResponse(newMessages);
            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            
            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
            chatService.saveTempChat(selectedChatId, updatedMessages);
            onMessageUpdate?.(updatedMessages);
        } catch (error) {
            console.error('Error processing chat:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            <MessageList messages={messages} isLoading={isProcessing} />
            <InputArea onSubmit={handleUserInput} />
        </div>
    );
};
