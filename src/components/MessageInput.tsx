import React, { useState } from 'react';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="메시지를 입력하세요..."
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
                {isLoading ? '처리중...' : '전송'}
            </button>
        </form>
    );
};

export default MessageInput;
