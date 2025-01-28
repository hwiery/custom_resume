import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatInterface from './ChatInterface';
import LoginModal from './LoginModal';

const AppContent: React.FC = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { isAuthenticated } = useAuth();
    const messageCount = useRef(0);

    return (
        <div className="main-content">
            <ChatInterface 
                isLoggedIn={isAuthenticated} 
                onLogin={() => {
                    setShowLoginModal(false);
                }} 
            />
            <LoginModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    setShowLoginModal(false);
                }}
                forceLogin={false}
            />
        </div>
    );
};

export default AppContent; 