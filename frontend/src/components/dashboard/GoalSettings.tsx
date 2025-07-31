"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import styles from "@/app/dashboard/dashboard.module.css";

interface GoalSettingsProps {
    userId: string;
    initialGoals?: {
        daily_goal: number;
        monthly_goal: number;
    } | null;
}

export default function GoalSettings({
    userId,
    initialGoals,
}: GoalSettingsProps) {
    const [dailyGoal, setDailyGoal] = useState(initialGoals?.daily_goal || 0);
    const [monthlyGoal, setMonthlyGoal] = useState(
        initialGoals?.monthly_goal || 0
    );
    const [currentGoals, setCurrentGoals] = useState(initialGoals);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // initialGoals가 변경될 때 상태 업데이트
    useEffect(() => {
        if (initialGoals) {
            setCurrentGoals(initialGoals);
            setDailyGoal(initialGoals.daily_goal);
            setMonthlyGoal(initialGoals.monthly_goal);
        }
    }, [initialGoals]);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleSave = async () => {
        if (dailyGoal < 0 || monthlyGoal < 0) {
            setMessage({
                type: "error",
                text: "목표 금액은 0원 이상이어야 합니다.",
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const supabase = createBrowserSupabaseClient();

            // 기존 목표가 있는지 확인
            const { data: existingGoal } = await supabase
                .from("user_goals")
                .select("id")
                .eq("user_id", userId)
                .single();

            let error;

            if (existingGoal) {
                // 기존 목표가 있으면 업데이트
                const { error: updateError } = await supabase
                    .from("user_goals")
                    .update({
                        daily_goal: dailyGoal,
                        monthly_goal: monthlyGoal,
                    })
                    .eq("user_id", userId);
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
                console.error("Supabase error:", error);
                throw new Error(error.message);
            }

            // 현재 목표 상태 업데이트
            const updatedGoals = {
                daily_goal: dailyGoal,
                monthly_goal: monthlyGoal,
            };
            setCurrentGoals(updatedGoals);

            setMessage({
                type: "success",
                text: "목표가 성공적으로 저장되었습니다!",
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving goals:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "알 수 없는 오류가 발생했습니다.";
            setMessage({
                type: "error",
                text: `목표 저장 중 오류가 발생했습니다: ${errorMessage}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setDailyGoal(currentGoals?.daily_goal || 0);
        setMonthlyGoal(currentGoals?.monthly_goal || 0);
        setIsEditing(false);
        setMessage(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ko-KR").format(amount);
    };

    return (
        <div className={styles.goalSettings}>
            <div className={styles.goalHeader}>
                <h3>소비 목표 설정</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className={styles.editButton}
                    >
                        수정
                    </button>
                )}
            </div>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.goalContent}>
                <div className={styles.goalItem}>
                    <label>일간 소비 목표</label>
                    {isEditing ? (
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={dailyGoal}
                                onChange={(e) =>
                                    setDailyGoal(Number(e.target.value))
                                }
                                min="0"
                                className={styles.goalInput}
                            />
                            <span className={styles.currency}>원</span>
                        </div>
                    ) : (
                        <div className={styles.goalDisplay}>
                            {formatCurrency(dailyGoal)}원
                        </div>
                    )}
                </div>

                <div className={styles.goalItem}>
                    <label>월간 소비 목표</label>
                    {isEditing ? (
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={monthlyGoal}
                                onChange={(e) =>
                                    setMonthlyGoal(Number(e.target.value))
                                }
                                min="0"
                                className={styles.goalInput}
                            />
                            <span className={styles.currency}>원</span>
                        </div>
                    ) : (
                        <div className={styles.goalDisplay}>
                            {formatCurrency(monthlyGoal)}원
                        </div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className={styles.goalActions}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={styles.saveButton}
                    >
                        {loading ? "저장 중..." : "저장"}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className={styles.cancelButton}
                    >
                        취소
                    </button>
                </div>
            )}
        </div>
    );
}
