import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface GoogleTokenPayload {
    email: string;
    name: string;
    picture: string;
    sub: string;
    iat: number;
    exp: number;
}

interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    login: (credentialResponse: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// axios 인스턴스 생성
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (credentialResponse: any) => {
        try {
            if (!credentialResponse?.credential) {
                throw new Error('No credential provided');
            }

            // 구글 토큰 디코딩
            const token = credentialResponse.credential;
            const decodedToken = jwtDecode<GoogleTokenPayload>(token);
            
            console.log('Attempting to authenticate with token:', { email: decodedToken.email });
            
            try {
                // 백엔드 서버 상태 확인
                await api.get('/health');
            } catch (error) {
                console.error('Backend server health check failed:', error);
                throw new Error('Backend server is not available');
            }
            
            // 백엔드로 인증 요청
            const { data: userData } = await api.post('/auth/google', { 
                token,
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture
            });

            console.log('Authentication successful:', userData);
            
            if (!userData) {
                throw new Error('No user data received from server');
            }

            // 사용자 정보 설정
            const userInfo = {
                ...userData,
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture
            };

            setUser(userInfo);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userInfo));
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error: any) {
            console.error('Login failed:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Authentication failed'
            );
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('로그아웃 요청 실패:', error);
        } finally {
            // 로컬 상태 초기화
            setUser(null);
            setIsAuthenticated(false);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
                
                if (storedUser && storedIsAuthenticated === 'true') {
                    const { data: verifyData } = await api.get('/auth/verify');

                    if (verifyData) {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        throw new Error('Token validation failed');
                    }
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                logout();
            }
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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