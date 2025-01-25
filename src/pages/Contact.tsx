import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 20px;
`;

const Title = styled.h1`
    font-size: 24px;
    margin-bottom: 20px;
    color: #343a40;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 16px;
    color: #495057;
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;

    &:focus {
        outline: none;
        border-color: #4dabf7;
    }
`;

const TextArea = styled.textarea`
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 16px;
    min-height: 150px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #4dabf7;
    }
`;

const SubmitButton = styled.button`
    padding: 12px 24px;
    background-color: #4dabf7;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #339af0;
    }

    &:disabled {
        background-color: #adb5bd;
        cursor: not-allowed;
    }
`;

const Message = styled.div<{ $isError?: boolean }>`
    padding: 10px;
    border-radius: 4px;
    background-color: ${props => props.$isError ? '#ffe3e3' : '#d3f9d8'};
    color: ${props => props.$isError ? '#e03131' : '#2b8a3e'};
    margin-top: 20px;
`;

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('문의 전송에 실패했습니다.');
            }

            setStatus({
                type: 'success',
                message: '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변 드리겠습니다.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus({
                type: 'error',
                message: '문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Container>
            <Title>문의하기</Title>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="name">이름</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="subject">제목</Label>
                    <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="message">문의내용</Label>
                    <TextArea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <SubmitButton type="submit">
                    문의하기
                </SubmitButton>
            </Form>

            {status.type && (
                <Message $isError={status.type === 'error'}>
                    {status.message}
                </Message>
            )}
        </Container>
    );
};

export default Contact; 