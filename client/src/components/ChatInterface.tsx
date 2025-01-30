import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ChatInterface: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [loginStatus, setLoginStatus] = useState({
        isLoggedIn: false,
        hasToken: false,
        tokenPreview: 'none'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const checkLoginStatus = () => {
            setLoginStatus({
                isLoggedIn: isAuthenticated,
                hasToken: !!token,
                tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
            });
        };

        checkLoginStatus();
        
        // AuthContext의 상태가 변경될 때마다 로그인 상태 업데이트
        const interval = setInterval(checkLoginStatus, 1000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // 디버깅을 위한 상태 출력
    useEffect(() => {
        console.log('로그인 상태 확인:', loginStatus);
        console.log('AuthContext 상태:', {
            isAuthenticated,
            hasUser: !!user,
            userData: user
        });
    }, [loginStatus, isAuthenticated, user]);

    return (
        <div>
            {/* 채팅 인터페이스 UI */}
        </div>
    );
};

export default ChatInterface; 