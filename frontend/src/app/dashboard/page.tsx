"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import styles from "@/styles/pages/DashboardPage.module.css";
import SignOutButton from "@/components/auth/SignOutButton";
import GoalSettings from "@/components/dashboard/GoalSettings";
import { getCurrentUserClient } from "@/lib/supabase/client";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getCurrentUserClient();
                if (!currentUser) {
                    router.replace("/");
                    return;
                }
                setUser(currentUser);
            } catch (error) {
                console.error("사용자 정보 가져오기 오류:", error);
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    // 카카오 프로필 이미지 URL 처리 개선
    const getProfileImageUrl = () => {
        if (!user) return null;

        const avatarUrl = user.user_metadata?.avatar_url;
        const pictureUrl = user.user_metadata?.picture;

        // 카카오 프로필 이미지인 경우 고화질 버전으로 변환
        if (avatarUrl && avatarUrl.includes("k.kakaocdn.net")) {
            // 카카오 프로필 이미지를 고화질로 변환 (원본 크기)
            return avatarUrl.replace("/profile_110/", "/profile_original/");
        }

        return avatarUrl || pictureUrl;
    };

    const profileImageUrl = getProfileImageUrl();

    if (loading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>대시보드</h1>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>
                        {user.user_metadata?.nickname ||
                            user.user_metadata?.name ||
                            user.email}
                    </span>
                    {profileImageUrl && !imageError ? (
                        <Image
                            src={profileImageUrl}
                            alt="프로필 이미지"
                            width={40}
                            height={40}
                            className={styles.avatar}
                            onError={() => setImageError(true)}
                            priority
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {user.user_metadata?.nickname?.[0] ||
                                user.user_metadata?.name?.[0] ||
                                user.email?.[0]}
                        </div>
                    )}
                    <SignOutButton />
                </div>
            </div>

            <GoalSettings userId={user.id} />
        </div>
    );
}
