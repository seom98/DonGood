"use client";

import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/DashboardPage.module.css";

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace("/");
        } catch (error) {
            console.error("로그아웃 중 오류가 발생했습니다:", error);
        }
    };

    return (
        <button onClick={handleSignOut} className={styles.signOutButton}>
            로그아웃
        </button>
    );
}
