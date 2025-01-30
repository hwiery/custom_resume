import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaPlus, FaCog, FaSignOutAlt, FaFileAlt, FaShieldAlt, FaEnvelope, FaHistory } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { AxiosError } from 'axios';
import Logo from './Logo';
import SettingsModal from './SettingsModal';

interface ChatHistory {
    _id: string;
    title: string;
    lastMessage: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onChatSelect?: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onChatSelect }) => {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchChatHistories();
        }
    }, [isAuthenticated]);

    const fetchChatHistories = async () => {
        try {
            const response = await axiosInstance.get('/api/chat/history');
            console.log('채팅 히스토리 조회 응답:', response.data);
            if (response.data.success) {
                setChatHistories(response.data.data);
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('채팅 히스토리 로드 중 오류:', {
                error: axiosError.isAxiosError ? {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: axiosError.message
                } : error
            });
        }
    };

    const handleNewChat = () => {
        if (onChatSelect) {
            onChatSelect('new');
        }
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

    const handleChatSelect = (chatId: string) => {
        if (onChatSelect) {
            onChatSelect(chatId);
        }
        if (window.innerWidth <= 768) {
            onToggle();
        }
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

                    .chat-history-list {
                        margin-top: 1rem;
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .chat-history-item {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }

                    .chat-history-item:hover {
                        background-color: rgba(0, 0, 0, 0.05);
                    }

                    .history-icon {
                        color: #4b5563;
                        font-size: 1.25rem;
                    }

                    .history-info {
                        flex: 1;
                        min-width: 0;
                    }

                    .history-title {
                        font-weight: 500;
                        color: #1a1a1a;
                        margin: 0;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .history-preview {
                        font-size: 0.75rem;
                        color: #6b7280;
                        margin-bottom: 0.25rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .history-meta {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 0.75rem;
                        color: #6b7280;
                    }

                    .message-count {
                        background-color: #e5e7eb;
                        padding: 0.125rem 0.375rem;
                        border-radius: 9999px;
                        font-size: 0.675rem;
                    }

                    .history-date {
                        font-size: 0.75rem;
                        color: #6b7280;
                        margin: 0;
                    }

                    .sidebar-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1rem;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .new-chat-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        width: 100%;
                        padding: 0.75rem;
                        margin: 1rem 0;
                        border: 1px solid #e5e7eb;
                        border-radius: 6px;
                        background-color: #ffffff;
                        color: #4b5563;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .new-chat-button:hover {
                        background-color: rgba(0, 0, 0, 0.05);
                        color: #1a1a1a;
                    }

                    .chat-history-section {
                        margin-top: 2rem;
                    }

                    .section-title {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        margin: 0 0 1rem;
                        padding: 0 0.75rem;
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #6b7280;
                    }

                    .history-title {
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: #1a1a1a;
                        margin-bottom: 0.25rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .history-date {
                        font-size: 0.75rem;
                        color: #6b7280;
                    }
                    `}
                </style>
                <div className="sidebar-header">
                    <Logo />
                    <button className="close-button" onClick={onToggle}>
                        <FaBars />
                    </button>
                </div>

                <div className="sidebar-content">
                    <button 
                        className="new-chat-button" 
                        onClick={handleNewChat}
                    >
                        <FaPlus /> New Story
                    </button>

                    {isAuthenticated && chatHistories.length > 0 && (
                        <div className="chat-history-section">
                            <div className="chat-history-list">
                                {chatHistories.map((history) => (
                                    <div
                                        key={history._id}
                                        className="chat-history-item"
                                        onClick={() => handleChatSelect(history._id)}
                                    >
                                        <FaHistory className="history-icon" />
                                        <div className="history-info">
                                            <div className="history-title">{history.title}</div>
                                            <div className="history-preview">{history.lastMessage}</div>
                                            <div className="history-meta">
                                                <span className="message-count">
                                                    {history.messageCount} messages
                                                </span>
                                                <span className="history-date">
                                                    {new Date(history.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
            </div>
            <SettingsModal 
                isOpen={showSettingsModal} 
                onClose={() => setShowSettingsModal(false)} 
            />
        </>
    );
};

export default Sidebar;