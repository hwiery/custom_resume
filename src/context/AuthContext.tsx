import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';

interface User {
    email: string;
    name: string;
    picture: string;
    googleId: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentialResponse: CredentialResponse) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleGoogleResponse = async (response: CredentialResponse) => {
        try {
            if (!response.credential) {
                console.error('인증 정보가 없습니다.');
                return;
            }

            console.log('로그인 시도:', response);
            const result = await axios.post(`${API_BASE_URL}/api/auth/google`, {
                credential: response.credential,
                guestChatHistory: localStorage.getItem('guestChatHistory')
            });
            
            console.log('서버 응답:', result.data);
            
            if (result.data.success) {
                localStorage.removeItem('guestToken');
                localStorage.removeItem('guestChatCount');
                localStorage.removeItem('guestChatHistory');

                localStorage.setItem('token', response.credential);
                setUser(result.data.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(result.data.data.user));
                localStorage.setItem('isAuthenticated', 'true');
                console.log('로그인 성공:', {
                    user: result.data.data.user,
                    isAuthenticated: true,
                    hasToken: true
                });
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
        const token = localStorage.getItem('token');
        
        if (storedUser && storedIsAuthenticated === 'true' && token) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
                console.log('저장된 로그인 정보 복원:', {
                    user: userData,
                    isAuthenticated: true,
                    hasToken: true
                });
            } catch (error) {
                console.error('저장된 사용자 정보 파싱 실패:', error);
                logout();
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login: handleGoogleResponse, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 