"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styled from "@emotion/styled";
import KakaoIcon from "../icons/logos/KakaoIcon";
import GoogleIcon from "../icons/logos/GoogleIcon";
import CancleIcon from "../icons/CancleIcon";

interface LoginModalProps {
    isOpen: boolean;
    isClosing?: boolean;
    onClose: () => void;
}

// Styled Components
const ModalOverlay = styled.div<{ isClosing: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--shadow1);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: ${(props) =>
        props.isClosing
            ? "overlayFadeOut 0.3s ease-out"
            : "overlayFadeIn 0.3s ease-out"};

    @keyframes overlayFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes overlayFadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    @media (max-width: 600px) {
        align-items: flex-end;
        padding: 0;
    }
`;

const ModalContent = styled.div<{ isClosing: boolean }>`
    background: var(--grey025);
    border-radius: 16px;
    padding: 32px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 12px 40px var(--shadow1);
    animation: ${(props) =>
        props.isClosing
            ? "modalSlideOut 0.3s ease-out"
            : "modalSlideIn 0.3s ease-out"};
    border: 1px solid var(--grey200);

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes modalSlideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    @media (max-width: 600px) {
        border-radius: 16px 16px 0 0;
        height: 70vh;
        margin-bottom: 0;
        animation: ${(props) =>
            props.isClosing
                ? "modalSlideDown 0.3s ease-out"
                : "modalSlideUp 0.3s ease-out"};

        @keyframes modalSlideUp {
            from {
                opacity: 0;
                transform: translateY(100%);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes modalSlideDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(100%);
            }
        }
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--grey500);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--grey100);
    }
`;

const ModalHeader = styled.div`
    text-align: center;
    margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
    font-size: 30px;
    font-weight: 400;
    color: var(--grey900);
    margin: 16px 0 12px;
`;

const ModalSubtitle = styled.p`
    color: var(--grey500);
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 300;
`;

const ModalBody = styled.div`
    margin: 24px;

    @media (max-width: 600px) {
        margin: 48px 0;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const SocialButton = styled.button<{ variant: "google" | "kakao" }>`
    padding: 12px 16px;
    border: 1px solid var(--grey200);
    border-radius: 24px;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    ${(props) =>
        props.variant === "google" &&
        `
        background-color: var(--white);
        color: var(--black);
        border-color: var(--grey200);
    `}

    ${(props) =>
        props.variant === "kakao" &&
        `
        background-color: #fee500;
        color: var(--black);
        border-color: #fee500;
    `}

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:hover {
        box-shadow: 0 4px 25px var(--shadow1);
    }
`;

const Error = styled.div`
    background-color: var(--red100);
    border: 1px solid var(--red200);
    color: var(--red400);
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    margin-top: 16px;
    font-weight: 300;
`;

const ModalFooter = styled.div`
    text-align: center;
    margin-bottom: 16px;
`;

const Terms = styled.p`
    font-size: 12px;
    color: var(--grey500);
    margin: 0;
    line-height: 1.4;
    font-weight: 300;

    a {
        color: var(--blue300);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

export default function LoginModal({
    isOpen,
    isClosing = false,
    onClose,
}: LoginModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${
                        process.env.NEXT_PUBLIC_SITE_URL ||
                        "http://localhost:3000"
                    }/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            setError("Google 로그인 중 오류가 발생했습니다.");
            console.error("Google login error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "kakao",
                options: {
                    redirectTo: `${
                        process.env.NEXT_PUBLIC_SITE_URL ||
                        "http://localhost:3000"
                    }/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            setError("카카오 로그인 중 오류가 발생했습니다.");
            console.error("Kakao login error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay isClosing={isClosing} onClick={handleBackdropClick}>
            <ModalContent isClosing={isClosing}>
                <CloseButton onClick={onClose}>
                    <CancleIcon />
                </CloseButton>

                <ModalHeader>
                    <ModalTitle>시작하기</ModalTitle>
                    <ModalSubtitle>
                        가계부만 써도 돈이 절약되는거 아시죠?
                        <br />
                        지출관리와 통계를 통해 <br />
                        돈굳는 습관을 만들어보세요.
                    </ModalSubtitle>
                </ModalHeader>

                <ModalBody>
                    <ButtonContainer>
                        <SocialButton
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            variant="google"
                        >
                            <GoogleIcon width={16} height={16} />
                            Google로 시작하기
                        </SocialButton>

                        <SocialButton
                            onClick={handleKakaoLogin}
                            disabled={loading}
                            variant="kakao"
                        >
                            <KakaoIcon width={16} height={16} />
                            카카오로 시작하기
                        </SocialButton>
                    </ButtonContainer>

                    {error && <Error>{error}</Error>}
                </ModalBody>

                <ModalFooter>
                    <Terms>
                        로그인하면 <a href="/terms">이용약관</a>과{" "}
                        <a href="/privacy">개인정보처리방침</a>에 동의하는
                        것으로 간주됩니다. <br />
                        서비스 이용을 위해 이메일과 이름, 프로필 이미지를
                        수집합니다.
                    </Terms>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
}
