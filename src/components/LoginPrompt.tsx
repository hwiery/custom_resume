import React from 'react';
import styled from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const LoginPrompt: React.FC = () => {
    const { login } = useAuth();

    return (
        <Container>
            <Title>RESUMER에 오신 것을 환영합니다</Title>
            <Description>
                계속하려면 로그인해주세요.
            </Description>
            <LoginContainer>
                <GoogleLogin
                    onSuccess={login}
                    onError={() => console.error('로그인 실패')}
                />
            </LoginContainer>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
`;

const Description = styled.p`
    color: #666;
    margin-bottom: 30px;
    text-align: center;
`;

const LoginContainer = styled.div`
    margin-top: 20px;
`;

export default LoginPrompt;
