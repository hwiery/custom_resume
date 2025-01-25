import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
    width: 100%;
    padding: 20px;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
`;

const FooterContent = styled.div`
    max-width: 760px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
`;

const FooterLink = styled(Link)`
    color: #6c757d;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;

    &:hover {
        color: #343a40;
    }
`;

const Footer: React.FC = () => {
    return (
        <FooterContainer>
            <FooterContent>
                <FooterLink to="/terms">이용약관</FooterLink>
                <FooterLink to="/privacy">개인정보처리방침</FooterLink>
                <FooterLink to="/contact">문의하기</FooterLink>
            </FooterContent>
        </FooterContainer>
    );
};

export default Footer; 