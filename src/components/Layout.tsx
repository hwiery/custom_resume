import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    onSelectChat: (chatId: string) => void;
    activeChatId: string;
}

const Layout: React.FC<LayoutProps> = ({ children, isOpen, onToggle, onSelectChat, activeChatId }) => {
    return (
        <div className="app-container">
            <Sidebar 
                isOpen={isOpen} 
                onToggle={onToggle}
                onSelectChat={onSelectChat}
                activeChatId={activeChatId}
            />
            <main className={`main-content ${isOpen ? 'sidebar-open' : ''}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;

