import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    email: string;
    name: string;
    picture: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

export interface GoogleCredentialResponse {
    credential: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (credentialResponse: GoogleCredentialResponse) => Promise<void>;
    logout: () => Promise<void>;
    forceLogout: () => void;
    loading: boolean;
    token: string | null;
    resetAuthState: () => void;
    verifyAuth: () => Promise<void>;
}

const initialAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null
};

const AuthContext = createContext<AuthContextType>({
    ...initialAuthState,
    loading: true,
    token: null,
    login: async () => {},
    logout: async () => {},
    forceLogout: () => {},
    resetAuthState: () => {},
    verifyAuth: async () => {}
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const clearAllStorage = () => {
    try {
        // 로컬 스토리지 초기화
        localStorage.clear();
        // 세션 스토리지 초기화
        sessionStorage.clear();
        
        // 구글 관련 쿠키 제거
        const googleCookies = [
            'ACCOUNT_CHOOSER', 'AEC', 'APISID', 'HSID', 'LSID', 'NID', 'OTZ',
            'SAPISID', 'SID', 'SIDCC', 'SSID', '__Host-1PLSID', '__Host-3PLSID',
            '__Host-GAPS', '__Secure-1PAPISID', '__Secure-1PSID', '__Secure-1PSIDCC',
            '__Secure-3PAPISID', '__Secure-3PSID', '__Secure-3PSIDCC'
        ];

        // 모든 쿠키 제거
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const cookieName = cookie.split('=')[0].trim();
            // .google.com 도메인 쿠키 제거
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.google.com; path=/`;
            // accounts.google.com 도메인 쿠키 제거
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=accounts.google.com; path=/`;
            // 현재 도메인 쿠키 제거
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }

        // 특정 구글 쿠키 제거
        googleCookies.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.google.com; path=/`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=accounts.google.com; path=/`;
        });

        console.log('모든 스토리지와 쿠키가 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('스토리지/쿠키 초기화 중 오류 발생:', error);
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    const resetAuthState = () => {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
        localStorage.clear();
    };

    const verifyAuth = async () => {
        try {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                resetAuthState();
                return;
            }
            // 토큰 검증 로직 추가
            setToken(storedToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth verification failed:', error);
            resetAuthState();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentialResponse: GoogleCredentialResponse) => {
        try {
            const response = await axios.post('/api/auth/google', {
                credential: credentialResponse.credential
            });

            if (response.data.success) {
                const { token, user: userData } = response.data.data;
                localStorage.setItem('token', token);
                setUser(userData);
                setIsAuthenticated(true);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                throw new Error('로그인 실패');
            }
        } catch (error) {
            console.error('로그인 처리 중 오류:', error);
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('token');
            throw error;
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post('/api/auth/logout');
            }
        } catch (error) {
            console.error('로그아웃 처리 중 오류:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            window.google?.accounts?.id?.revoke(() => {
                console.log('Google 계정 연결 해제 완료');
            });
        }
    };

    const forceLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    // 컴포넌트 마운트 시 토큰 확인
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/api/auth/me')
                .then(response => {
                    if (response.data.success) {
                        setUser(response.data.data);
                        setIsAuthenticated(true);
                    } else {
                        forceLogout();
                    }
                })
                .catch(() => {
                    forceLogout();
                });
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            login,
            logout,
            forceLogout,
            loading,
            token,
            resetAuthState,
            verifyAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 