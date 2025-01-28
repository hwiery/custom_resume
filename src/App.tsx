import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import AppContent from './components/AppContent';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Layout from './components/Layout';
import './styles/chat.css';
import './styles/sidebar.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
    console.error('GOOGLE_CLIENT_ID가 설정되지 않았습니다.');
}

const App: React.FC = () => {
    return (
        <GoogleOAuthProvider 
            clientId={GOOGLE_CLIENT_ID}
            onScriptLoadError={() => console.error('Google OAuth 스크립트 로드 실패')}
            onScriptLoadSuccess={() => console.log('Google OAuth 스크립트 로드 성공')}
        >
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<AppContent />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
};

export default App;