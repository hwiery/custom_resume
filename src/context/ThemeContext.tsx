import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    systemPreference: ThemeMode;
    useSystemTheme: boolean;
    setUseSystemTheme: (use: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState<ThemeMode>('light');
    const [useSystemTheme, setUseSystemTheme] = useState(true);
    const [systemPreference, setSystemPreference] = useState<ThemeMode>('light');

    // 시스템 테마 감지
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
            setSystemPreference(e.matches ? 'dark' : 'light');
        };

        updateSystemTheme(mediaQuery);
        mediaQuery.addEventListener('change', updateSystemTheme);

        return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    }, []);

    // 사용자 설정 불러오기
    useEffect(() => {
        if (user?.email) {
            const savedTheme = localStorage.getItem(`theme_${user.email}`);
            const savedUseSystem = localStorage.getItem(`useSystemTheme_${user.email}`);
            
            if (savedTheme) {
                setTheme(savedTheme as ThemeMode);
            }
            if (savedUseSystem) {
                setUseSystemTheme(savedUseSystem === 'true');
            }
        }
    }, [user]);

    // 테마 변경 시 저장
    useEffect(() => {
        if (user?.email) {
            localStorage.setItem(`theme_${user.email}`, theme);
            localStorage.setItem(`useSystemTheme_${user.email}`, String(useSystemTheme));
        }
    }, [theme, useSystemTheme, user]);

    // 시스템 설정 사용 시 테마 자동 변경
    useEffect(() => {
        if (useSystemTheme) {
            setTheme(systemPreference);
        }
    }, [useSystemTheme, systemPreference]);

    return (
        <ThemeContext.Provider value={{ 
            theme: useSystemTheme ? systemPreference : theme, 
            setTheme, 
            systemPreference,
            useSystemTheme,
            setUseSystemTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 