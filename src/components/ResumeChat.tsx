import React, { useRef, useState } from 'react';
import { Message } from '../types/message';
import { getChatResponse } from '../api/deepseek';
import MessageList from './MessageList';
import InputArea from './InputArea';

interface ResumeChatProps {
    onMessageUpdate?: (messages: Message[]) => void;
}

export const ResumeChat: React.FC<ResumeChatProps> = ({ onMessageUpdate }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUserInput = async (input: string) => {
        if (!input.trim() || isProcessing) return;
        
        setIsProcessing(true);
        try {
            const userMessage: Message = {
                id: Date.now(),
                text: input,
                sender: 'user',
                timestamp: new Date()
            };
            
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);
            onMessageUpdate?.(newMessages);

            const response = await getChatResponse(newMessages);
            const assistantMessage: Message = {
                id: Date.now(),
                text: response,
                sender: 'RESUMER',
                timestamp: new Date()
            };
            
            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
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
