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

    const login = (credentialResponse: any) => {
        try {
            const token = credentialResponse.credential;
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            
            const userData = {
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture,
                googleId: decodedToken.sub
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.clear();
        window.location.href = '/';
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (storedUser && storedIsAuthenticated === 'true') {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
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