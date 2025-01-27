import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaPlus, FaCog, FaSignOutAlt, FaFileAlt, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import SettingsModal from './SettingsModal';
import ChatService from '../services/chatService';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface Chat {
    _id: string;
    title: string;
    lastMessage: string;
    lastMessageDate: string;
    createdAt: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const currentChatId = location.pathname.split('/').pop();

    useEffect(() => {
        if (isAuthenticated) {
            loadChatHistory();
        }
    }, [isAuthenticated]);

    const loadChatHistory = async () => {
        try {
            const response = await ChatService.getChatHistory();
            setChats(response.data.chats);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const handleChatSelect = (chatId: string) => {
        navigate(`/chats/${chatId}`);
    };

    const handleNewChat = () => {
        navigate('/');  // 메인 페이지로 이동하여 새 채팅 시작
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
                        display: flex;
                        flex-direction: column;
                        padding: 1rem;
                        overflow-y: auto;
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

                    .chat-history-section {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        margin-top: 1rem;
                        border-top: 1px solid #E5E7EB;
                        padding-top: 1rem;
                    }

                    .chat-history-title {
                        font-size: 0.875rem;
                        font-weight: 500;
                        color: #6B7280;
                        margin-bottom: 0.5rem;
                        padding: 0 0.5rem;
                    }

                    .chat-history-list {
                        flex: 1;
                        overflow-y: auto;
                    }

                    .chat-item {
                        padding: 0.75rem;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-bottom: 0.25rem;
                        transition: background-color 0.2s;
                    }

                    .chat-item:hover {
                        background-color: #F3F4F6;
                    }

                    .chat-item.active {
                        background-color: #F3F4F6;
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

                            <div className="chat-history-section">
                                <div className="chat-history-title">대화 기록</div>
                                <div className="chat-history-list">
                                    {chats && chats.length > 0 ? (
                                        chats.map((chat) => (
                                            <div 
                                                key={chat._id}
                                                onClick={() => handleChatSelect(chat._id)}
                                                className={`chat-item ${currentChatId === chat._id ? 'active' : ''}`}
                                            >
                                                <div className="chat-title">{chat.title || '새로운 대화'}</div>
                                                <div className="chat-preview">{chat.lastMessage || '대화를 시작해보세요'}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '0.75rem', color: '#6B7280', fontSize: '0.875rem' }}>
                                            아직 대화 기록이 없습니다
                                        </div>
                                    )}
                                </div>
                            </div>
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