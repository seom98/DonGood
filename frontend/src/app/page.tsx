"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import styles from "@/styles/pages/HomePage.module.css";
import HomeHeader from "@/components/common/HomeHeader";
import SpinDonGood from "@/components/SpinDonGood";
import LoginModal from "@/components/auth/LoginModal";
import { getCurrentUserClient } from "@/lib/supabase/client";

export default function HomePage() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // 컴포넌트 마운트 시 사용자 상태 확인
        const checkUserStatus = async () => {
            try {
                const currentUser = await getCurrentUserClient();
                setUser(currentUser);
            } catch (error) {
                console.error("사용자 상태 확인 오류:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserStatus();
    }, []);

    const handleStartClick = () => {
        if (user) {
            // 로그인된 사용자는 바로 대시보드로 이동
            router.push("/dashboard");
        } else {
            // 로그인되지 않은 사용자는 모달 열기
            setIsLoginModalOpen(true);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <div>
            <main className={styles.main}>
                <HomeHeader />
                <SpinDonGood />
                <div>돈 굳었다! 돈, 굳!</div>
                <button
                    onClick={handleStartClick}
                    className={styles.startButton}
                >
                    {user ? "대시보드로 이동" : "시작하기"}
                </button>
            </main>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
}
