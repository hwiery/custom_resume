import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                try {
                    const response = await fetch('/api/auth/google/callback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to exchange code');
                    }

                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    
                    // 이전 페이지로 돌아가기
                    navigate(-1);
                } catch (error) {
                    console.error('Error during callback:', error);
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            <p>로그인 처리 중...</p>
        </div>
    );
};

export default GoogleCallback; 