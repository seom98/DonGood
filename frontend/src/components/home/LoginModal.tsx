"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./LoginModal.module.css";
import KakaoIcon from "../icons/logos/KakaoIcon";
import GoogleIcon from "../icons/logos/GoogleIcon";
import CancleIcon from "../icons/CancleIcon";

interface LoginModalProps {
    isOpen: boolean;
    isClosing?: boolean;
    onClose: () => void;
}

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
        <div
            className={`${styles.modalOverlay} ${
                isClosing ? styles.closing : ""
            }`}
            onClick={handleBackdropClick}
        >
            <div
                className={`${styles.modalContent} ${
                    isClosing ? styles.closing : ""
                }`}
            >
                <button className={styles.closeButton} onClick={onClose}>
                    <CancleIcon />
                </button>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>시작하기</h2>
                    <p className={styles.modalSubtitle}>
                        가계부만 써도 돈이 절약되는거 아시죠?
                        <br />
                        지출관리와 통계를 통해 <br />
                        돈굳는 습관을 만들어보세요.
                    </p>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.buttonContainer}>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className={`${styles.socialButton} ${styles.googleButton}`}
                        >
                            <GoogleIcon width={16} height={16} />
                            Google로 시작하기
                        </button>

                        <button
                            onClick={handleKakaoLogin}
                            disabled={loading}
                            className={`${styles.socialButton} ${styles.kakaoButton}`}
                        >
                            <KakaoIcon width={16} height={16} />
                            카카오로 시작하기
                        </button>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                </div>

                <div className={styles.modalFooter}>
                    <p className={styles.terms}>
                        로그인하면 <a href="/terms">이용약관</a>과{" "}
                        <a href="/privacy">개인정보처리방침</a>에 동의하는
                        것으로 간주됩니다. <br />
                        서비스 이용을 위해 이메일과 이름, 프로필 이미지를
                        수집합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
