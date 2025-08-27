import { useState, useEffect, useRef, useCallback } from "react";

interface UseModalReturn {
    isOpen: boolean;
    modalRef: React.RefObject<HTMLDivElement>;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
}

export function useModal(): UseModalReturn {
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const openModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            modalRef.current &&
            !modalRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, []);

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
        modalRef: modalRef as React.RefObject<HTMLDivElement>,
        openModal,
        closeModal,
        toggleModal,
    };
}
