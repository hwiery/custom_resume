import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            await login(credentialResponse);
            navigate('/');
        } catch (error) {
            console.error('로그인 실패:', error);
        }
    };

    return (
        <LoginContainer>
            <LoginBox>
                <Title>RESUMER</Title>
                <Subtitle>AI와 함께 이력서를 작성해보세요</Subtitle>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => {
                        console.error('로그인 실패');
                    }}
                    useOneTap
                    auto_select
                    theme="outline"
                    size="large"
                    width="300"
                    locale="ko"
                />
            </LoginBox>
        </LoginContainer>
    );
};

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8fafc;
`;

const LoginBox = styled.div`
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    text-align: center;
`;

const Title = styled.h1`
    font-family: 'Pretendard Bold', sans-serif;
    font-size: 32px;
    color: #1e3a8a;
    margin-bottom: 16px;
`;

const Subtitle = styled.p`
    font-family: 'Pretendard Regular', sans-serif;
    font-size: 16px;
    color: #64748b;
    margin-bottom: 32px;
`;

export default Login; 