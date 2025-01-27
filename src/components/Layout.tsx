import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';
import { IoSettingsOutline, IoLogOutOutline } from 'react-icons/io5';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        setShowDropdown(false);
        logout();
    };

    return (
        <LayoutContainer>
            <Header>
                <HeaderContent $isSidebarOpen={isSidebarOpen}>
                    {isAuthenticated && user && (
                        <UserProfileContainer ref={dropdownRef}>
                            <UserImage 
                                src={user.photoURL || '/assets/default-profile.png'} 
                                alt="User profile"
                                onClick={() => setShowDropdown(!showDropdown)}
                            />
                            {showDropdown && (
                                <DropdownMenu>
                                    <DropdownItem onClick={() => {
                                        setShowSettings(true);
                                        setShowDropdown(false);
                                    }}>
                                        <IoSettingsOutline size={18} />
                                        <span>Settings</span>
                                    </DropdownItem>
                                    <DropdownItem onClick={handleLogout}>
                                        <IoLogOutOutline size={18} />
                                        <span>Logout</span>
                                    </DropdownItem>
                                </DropdownMenu>
                            )}
                        </UserProfileContainer>
                    )}
                </HeaderContent>
            </Header>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <MainContent $isSidebarOpen={isSidebarOpen}>
                <Outlet />
            </MainContent>
            {showSettings && (
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </LayoutContainer>
    );
};

const Header = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: white;
    border-bottom: 1px solid #ffffff;
    box-shadow: none;
    z-index: 999;
`;

const HeaderContent = styled.div<{ $isSidebarOpen: boolean }>`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    margin-left: ${props => props.$isSidebarOpen ? '240px' : '0'};
    transition: margin-left 0.3s ease;

    @media (max-width: 1024px) {
        margin-left: 0;
    }
`;

const UserProfileContainer = styled.div`
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
`;

const UserImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid #f8f9fa;
    transition: border-color 0.2s ease;

    &:hover {
        border-color: #1a73e8;
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 56px;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    padding: 8px 0;
`;

const DropdownItem = styled.div`
    padding: 10px 16px;
    cursor: pointer;
    color: #1a1a1a;
    font-family: 'Pretendard Medium', sans-serif;
    font-size: 14px;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
        color: #666;
    }

    &:hover {
        background-color: #f8f9fa;
        
        svg {
            color: #1a73e8;
        }
    }
`;

const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: white;
    padding-top: 64px;
`;

const MainContent = styled.main<{ $isSidebarOpen: boolean }>`
    flex: 1;
    margin-left: ${props => props.$isSidebarOpen ? '240px' : '0'};
    transition: margin-left 0.3s ease;
    background-color: white;
    min-height: calc(100vh - 64px);
    
    @media (max-width: 1024px) {
        margin-left: 0;
    }
`;

export default Layout;

