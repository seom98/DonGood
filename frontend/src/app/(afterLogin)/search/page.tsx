"use client";

import { useUser } from "@/contexts/UserContext";

export default function SearchPage() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <h1>검색</h1>
        </div>
    );
}
