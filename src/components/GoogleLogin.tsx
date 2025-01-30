import React from 'react';
import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface GoogleLoginProps {
    onSuccess: (userData: any) => void;
    onError: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
    const handleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse?.credential) {
                console.error('No credential received from Google');
                onError();
                return;
            }

            const response = await axios.post('/api/auth/google', {
                credential: credentialResponse.credential
            });

            if (response.data.success) {
                console.log('Server authentication successful:', response.data);
                onSuccess(response.data.data);
            } else {
                console.error('Server authentication failed:', response.data.error);
                onError();
            }
        } catch (error) {
            console.error('Google login failed:', error);
            onError();
        }
    };

    const handleError = () => {
        console.error('Google login error occurred');
        onError();
    };

    return (
        <div className="google-login-container">
            <GoogleOAuthLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                auto_select={false}
                context="signin"
                type="standard"
                theme="outline"
                size="large"
                width="300"
            />
        </div>
    );
};

export default GoogleLogin; 