"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import styles from "@/styles/pages/HomePage.module.css";
import LoginModal from "@/components/home/LoginModal";
import { getCurrentUserClient } from "@/utils/supabase/client";
import { useModalWithAnimation } from "@/hooks/useModalWithAnimation";

export default function StartButton() {
    const {
        isOpen: isLoginModalOpen,
        isClosing,
        openModal,
        handleCloseWithAnimation,
    } = useModalWithAnimation();
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
            openModal();
        }
    };

    return (
        <>
            <button onClick={handleStartClick} className={styles.startButton}>
                시작하기
            </button>

            <LoginModal
                isOpen={isLoginModalOpen}
                isClosing={isClosing}
                onClose={handleCloseWithAnimation}
            />
        </>
    );
}
