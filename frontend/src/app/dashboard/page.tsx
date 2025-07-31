import { getAuthUser } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { getUserGoals } from "@/lib/api/goals";
import Image from "next/image";
import styles from "./dashboard.module.css";
import SignOutButton from "@/components/auth/SignOutButton";
import GoalSettings from "@/components/dashboard/GoalSettings";

export default async function DashboardPage() {
    const user = await getAuthUser();

    if (!user) {
        redirect("/login");
    }

    // 사용자 목표 데이터 가져오기
    const userGoals = await getUserGoals(user.id);

    // 프로필 이미지 URL 가져오기 (소셜 로그인에서 제공하는 경우)
    const profileImageUrl =
        user.user_metadata?.avatar_url || user.user_metadata?.picture;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>돈 굳었다!</h1>
                <div className={styles.userInfo}>
                    <div className={styles.profileSection}>
                        <div className={styles.profileImage}>
                            {profileImageUrl ? (
                                <Image
                                    src={profileImageUrl}
                                    alt="프로필 이미지"
                                    width={40}
                                    height={40}
                                    className={styles.avatar}
                                />
                            ) : (
                                <div className={styles.defaultAvatar}>
                                    {(
                                        user.user_metadata?.full_name ||
                                        user.email ||
                                        "U"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className={styles.userName}>
                            안녕하세요,{" "}
                            {user.user_metadata?.full_name || user.email}님!
                        </span>
                    </div>
                    <SignOutButton />
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.welcomeCard}>
                    <h2>환영합니다! 🎉</h2>
                    <p>소비 습관을 개선하고 돈을 굳혀보세요.</p>
                    <p>이메일: {user.email}</p>
                </div>

                <div className={styles.dashboardGrid}>
                    <div className={styles.goalsSection}>
                        <GoalSettings
                            userId={user.id}
                            initialGoals={userGoals}
                        />
                    </div>

                    <div className={styles.features}>
                        <div className={styles.featureCard}>
                            <h3>지출 기록</h3>
                            <p>매일의 지출을 기록하고 분석해보세요.</p>
                        </div>

                        <div className={styles.featureCard}>
                            <h3>예산 관리</h3>
                            <p>카테고리별 예산을 설정하고 관리하세요.</p>
                        </div>

                        <div className={styles.featureCard}>
                            <h3>통계 분석</h3>
                            <p>지출 패턴을 분석하고 개선점을 찾아보세요.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
