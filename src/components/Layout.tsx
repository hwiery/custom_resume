import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    return (
        <LayoutContainer>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <MainContent $isSidebarOpen={isSidebarOpen}>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
};

const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
    background-color: white;
`;

const MainContent = styled.main<{ $isSidebarOpen: boolean }>`
    flex: 1;
    margin-left: ${props => props.$isSidebarOpen ? '240px' : '0'};
    transition: margin-left 0.3s ease;
    background-color: white;
    
    @media (max-width: 1024px) {
        margin-left: 0;
    }
`;

export default Layout;

