"use client";

import styles from "@/styles/pages/DashboardPage.module.css";
import GoalSettings from "@/components/dashboard/GoalSettings";
import { useUser } from "@/contexts/UserContext";

export default function DashboardPage() {
    const { user, loading } = useUser();

    if (loading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.container}>
            <GoalSettings />
        </div>
    );
}
