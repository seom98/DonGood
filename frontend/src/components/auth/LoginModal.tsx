"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import styles from "./LoginModal.module.css";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const supabase = createBrowserSupabaseClient();
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
            const supabase = createBrowserSupabaseClient();
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
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>돈 굳었다! 돈, 굳!</h2>
                    <p className={styles.modalSubtitle}>
                        소비 습관을 개선해보세요
                    </p>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.buttonContainer}>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className={`${styles.socialButton} ${styles.googleButton}`}
                        >
                            Google로 계속하기
                        </button>

                        <button
                            onClick={handleKakaoLogin}
                            disabled={loading}
                            className={`${styles.socialButton} ${styles.kakaoButton}`}
                        >
                            카카오로 계속하기
                        </button>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                </div>

                <div className={styles.modalFooter}>
                    <p className={styles.terms}>
                        계속하기를 클릭하면 <a href="/terms">이용약관</a>과{" "}
                        <a href="/privacy">개인정보처리방침</a>에 동의하는
                        것으로 간주됩니다. 서비스 이용을 위해 이메일과 이름,
                        프로필 이미지를 수집합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
