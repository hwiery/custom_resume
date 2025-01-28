import React from 'react';
import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginProps {
    onSuccess: (userData: any) => void;
    onError: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
    const handleSuccess = (credentialResponse: any) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            onSuccess(decoded);
        } catch (error) {
            console.error('Failed to decode token:', error);
            onError();
        }
    };

    return (
        <div className="google-login-container">
            <GoogleOAuthLogin
                onSuccess={handleSuccess}
                onError={onError}
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