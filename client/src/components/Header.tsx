import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, user, logout, forceLogout } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        try {
            setIsLoggingOut(true);
            // 일반 로그아웃 시도
            await logout();
        } catch (error) {
            console.error('일반 로그아웃 실패:', error);
            // 일반 로그아웃 실패 시 강제 로그아웃 시도
            console.log('강제 로그아웃 시도...');
            forceLogout();
        }
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    <a href="/" className="hover:text-gray-700">
                        Chat App
                    </a>
                </h1>
                <nav className="flex items-center space-x-4">
                    {isAuthenticated && user ? (
                        <>
                            <div className="flex items-center space-x-2">
                                <img
                                    src={user.picture || '/default-avatar.png'}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-gray-700">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`${
                                    isLoggingOut 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-red-500 hover:bg-red-600'
                                } text-white px-4 py-2 rounded-md transition-colors`}
                            >
                                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                            </button>
                        </>
                    ) : (
                        <a
                            href="/login"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            로그인
                        </a>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header; 