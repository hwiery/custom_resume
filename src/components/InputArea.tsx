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
    padding: 20px;
    background-color: white;
    border-top: 1px solid #e5e7eb;
`;

const Form = styled.form`
    display: flex;
    gap: 10px;
    max-width: 800px;
    margin: 0 auto;
`;

const Input = styled.input`
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: #0A66C2;
    }
`;

const Button = styled.button`
    padding: 12px 24px;
    background-color: #0A66C2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #004182;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const InputArea: React.FC<InputAreaProps> = ({ onSubmit }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input.trim());
            setInput('');
        }
    };

    return (
        <InputContainer>
            <Form onSubmit={handleSubmit}>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="이력서에 대해 자유롭게 이야기해주세요..."
                />
                <Button type="submit" disabled={!input.trim()}>
                    전송 <IoEnterOutline />
                </Button>
            </Form>
        </InputContainer>
    );
};

export default InputArea; 