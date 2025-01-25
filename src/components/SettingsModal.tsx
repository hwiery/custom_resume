import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: ${props => props.isOpen ? 'flex' : 'none'};
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: 24px;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    position: relative;
    margin: 20px;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const Title = styled.h2`
    font-size: 20px;
    color: #1a1a1a;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #4b5563;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover {
        color: #1a1a1a;
    }

    svg {
        font-size: 20px;
    }
`;

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay isOpen={isOpen} onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <Title>설정</Title>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </ModalHeader>
                {/* 여기에 설정 옵션들이 추가될 예정 */}
            </ModalContent>
        </ModalOverlay>
    );
};

export default SettingsModal;