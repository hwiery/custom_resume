import React from 'react';
import styled from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    forceLogin?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
    isOpen, 
    onClose, 
    onSuccess, 
    forceLogin = false
}) => {
    const { login } = useAuth();
    
    if (!isOpen) return null;

    const handleClose = () => {
        if (!forceLogin) {
            onClose();
        }
    };

    const handleGoogleSuccess = (credentialResponse: any) => {
        login(credentialResponse);
        onSuccess();
        onClose();
    };

    return (
        <ModalOverlay onClick={handleClose}>
            <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <ModalHeader>
                    {!forceLogin && (
                        <CloseButton onClick={handleClose}>&times;</CloseButton>
                    )}
                </ModalHeader>
                <ModalBody>
                    <LoginMessage forceLogin={forceLogin}>
                        {forceLogin ? '계속하기 위해서는 로그인이 필요합니다.' : '서비스를 이용하시려면 로그인해주세요.'}
                    </LoginMessage>
                    <GoogleLoginWrapper>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.error('Login Failed');
                            }}
                            useOneTap
                            type="standard"
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="rectangular"
                            locale="ko"
                            context="signin"
                        />
                    </GoogleLoginWrapper>
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: 32px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    padding: 4px;
    line-height: 1;
    
    &:hover {
        color: #333;
    }
`;

const ModalBody = styled.div`
    text-align: center;
`;

const LoginMessage = styled.p<{ forceLogin: boolean }>`
    margin-bottom: 32px;
    color: #1E3A8A;
    font-family: 'Pretendard Medium', sans-serif;
    font-size: ${props => props.forceLogin ? '20px' : '16px'};
    line-height: 1.5;
    font-weight: 500;
`;

const GoogleLoginWrapper = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    
    & > div {
        width: 100% !important;
    }
`;

export default LoginModal; 