import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

const LoginPage: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
            return;
        }

        const handleCredentialResponse = async (response: any) => {
            try {
                console.log('Google 로그인 응답:', response);
                const res = await axios.post('/api/auth/google', {
                    credential: response.credential
                });

                if (res.data.success) {
                    const { token, user } = res.data.data;
                    login(token, user);
                    navigate('/');
                }
            } catch (error) {
                console.error('로그인 처리 중 오류:', error);
                alert('로그인에 실패했습니다.');
            }
        };

        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });

            window.google.accounts.id.renderButton(
                document.getElementById("googleLoginButton")!,
                { theme: "outline", size: "large" }
            );
        }
    }, [login, navigate, isAuthenticated]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        로그인
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Google 계정으로 로그인하세요
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <div className="flex justify-center">
                        <div id="googleLoginButton"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 