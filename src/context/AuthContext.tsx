import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    email: string;
    name: string;
    picture: string;
    googleId: string;
    displayName?: string;
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentialResponse: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = (credentialResponse: any) => {
        try {
            const token = credentialResponse.credential;
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            
            const userData: User = {
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture,
                googleId: decodedToken.sub,
                displayName: decodedToken.name,
                photoURL: decodedToken.picture
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', token);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authToken');
        window.location.href = '/';
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
        const authToken = localStorage.getItem('authToken');
        
        if (storedUser && storedIsAuthenticated === 'true' && authToken) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to restore user session:', error);
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