import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import AppContent from './components/AppContent';
import GoogleCallback from './components/GoogleCallback';
import './styles/chat.css';
import './styles/sidebar.css';

const App: React.FC = () => {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<AppContent />} />
                        <Route path="/oauth2/redirect/google" element={<GoogleCallback />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
};

export default App;