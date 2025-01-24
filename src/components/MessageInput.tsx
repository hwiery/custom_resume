import React, { useState, KeyboardEvent, useRef } from 'react';
import styled from 'styled-components';
import { IoEnterOutline } from 'react-icons/io5';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 300); // 최대 300px (약 10줄)
            textarea.style.height = `${newHeight}px`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        adjustHeight();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = '80px';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    return (
        <InputForm onSubmit={handleSubmit}>
            <InputField
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요... (Ctrl/Cmd + Enter로 전송)"
                disabled={isLoading}
            />
            <SendButton type="submit" disabled={isLoading || !message.trim()}>
                <IoEnterOutline size={32} />
            </SendButton>
        </InputForm>
    );
};

const InputForm = styled.form`
    display: flex;
    align-items: right;
    position: relative;
    width: 100%;
    margin: 0 auto;
`;

const InputField = styled.textarea`
    width: 100%;
    min-height: 80px;
    max-height: 300px;
    padding: 16px 70px 16px 20px;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    font-size: 16px;
    line-height: 1.5;
    resize: none;
    background-color: #FDFAF6;
    font-family: 'Pretendard Regular', sans-serif;
    overflow-y: auto;
    transition: height 0.2s ease;
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #F5F1E6;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #E8E1D1;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #E8E1D1;
    }
    
    &:focus {
        outline: none;
        border-color: #E5E7EB;
        box-shadow: none;
    }
    
    &:disabled {
        background-color: #F3F4F6;
        cursor: not-allowed;
    }
`;

const SendButton = styled.button`
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #0A66C2;
    cursor: pointer;
    padding: 12px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        background: none;
        color: #0A66C2;
    }
    
    &:disabled {
        color: #9CA3AF;
        cursor: not-allowed;
    }
`;

export default MessageInput;
