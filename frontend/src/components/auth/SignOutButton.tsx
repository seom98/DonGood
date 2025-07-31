"use client";

import { signOutClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOutClient();
        router.replace("/login");
    };

    return (
        <button onClick={handleSignOut} className={styles.signOutButton}>
            로그아웃
        </button>
    );
}
