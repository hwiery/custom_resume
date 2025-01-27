import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthenticatedRoutesProps {
    children: React.ReactNode;
}

const AuthenticatedRoutes: React.FC<AuthenticatedRoutesProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // 로그인 페이지에서 이미 로그인된 경우 메인으로 리디렉션
        if (isAuthenticated && location.pathname === '/login') {
            navigate('/');
        }
        // 로그인이 필요한 페이지에서 비로그인 상태인 경우에만 리디렉션
        else if (!isAuthenticated && location.pathname.startsWith('/chats/')) {
            navigate('/login', { state: { from: location } });
        }
    }, [isAuthenticated, location.pathname, navigate]);

    return <>{children}</>;
};

export default AuthenticatedRoutes; 