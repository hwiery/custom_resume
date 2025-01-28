import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    email: string;
    name: string;
    picture: string;
    googleId: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentialResponse: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (credentialResponse: any) => {
        try {
            console.log('로그인 시도:', credentialResponse);
            
            // 서버에 구글 인증 정보 전송
            const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    credential: credentialResponse.credential 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('서버 로그인 실패:', errorData);
                throw new Error(errorData.error || '로그인 실패');
            }

            const data = await response.json();
            console.log('서버 응답:', data);
            
            if (data.success && data.data.token) {
                // 토큰 저장
                localStorage.setItem('token', data.data.token);
                
                // 사용자 정보 저장
                const userData: User = {
                    email: data.data.user.email,
                    name: data.data.user.name,
                    picture: data.data.user.picture,
                    googleId: data.data.user.googleId
                };
                
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('isAuthenticated', 'true');
                
                console.log('로그인 성공:', {
                    user: userData,
                    isAuthenticated: true,
                    hasToken: true
                });
            }
        } catch (error) {
            console.error('로그인 실패:', error);
            // 에러 발생 시 상태 초기화
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            throw error;
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