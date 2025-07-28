"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>로딩 중...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>돈 굳었다!</h1>
                <div className={styles.userInfo}>
                    <span>
                        안녕하세요,{" "}
                        {user.user_metadata?.full_name || user.email}님!
                    </span>
                    <button onClick={signOut} className={styles.signOutButton}>
                        로그아웃
                    </button>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.welcomeCard}>
                    <h2>환영합니다! 🎉</h2>
                    <p>소비 습관을 개선하고 돈을 굳혀보세요.</p>
                    <p>이메일: {user.email}</p>
                </div>

                <div className={styles.features}>
                    <div className={styles.featureCard}>
                        <h3>지출 기록</h3>
                        <p>매일의 지출을 기록하고 분석해보세요.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <h3>예산 관리</h3>
                        <p>카테고리별 예산을 설정하고 관리하세요.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <h3>통계 분석</h3>
                        <p>지출 패턴을 분석하고 개선점을 찾아보세요.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
