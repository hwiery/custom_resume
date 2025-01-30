import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatInterface from './ChatInterface';
import Sidebar from './Sidebar';

const AppContent: React.FC = () => {
    const { isAuthenticated, login } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedChatId, setSelectedChatId] = useState<string>('new');

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleChatSelect = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const handleLoginSuccess = async (credentialResponse?: any) => {
        if (credentialResponse) {
            await login(credentialResponse);
        }
    };

    return (
        <div className="app-container">
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={handleSidebarToggle}
                onChatSelect={handleChatSelect}
            />
            <ChatInterface
                isLoggedIn={isAuthenticated}
                onLogin={handleLoginSuccess}
                selectedChatId={selectedChatId}
            />
            <style>
                {`
                .app-container {
                    display: flex;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                }
                `}
            </style>
        </div>
    );
};

export default AppContent; 