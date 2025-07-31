import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import Image from "next/image";
import styles from "@/styles/pages/DashboardPage.module.css";
import SignOutButton from "@/components/auth/SignOutButton";
import GoalSettings from "@/components/dashboard/GoalSettings";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    const profileImageUrl =
        user.user_metadata?.avatar_url || user.user_metadata?.picture;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>대시보드</h1>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>
                        {user.user_metadata?.nickname ||
                            user.user_metadata?.name ||
                            user.email}
                    </span>
                    {profileImageUrl ? (
                        <Image
                            src={profileImageUrl}
                            alt="프로필 이미지"
                            width={40}
                            height={40}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {user.user_metadata?.nickname?.[0] ||
                                user.user_metadata?.name?.[0] ||
                                user.email?.[0]}
                        </div>
                    )}
                    <SignOutButton />
                </div>
            </div>

            <GoalSettings userId={user.id} />
        </div>
    );
}
