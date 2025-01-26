import React, { useState } from 'react';
import { ResumeChatContainer } from '../styles/ResumeChatContainer';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';

const ResumeChat: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <ResumeChatContainer>
            <Sidebar 
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
            />
            <ChatInterface
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
            />
        </ResumeChatContainer>
    );
};

export default ResumeChat; 
