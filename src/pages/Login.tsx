import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const Login: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Resumer</h1>
                <p>AI와 함께 이력서를 작성해보세요</p>
                <div className="login-button">
                    <GoogleLogin
                        onSuccess={login}
                        onError={() => {
                            console.error('로그인 실패');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login; 