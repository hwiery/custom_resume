import React from 'react';
import { GoogleLogin as GoogleOAuthLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginProps {
    onSuccess: (userData: any) => void;
    onError: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
    const handleSuccess = (credentialResponse: any) => {
        const decoded = jwtDecode(credentialResponse.credential);
        onSuccess(decoded);
    };

    return (
        <div className="google-login-container">
            <GoogleOAuthLogin
                onSuccess={handleSuccess}
                onError={onError}
                useOneTap
            />
        </div>
    );
};

export default GoogleLogin; 