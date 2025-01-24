import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    isAuthenticated: boolean;
    login: (credentialResponse: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (credentialResponse: any) => {
        try {
            const token = credentialResponse.credential;
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            
            // MongoDB에 사용자 정보 저장 또는 업데이트
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: decodedToken.email,
                    name: decodedToken.name,
                    picture: decodedToken.picture,
                    googleId: decodedToken.sub
                })
            });

            const userData = await response.json();
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        try {
            // 상태 초기화
            setUser(null);
            setIsAuthenticated(false);

            // 로컬 스토리지의 모든 데이터 제거
            localStorage.clear();
            sessionStorage.clear();

            // 페이지 새로고침하여 초기 상태로 복귀
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // 에러가 발생하더라도 페이지 새로고침
            window.location.href = '/';
        }
    };

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
                
                if (storedUser && storedIsAuthenticated === 'true') {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
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