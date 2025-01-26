import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const credential = params.get('credential');
      
      if (credential) {
        try {
          await login({ credential });
          navigate('/');
        } catch (error) {
          console.error('Google callback error:', error);
          navigate('/login?error=auth_failed');
        }
      } else {
        navigate('/login?error=no_credential');
      }
    };

    handleCallback();
  }, [location, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">인증 처리 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}; 
