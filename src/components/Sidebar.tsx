import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaPlus, FaCog, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import Logo from './Logo';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface HistoryItem {
    id: number;
    preview: string;
    timestamp: Date;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const { isAuthenticated, user, login, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [histories] = useState<HistoryItem[]>([
        { id: 1, preview: "신입 개발자 이력서 작성하기", timestamp: new Date() },
        { id: 2, preview: "프론트엔드 개발자 포트폴리오", timestamp: new Date() },
        { id: 3, preview: "백엔드 개발자 경력 기술서", timestamp: new Date() },
    ]);

    const handleNewChat = () => {
        console.log("New chat started");
    };

    const handleLogoutClick = () => {
        try {
            setShowUserMenu(false);
            if (isOpen) {
                onToggle(); // 사이드바 닫기
            }
            logout(); // 즉시 로그아웃 실행
        } catch (error) {
            console.error('로그아웃 처리 중 오류:', error);
        }
    };

    const handleGoogleSuccess = (credentialResponse: any) => {
        login(credentialResponse);
    };

    const handleSettingsClick = () => {
        console.log('Settings clicked');
        setShowUserMenu(false);
    };

    const handleContactClick = () => {
        console.log('Contact us clicked');
        setShowUserMenu(false);
    };

    return (
        <>
            {/* PC 뷰에서의 접힌 상태 햄버거 버튼 */}
            <button className={`desktop-menu-button ${isOpen ? 'hidden' : ''}`} onClick={onToggle}>
                <FaBars />
            </button>

            {/* 모바일 뷰에서의 햄버거 버튼 */}
            <button className={`mobile-menu-button ${isOpen ? 'hidden' : ''}`} onClick={onToggle}>
                <FaBars />
            </button>
            
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
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

                            <div className="history-section">
                                <h2>History</h2>
                                <div className="history-list">
                                    {histories.map(history => (
                                        <div key={history.id} className="history-item">
                                            <p>{history.preview.slice(0, 20)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                    <button className="menu-item" onClick={handleContactClick}>
                                        <FaEnvelope /> Contact Us
                                    </button>
                                    <button className="menu-item" onClick={handleLogoutClick}>
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
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
                )}
            </div>
        </>
    );
};

export default Sidebar; 