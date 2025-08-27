"use client";

import { useUser } from "@/contexts/UserContext";

export default function ChartPage() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <h1>통계</h1>
        </div>
    );
}
