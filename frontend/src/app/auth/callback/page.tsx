"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const supabase = createBrowserSupabaseClient();
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error);
                    router.replace("/login?error=auth_failed");
                    return;
                }

                if (data.session) {
                    // 로그인 성공
                    router.replace("/dashboard");
                } else {
                    // 세션이 없으면 로그인 페이지로
                    router.replace("/login");
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                router.replace("/login?error=auth_failed");
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "1.2rem",
            }}
        >
            로그인 처리 중...
        </div>
    );
}
