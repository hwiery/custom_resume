import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingIndicatorProps {
    size?: number;
    color?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
    size = 24, 
    color = '#1a73e8' 
}) => {
    return (
        <LoadingContainer>
            <DotContainer>
                <Dot size={size} color={color} delay={0} />
                <Dot size={size} color={color} delay={0.2} />
                <Dot size={size} color={color} delay={0.4} />
            </DotContainer>
        </LoadingContainer>
    );
};

const bounce = keyframes`
    0%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-8px);
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
`;

const DotContainer = styled.div`
    display: flex;
    gap: 6px;
`;

const Dot = styled.div<{ size: number; color: string; delay: number }>`
    width: ${props => props.size / 3}px;
    height: ${props => props.size / 3}px;
    background-color: ${props => props.color};
    border-radius: 50%;
    animation: ${bounce} 1.4s infinite ease-in-out;
    animation-delay: ${props => props.delay}s;
`;

export default LoadingIndicator; 