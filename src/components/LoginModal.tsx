import React from 'react';
import GoogleLogin from './GoogleLogin';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userData: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>로그인하고 더 많은 기능을 사용해보세요</h2>
                <p>맞춤형 이력서 작성을 위해 로그인이 필요합니다</p>
                <div className="modal-login-button">
                    <GoogleLogin 
                        onSuccess={onSuccess}
                        onError={() => {
                            console.error('로그인 실패');
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginModal; 