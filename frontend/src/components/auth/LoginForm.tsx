"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "@/app/login/login.module.css";

export default function LoginForm() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = createBrowserSupabaseClient();
        try {
            if (isSignUp) {
                // 회원가입
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { nickname },
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
                router.replace("/dashboard");
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

    return (
        <>
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
        </>
    );
}
