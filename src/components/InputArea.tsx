import React, { useState } from 'react';
import styled from 'styled-components';
import { IoEnterOutline } from 'react-icons/io5';

interface InputAreaProps {
    onSubmit: (input: string) => void;
}

const InputContainer = styled.div`
    position: fixed;
    bottom: 0;
    left: 280px;
    right: 0;
    padding: 20px 40px;
    background-color: white;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
`;

const Form = styled.form`
    display: flex;
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 60px;
    max-height: 200px;
    padding: 16px 50px 16px 16px;
    background-color: #FFFFF0;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    line-height: 1.5;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    overflow-y: auto;

    &:focus {
        border-color: #0A66C2;
    }
`;

const Button = styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #0A66C2;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(10, 102, 194, 0.1);
    }

    &:disabled {
        color: #ccc;
        cursor: not-allowed;
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
                textarea.style.height = '60px';
            }
        }
    };

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = '60px';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
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
                    rows={1}
                />
                <Button type="submit" disabled={!input.trim()}>
                    <IoEnterOutline />
                </Button>
            </Form>
        </InputContainer>
    );
};

export default InputArea; 