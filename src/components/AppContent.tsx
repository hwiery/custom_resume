import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatInterface from './ChatInterface';
import LoginModal from './LoginModal';
import Sidebar from './Sidebar';

const AppContent: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const messageCount = useRef(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMessageSend = () => {
        messageCount.current += 1;
        if (messageCount.current >= 3 && !isAuthenticated) {
            setShowLoginModal(true);
        }
    };

    return (
        <div className="app">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <ChatInterface 
                    isLoggedIn={isLoggedIn} 
                    onLogin={() => {
                        setIsLoggedIn(true);
                        setShowLoginModal(false);
                    }} 
                />
                <LoginModal 
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={() => {
                        setIsLoggedIn(true);
                        setShowLoginModal(false);
                    }}
                />
            </div>
        </div>
    );
};

export default AppContent; 