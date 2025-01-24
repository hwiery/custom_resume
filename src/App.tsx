import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import AppContent from './components/AppContent';
import './styles/chat.css';
import './styles/sidebar.css';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </GoogleOAuthProvider>
        </BrowserRouter>
    );
};

export default App;