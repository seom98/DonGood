"use client";

import { useUser } from "@/contexts/UserContext";

export default function MenuPage() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <h1>메뉴</h1>
        </div>
    );
}
