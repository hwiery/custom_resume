import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars } from 'react-icons/fa';

interface HeaderProps {
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    return (
        <header className="app-header">
            <div className="header-left">
                <button className="menu-button mobile-only" onClick={onToggleSidebar}>
                    <FaBars />
                </button>
            </div>
        </header>
    );
};

export default Header; 