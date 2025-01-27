import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <ToastContainer type={type}>
      <Message>{message}</Message>
      <CloseButton onClick={onClose}>&times;</CloseButton>
    </ToastContainer>
  );
};

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ToastContainer = styled.div<{ type: 'success' | 'error' | 'info' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  animation: ${slideIn} 0.3s ease-out;
  z-index: 1000;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return `
          background-color: #48BB78;
          color: white;
        `;
      case 'error':
        return `
          background-color: #F56565;
          color: white;
        `;
      default:
        return `
          background-color: #4299E1;
          color: white;
        `;
    }
  }}
`;

const Message = styled.p`
  margin: 0;
  margin-right: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

export default Toast; 