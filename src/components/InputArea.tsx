import React, { useState } from 'react';
import styled from 'styled-components';
import { IoEnterOutline } from 'react-icons/io5';

interface InputAreaProps {
    onSubmit: (input: string) => void;
}

const InputContainer = styled.div`
    width: 100%;
    height: auto;
    min-height: 72px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Form = styled.form`
    position: relative;
    width: 100%;
    height: auto;
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 72px; // 3줄 기본 높이
    max-height: 240px; // 10줄 최대 높이
    padding: 16px 50px 16px 16px;
    background-color: #FFFFF0;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    line-height: 1.5;
    resize: none;
    outline: none;
    transition: all 0.2s ease;
    overflow-y: auto;

    &:focus {
        border-color: #e5e7eb;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
`;

const Button = styled.button`
    position: absolute;
    right: 30px;
    top: 35%;
    background: none;
    border: none;
    
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 8px;
    padding-right: 20px;
    border-radius: 20%;
    transition: background-color 0.2s;

    &:hover {
        background-color: #FFFFF0;
    }

    &:disabled {
        color: #ccc;
        
    }

    svg {
        width: 24px;
        height: 24px;
    }
`;

const InputArea: React.FC<InputAreaProps> = ({ onSubmit }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input.trim());
            setInput('');
            // 입력창 높이 초기화
            const textarea = document.querySelector('textarea');
            if (textarea) {
                textarea.style.height = '72px';
            }
        }
    };

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = '72px';
        const newHeight = Math.min(e.target.scrollHeight, 240);
        e.target.style.height = `${newHeight}px`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
                handleSubmit(e as any);
            }
        }
    };

    return (
        <InputContainer>
            <Form onSubmit={handleSubmit}>
                <TextArea
                    value={input}
                    onChange={handleTextAreaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="이력서에 대해 자유롭게 이야기해주세요..."
                    rows={3}
                />
                <Button type="submit" disabled={!input.trim()}>
                    <IoEnterOutline />
                </Button>
            </Form>
        </InputContainer>
    );
};

export default InputArea; 