import React from 'react';
import { GoogleLogin as GoogleLoginButton } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

interface GoogleLoginProps {
    onSuccess?: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess }) => {
    const { login } = useAuth();

    const handleSuccess = (credentialResponse: any) => {
        login(credentialResponse);
        if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <LoginContainer>
            <GoogleLoginButton
                onSuccess={handleSuccess}
                onError={() => {
                    console.log('Login Failed');
                }}
                useOneTap
                auto_select
            />
        </LoginContainer>
    );
};

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

export default GoogleLogin; 