"use client";

import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/home/LoginModal";
import { useModalWithAnimation } from "@/hooks/useModalWithAnimation";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const StartButtonStyled = styled.button`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 40px;
    background-color: var(--grey800);
    color: var(--grey025);
    border: none;
    border-radius: 50px;
    width: 100%;
    max-width: 400px;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        box-shadow: 0 4px 25px var(--shadow1);
    }

    @media (max-width: 600px) {
        font-size: 16px;
        width: calc(100% - 40px);
        max-width: 100%;
        margin: 0 20px;
        left: 0;
        transform: none;
    }
`;

export default function StartButton() {
    const {
        isOpen: isLoginModalOpen,
        isClosing,
        openModal,
        handleCloseWithAnimation,
    } = useModalWithAnimation();
    const { isAuthenticated } = useAuthStatus();
    const router = useRouter();

    const handleStartClick = () => {
        if (isAuthenticated) {
            router.push("/dashboard");
        } else {
            openModal();
        }
    };

    return (
        <>
            <StartButtonStyled onClick={handleStartClick}>
                시작하기
            </StartButtonStyled>

            <LoginModal
                isOpen={isLoginModalOpen}
                isClosing={isClosing}
                onClose={handleCloseWithAnimation}
            />
        </>
    );
}
