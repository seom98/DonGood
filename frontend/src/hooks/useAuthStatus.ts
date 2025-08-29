"use client";

import { useState, useEffect } from "react";
import { getCurrentUserClient } from "@/utils/supabase/client";

export function useAuthStatus() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const currentUser = await getCurrentUserClient();
                setIsAuthenticated(!!currentUser);
            } catch (error) {
                console.error("인증 상태 확인 오류:", error);
                setIsAuthenticated(false);
            }
        };

        checkAuthStatus();
    }, []);

    return { isAuthenticated };
}
