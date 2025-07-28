"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
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
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "kakao",
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
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

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // 회원가입
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nickname: nickname,
                        },
                    },
                });
                if (error) throw error;
                setError("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
            } else {
                // 로그인
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                window.location.href = "/dashboard";
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "인증 중 오류가 발생했습니다.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>돈 굳었다!</h1>
                <p className={styles.subtitle}>소비 습관을 개선해보세요</p>

                <div className={styles.divider}>
                    <span>또는</span>
                </div>

                <form onSubmit={handleEmailAuth} className={styles.emailForm}>
                    {isSignUp && (
                        <input
                            type="text"
                            placeholder="닉네임"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className={styles.input}
                            required={isSignUp}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.emailButton}
                    >
                        {isSignUp ? "회원가입" : "로그인"}
                    </button>
                </form>

                <div className={styles.toggleMode}>
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className={styles.toggleButton}
                    >
                        {isSignUp
                            ? "이미 계정이 있으신가요? 로그인"
                            : "계정이 없으신가요? 회원가입"}
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>또는</span>
                </div>

                <div className={styles.buttonContainer}>
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className={`${styles.socialButton} ${styles.googleButton}`}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google로 계속하기
                    </button>

                    <button
                        onClick={handleKakaoLogin}
                        disabled={loading}
                        className={`${styles.socialButton} ${styles.kakaoButton}`}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24">
                            <path
                                d="M12 3C6.48 3 2 6.48 2 12s4.48 9 10 9 10-4.48 10-9S17.52 3 12 3zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                                fill="#FEE500"
                            />
                            <path
                                d="M12 6c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                                fill="#000"
                            />
                        </svg>
                        카카오로 계속하기
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <p className={styles.terms}>
                    계속하기를 클릭하면 <a href="/terms">이용약관</a>과{" "}
                    <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로
                    간주됩니다.
                </p>
            </div>
        </div>
    );
}
