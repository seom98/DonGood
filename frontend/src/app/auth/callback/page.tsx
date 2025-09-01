"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const supabase = createClient();

            try {
                const { error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth callback error:", error);
                    router.replace("/?error=auth_failed");
                    return;
                }

                router.replace("/dashboard");
            } catch (error) {
                console.error("Auth callback error:", error);
                router.replace("/?error=auth_failed");
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
                fontFamily: "Esamanru",
            }}
        >
            <div>로그인 처리 중...</div>
        </div>
    );
}
