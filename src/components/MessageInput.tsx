import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { IoSend } from 'react-icons/io5';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <InputContainer 
            onSubmit={handleSubmit}
            role="form"
            aria-label="메시지 입력 폼"
        >
            <StyledTextarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                disabled={isLoading}
                rows={1}
                aria-label="메시지 입력창"
                aria-disabled={isLoading}
            />
            <SendButton 
                type="submit" 
                disabled={!message.trim() || isLoading}
                aria-label="메시지 보내기"
            >
                <IoSend size={20} aria-hidden="true" />
            </SendButton>
        </InputContainer>
    );
};

const InputContainer = styled.form`
    display: flex;
    align-items: flex-end;
    gap: 8px;
    width: 100%;
    padding: 16px;
    background: white;
    border-top: 1px solid #eee;

    @media (max-width: 768px) {
        padding: 12px;
        gap: 6px;
    }
`;

const StyledTextarea = styled.textarea`
    flex: 1;
    min-height: 24px;
    max-height: 120px;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 24px;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    outline: none;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
    }

    &:disabled {
        background-color: #f8f9fa;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        padding: 10px 14px;
        font-size: 13px;
        min-height: 20px;
        max-height: 100px;
    }
`;

const SendButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background-color: #1a73e8;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        background-color: #1557b0;
        transform: scale(1.05);
    }

    &:disabled {
        background-color: #ddd;
        cursor: not-allowed;
    }

    @media (max-width: 768px) {
        width: 36px;
        height: 36px;
    }

    &:focus-visible {
        outline: 2px solid #1a73e8;
        outline-offset: 2px;
    }
`;

export default MessageInput;
