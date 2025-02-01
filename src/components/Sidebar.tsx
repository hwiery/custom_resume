import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaPlus, FaCog, FaSignOutAlt, FaFileAlt, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import SettingsModal from './SettingsModal';
import styled from 'styled-components';
import axios from '../api/axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChatHistory {
    _id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

const SidebarContainer = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background-color: #f3f4f6;
    border-right: 1px solid #e5e7eb;
    padding: 20px;
    overflow-y: auto;
`;

const NewChatButton = styled.button`
    width: 100%;
    padding: 12px;
    background-color: #0A66C2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #004182;
    }
`;

const ChatListContainer = styled.div`
    margin-top: 20px;
    margin-bottom: 20px;
`;

const ChatListTitle = styled.h3`
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 12px;
    padding: 0 12px;
`;

const ChatList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ChatItem = styled.div<{ isActive: boolean }>`
    padding: 12px;
    background-color: ${props => props.isActive ? '#e5e7eb' : 'white'};
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #e5e7eb;
    }
`;

const ChatTitle = styled.div`
    font-weight: 500;
    margin-bottom: 4px;
`;

const ChatDate = styled.div`
    font-size: 12px;
    color: #6b7280;
`;

const EmptyState = styled.div`
    text-align: center;
    color: #6b7280;
    margin-top: 20px;
`;

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onSelectChat: (chatId: string) => void;
    activeChatId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onSelectChat, activeChatId }) => {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

    const handleNewChat = () => {
        onSelectChat('new');
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

    useEffect(() => {
        if (isAuthenticated) {
            fetchChatHistory();
        }
    }, [isAuthenticated]);

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get('/api/chat');
            if (response.data.success) {
                setChatHistory(response.data.data);
            }
        } catch (error) {
            console.error('채팅 히스토리 로드 실패:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MM월 dd일 HH:mm', { locale: ko });
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

                            <ChatListContainer>
                                <ChatListTitle>History</ChatListTitle>
                                {chatHistory.length > 0 ? (
                                    chatHistory.map((chat) => (
                                        <ChatItem
                                            key={chat._id}
                                            isActive={activeChatId === chat._id}
                                            onClick={() => onSelectChat(chat._id)}
                                        >
                                            <ChatTitle>{chat.title}</ChatTitle>
                                            <ChatDate>{formatDate(chat.updatedAt)}</ChatDate>
                                        </ChatItem>
                                    ))
                                ) : (
                                    <EmptyState>
                                        아직 대화 내역이 없습니다.
                                    </EmptyState>
                                )}
                            </ChatListContainer>
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