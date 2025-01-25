import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const LayoutContainer = styled.div`
    display: flex;
    height: 100vh;
`;

const MainContent = styled.main`
    flex: 1;
    overflow-y: auto;
    background-color: #F8FAFC;
`;

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node) &&
                window.innerWidth <= 768 // 모바일에서만 외부 클릭 처리
            ) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    return (
        <LayoutContainer>
            <div ref={sidebarRef}>
                <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            </div>
            <MainContent>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
};

export default Layout;

