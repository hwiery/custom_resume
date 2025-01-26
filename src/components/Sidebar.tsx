import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaPlus, FaCog, FaSignOutAlt, FaFileAlt, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import SettingsModal from './SettingsModal';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleNewChat = () => {
        console.log("New chat started");
    };

    const handleLogoutClick = () => {
        try {
            setShowUserMenu(false);
            if (isOpen) {
                onToggle();
            }
            logout();
        } catch (error) {
            console.error('로그아웃 처리 중 오류:', error);
        }
    };

    const handleGoogleSuccess = (credentialResponse: any) => {
        login(credentialResponse);
    };

    const handleSettingsClick = () => {
        setShowUserMenu(false);
        setShowSettingsModal(true);
    };

    return (
        <>
            <button className={`desktop-menu-button ${isOpen ? 'hidden' : ''}`} onClick={onToggle}>
                <FaBars />
            </button>
                    
            <button className={`mobile-menu-button ${isOpen ? 'hidden' : ''}`} onClick={onToggle}>
                <FaBars />
            </button>
                
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <style>
                    {`
                    .sidebar {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        background-color: #ffffff;
                        color: #333333;
                        width: 280px;
                        transition: all 0.3s ease;
                        border-right: 1px solid #e5e7eb;
                    }

                    .sidebar-content {
                        flex: 1;
                        overflow-y: auto;
                        padding: 1rem;
                    }
                    
                    .sidebar-links {
                        padding: 2rem 1rem 1rem;
                        border-top: 1px solid rgba(0, 0, 0, 0.1);
                        margin-top: 80px;
                    }
                    
                    .sidebar-link {
    display: flex;
    align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem;
                        color: #4b5563;
                        text-decoration: none;
                        transition: all 0.2s;
                        border-radius: 6px;
                    }
    
                    .sidebar-link:hover {
                        color: #1a1a1a;
                        background-color: rgba(0, 0, 0, 0.05);
    }

                    .sidebar-footer {
                        border-top: 1px solid rgba(0, 0, 0, 0.1);
                        padding: 1rem;
                    }

                    .user-profile {
    display: flex;
    align-items: center;
                        gap: 0.75rem;
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: 6px;
                        transition: background-color 0.2s;
                    }

                    .user-profile:hover {
                        background-color: rgba(0, 0, 0, 0.05);
                    }

                    .user-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                    }

                    .user-avatar-placeholder {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background-color: #0A66C2;
    display: flex;
    align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                    }

                    .user-info {
                        flex: 1;
                        min-width: 0;
                    }

                    .user-name {
                        font-weight: 600;
                        color: #1a1a1a;
                        margin: 0;
                    }

                    .user-email {
                        font-size: 0.875rem;
                        color: #4b5563;
                        margin: 0;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                    }

                    .user-menu {
                        position: absolute;
                        bottom: 100%;
                        left: 1rem;
                        right: 1rem;
                        background-color: #ffffff;
                        border-radius: 6px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        margin-bottom: 0.5rem;
                        border: 1px solid #e5e7eb;
                    }

                    .menu-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
    width: 100%;
                        padding: 0.75rem 1rem;
                        border: none;
                        background: none;
                        color: #4b5563;
    cursor: pointer;
                        transition: background-color 0.2s;
                    }
    
                    .menu-item:hover {
                        background-color: rgba(0, 0, 0, 0.05);
                        color: #1a1a1a;
    }
                    `}
                </style>
                <div className="sidebar-header">
                    <Logo />
                    <button className="toggle-button" onClick={onToggle}>
                        <FaBars />
                    </button>
                </div>

                {isAuthenticated ? (
                    <>
                        <div className="sidebar-content">
                            <button className="new-chat-button" onClick={handleNewChat}>
                                <FaPlus /> New Story
                            </button>
                        </div>

                        <div className="sidebar-links">
                            <Link to="/contact" className="sidebar-link">
                                <FaEnvelope /> Contact Us
                            </Link>
                            <Link to="/terms" className="sidebar-link">
                                <FaFileAlt /> Terms of Use
                            </Link>
                            <Link to="/privacy" className="sidebar-link">
                                <FaShieldAlt /> Privacy
                            </Link>
                        </div>
    
                        <div className="sidebar-footer">
                            <div 
                                className="user-profile" 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                {user?.picture ? (
                                    <img 
                                        src={user.picture} 
                                        alt={user.name} 
                                        className="user-avatar"
                                    />
                                ) : (
                                    <div className="user-avatar-placeholder">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="user-info">
                                    <p className="user-name">{user?.name || '사용자'}</p>
                                    {user?.email && <p className="user-email">{user.email}</p>}
                                </div>
                            </div>
                            {showUserMenu && (
                                <div className="user-menu">
                                    <button className="menu-item" onClick={handleSettingsClick}>
                                        <FaCog /> Settings
                                    </button>
                                    <button className="menu-item" onClick={handleLogoutClick}>
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="login-container">
                            <div className="login-content">
                                <p className="login-message">이력서 작성을 시작하려면<br />로그인이 필요합니다</p>
                                <div className="google-login-button">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            console.log('Login Failed');
                                        }}
                                        useOneTap
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="sidebar-links" style={{ marginTop: 'auto' }}>
                            <Link to="/contact" className="sidebar-link">
                                <FaEnvelope /> Contact Us
                            </Link>
                            <Link to="/terms" className="sidebar-link">
                                <FaFileAlt /> Terms of Use
                            </Link>
                            <Link to="/privacy" className="sidebar-link">
                                <FaShieldAlt /> Privacy
                            </Link>
                        </div>
                    </>
                )}
            </div>
            <SettingsModal 
                isOpen={showSettingsModal} 
                onClose={() => setShowSettingsModal(false)} 
            />
        </>
    );
};

export default Sidebar;