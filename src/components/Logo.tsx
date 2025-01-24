import React from 'react';
import LogoImage from '../assets/Logo.svg';

const Logo: React.FC = () => {
    const handleLogoClick = () => {
        window.location.href = '/';
    };

    return (
        <div className="logo-container" onClick={handleLogoClick}>
            <img src={LogoImage} alt="Resumer Logo" className="logo" />
            <h1 className="service-title">Resumer</h1>
        </div>
    );
};

export default Logo; 