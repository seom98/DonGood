"use client";

import { useUser } from "@/contexts/UserContext";

export default function MonthlyPage() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <h1>달력</h1>
        </div>
    );
}
