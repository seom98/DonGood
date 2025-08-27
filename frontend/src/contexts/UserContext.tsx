"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { getCurrentUserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface UserContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getCurrentUserClient();
                if (!currentUser) {
                    router.replace("/");
                    return;
                }
                setUser(currentUser);
            } catch (error) {
                console.error("사용자 정보 가져오기 오류:", error);
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
