import React, { useCallback, useEffect } from 'react';

interface LogoutModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ 
    isOpen, 
    onConfirm, 
    onCancel 
}) => {
    // 외부 클릭 핸들러
    const handleOutsideClick = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('modal-overlay')) {
            onCancel();
        }
    }, [onCancel]);

    // 모달 열릴 때 이벤트 리스너 등록
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.body.style.overflow = ''; // 스크롤 복원
        };
    }, [isOpen, handleOutsideClick]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-card">
                    <div className="modal-header">
                        <h2>로그아웃</h2>
                    </div>
                    <div className="modal-body">
                        <p>정말 로그아웃 하시겠습니까?</p>
                    </div>
                    <div className="modal-buttons">
                        <button className="modal-button cancel" onClick={onCancel}>
                            아니오
                        </button>
                        <button className="modal-button confirm" onClick={onConfirm}>
                            예
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal; 