"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import styles from "@/styles/pages/DashboardPage.module.css";

interface GoalSettingsProps {
    userId: string;
}

export default function GoalSettings({ userId }: GoalSettingsProps) {
    const [dailyGoal, setDailyGoal] = useState<number>(0);
    const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [existingGoalId, setExistingGoalId] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        try {
            const supabase = createBrowserSupabaseClient();
            const { data, error } = await supabase
                .from("user_goals")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("목표 조회 오류:", error);
                return;
            }

            if (data) {
                setDailyGoal(data.daily_goal);
                setMonthlyGoal(data.monthly_goal);
                setExistingGoalId(data.id);
            }
        } catch (error) {
            console.error("목표 조회 중 오류:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const supabase = createBrowserSupabaseClient();
            let error;

            if (existingGoalId) {
                // 기존 목표가 있으면 업데이트
                const { error: updateError } = await supabase
                    .from("user_goals")
                    .update({
                        daily_goal: dailyGoal,
                        monthly_goal: monthlyGoal,
                    })
                    .eq("id", existingGoalId);
                error = updateError;
            } else {
                // 기존 목표가 없으면 새로 생성
                const { error: insertError } = await supabase
                    .from("user_goals")
                    .insert({
                        user_id: userId,
                        daily_goal: dailyGoal,
                        monthly_goal: monthlyGoal,
                    });
                error = insertError;
            }

            if (error) {
                throw error;
            }

            setMessage("목표가 성공적으로 저장되었습니다!");
            // 저장 후 목표 다시 불러오기
            await fetchGoals();
        } catch (error) {
            console.error("목표 저장 오류:", error);
            setMessage("목표 저장 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>로딩 중...</div>;
    }

    return (
        <div className={styles.goalSettings}>
            <h2 className={styles.goalTitle}>소비 목표 설정</h2>
            <form onSubmit={handleSubmit} className={styles.goalForm}>
                <div className={styles.goalInputGroup}>
                    <label htmlFor="dailyGoal" className={styles.goalLabel}>
                        일일 목표 (원)
                    </label>
                    <input
                        type="number"
                        id="dailyGoal"
                        value={dailyGoal}
                        onChange={(e) => setDailyGoal(Number(e.target.value))}
                        className={styles.goalInput}
                        placeholder="예: 50000"
                        min="0"
                    />
                </div>

                <div className={styles.goalInputGroup}>
                    <label htmlFor="monthlyGoal" className={styles.goalLabel}>
                        월간 목표 (원)
                    </label>
                    <input
                        type="number"
                        id="monthlyGoal"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                        className={styles.goalInput}
                        placeholder="예: 1500000"
                        min="0"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.goalButton}
                >
                    {loading ? "저장 중..." : "목표 저장"}
                </button>

                {message && (
                    <div
                        className={`${styles.message} ${
                            message.includes("성공")
                                ? styles.success
                                : styles.error
                        }`}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}
