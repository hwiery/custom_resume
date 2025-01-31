import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppContent from './components/AppContent';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Layout from './components/Layout';
import Login from './pages/Login';
import './styles/chat.css';
import './styles/sidebar.css';
import ChatInterface from './components/ChatInterface';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? element : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" /> : element;
};

const App: React.FC = () => {
    const [selectedChatId, setSelectedChatId] = useState<string>('new');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleChatSelect = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error('Google OAuth 클라이언트 ID가 설정되지 않았습니다.');
        } else {
            console.log('Google OAuth 스크립트 로드 성공');
        }
    }, []);

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<PublicRoute element={<Login />} />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute
                                    element={
                                        <Layout
                                            isOpen={isSidebarOpen}
                                            onToggle={toggleSidebar}
                                            onSelectChat={handleChatSelect}
                                            activeChatId={selectedChatId}
                                        >
                                            <ChatInterface selectedChatId={selectedChatId} />
                                        </Layout>
                                    }
                                />
                            }
                        />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
};

export default App;