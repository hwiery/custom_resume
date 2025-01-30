import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    email: string;
    name: string;
    picture: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    forceLogout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    login: () => {},
    logout: () => {},
    forceLogout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const clearAuthState = useCallback(() => {
        console.log('Clearing auth state...');
        // 로컬 스토리지 전체 초기화
        localStorage.clear();
        // 세션 스토리지 초기화
        sessionStorage.clear();
        // axios 설정 초기화
        delete axios.defaults.headers.common['Authorization'];
        // 상태 초기화
        setIsAuthenticated(false);
        setUser(null);
        // 쿠키 제거
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
    }, []);

    const checkAuthStatus = useCallback(async () => {
        console.log('Checking auth status...');
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('No token found, clearing auth state');
            clearAuthState();
            return false;
        }

        console.log('Token found, verifying with server...');
        try {
            const response = await axios.get('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success && response.data.data.user) {
                console.log('Server verification successful, setting auth state');
                setUser(response.data.data.user);
                setIsAuthenticated(true);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                return true;
            } else {
                console.log('Server verification failed, clearing auth state');
                clearAuthState();
                return false;
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            clearAuthState();
            return false;
        }
    }, [clearAuthState]);

    useEffect(() => {
        const initializeAuth = async () => {
            console.log('Initializing auth...');
            setLoading(true);
            try {
                await checkAuthStatus();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [checkAuthStatus]);

    const login = useCallback((token: string, userData: User) => {
        console.log('Logging in...');
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        console.log('Logging out...');
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('/api/auth/logout', null, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            clearAuthState();
            // 강제로 페이지 새로고침
            window.location.reload();
        }
    }, [clearAuthState]);

    // 강제 로그아웃 (서버 요청 없이)
    const forceLogout = useCallback(() => {
        console.log('Force logging out...');
        clearAuthState();
        window.location.reload();
    }, [clearAuthState]);

    // 디버깅을 위한 상태 로깅
    useEffect(() => {
        console.log('Auth state changed:', {
            isAuthenticated,
            hasUser: !!user,
            hasToken: !!localStorage.getItem('token'),
            loading
        });
    }, [isAuthenticated, user, loading]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            login,
            logout,
            forceLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 