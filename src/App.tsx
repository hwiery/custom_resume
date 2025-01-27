import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes';
import './styles/chat.css';
import './styles/sidebar.css';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ErrorProvider>
                <AuthProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </AuthProvider>
            </ErrorProvider>
        </ErrorBoundary>
    );
};

export default App;