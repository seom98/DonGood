import { useState, useEffect, useRef, useCallback } from "react";

interface UseModalWithAnimationReturn {
    isOpen: boolean;
    isClosing: boolean;
    modalRef: React.RefObject<HTMLDivElement>;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
    handleCloseWithAnimation: () => void;
}

export function useModalWithAnimation(): UseModalWithAnimationReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const openModal = useCallback(() => {
        setIsClosing(false);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setIsClosing(false);
    }, []);

    const handleCloseWithAnimation = useCallback(() => {
        setIsClosing(true);
        // 애니메이션 완료 후 모달 완전히 닫기
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 300);
    }, []);

    const toggleModal = useCallback(() => {
        if (isOpen) {
            handleCloseWithAnimation();
        } else {
            openModal();
        }
    }, [isOpen, openModal, handleCloseWithAnimation]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            modalRef.current &&
            !modalRef.current.contains(event.target as Node)
        ) {
            handleCloseWithAnimation();
        }
    }, [handleCloseWithAnimation]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    return {
        isOpen,
        isClosing,
        modalRef: modalRef as React.RefObject<HTMLDivElement>,
        openModal,
        closeModal,
        toggleModal,
        handleCloseWithAnimation,
    };
}
