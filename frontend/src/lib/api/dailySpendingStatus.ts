import { createClient } from "@/utils/supabase/client";

export interface DailySpendingStatus {
    id: string;
    user_id: string;
    date: string;
    has_spending: boolean;
    total_amount: number;
    is_goal_achieved: boolean | null;
    daily_goal: number | null;
    created_at: string;
    updated_at: string;
}

export interface GoalAchievement {
    id: string;
    user_id: string;
    date: string;
    is_achieved: boolean;
    daily_goal: number;
    actual_amount: number;
    difference: number;
    created_at: string;
}

export interface MonthlyGoalStats {
    year: number;
    month: number;
    total_days: number;
    days_with_spending: number;
    days_without_spending: number;
    days_recorded: number;
    days_not_recorded: number;
    goal_achieved_days: number;
    goal_failed_days: number;
    success_rate: number;
    total_saved_amount: number;
    total_exceeded_amount: number;
    average_daily_amount: number;
    consecutive_success_days: number;
    consecutive_failure_days: number;
    longest_success_streak: number;
    longest_failure_streak: number;
}

export interface DailySpendingSummary {
    date: string;
    has_spending: boolean;
    total_amount: number;
    is_goal_achieved: boolean | null;
    daily_goal: number | null;
    difference: number | null;
    status: 'success' | 'failure' | 'no_goal' | 'no_record';
}

// 일일 소비 상태 수동 기록 (지출이 없었던 날)
export async function recordNoSpendingDay(date: string): Promise<DailySpendingStatus> {
    const supabase = createClient();
    
    // 해당 날짜의 일일 목표 조회
    const { data: userGoal, error: goalError } = await supabase
        .from("user_goals")
        .select("daily_goal")
        .single();

    if (goalError && goalError.code !== "PGRST116") {
        throw new Error(`일일 목표 조회 실패: ${goalError.message}`);
    }

    const dailyGoal = userGoal?.daily_goal || null;
    const isGoalAchieved = dailyGoal ? 0 <= dailyGoal : null;

    const { data: status, error } = await supabase
        .from("daily_spending_status")
        .insert({
            date,
            has_spending: false,
            total_amount: 0,
            is_goal_achieved: isGoalAchieved,
            daily_goal: dailyGoal,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`일일 소비 상태 기록 실패: ${error.message}`);
    }

    // 목표 달성 기록 생성
    if (dailyGoal && dailyGoal > 0) {
        await supabase
            .from("goal_achievements")
            .insert({
                date,
                is_achieved: isGoalAchieved,
                daily_goal: dailyGoal,
                actual_amount: 0,
                difference: -dailyGoal, // 절약 금액
            });
    }

    return status;
}

// 특정 날짜의 소비 상태 조회
export async function getDailySpendingStatus(date: string): Promise<DailySpendingStatus | null> {
    const supabase = createClient();
    
    const { data: status, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .eq("date", date)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(`일일 소비 상태 조회 실패: ${error.message}`);
    }

    return status;
}

// 월별 일일 소비 상태 조회
export async function getMonthlyDailySpendingStatus(year: number, month: number): Promise<DailySpendingStatus[]> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data: statuses, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

    if (error) {
        throw new Error(`월별 일일 소비 상태 조회 실패: ${error.message}`);
    }

    return statuses || [];
}

// 월별 목표 달성 통계
export async function getMonthlyGoalStats(year: number, month: number): Promise<MonthlyGoalStats> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    // 해당 월의 일일 소비 상태 조회
    const { data: statuses, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

    if (error) {
        throw new Error(`월별 목표 달성 통계 조회 실패: ${error.message}`);
    }

    const statusesList = statuses || [];
    const totalDays = new Date(year, month, 0).getDate(); // 해당 월의 총 일수
    
    // 기본 통계 계산
    const stats = {
        year,
        month,
        total_days: totalDays,
        days_with_spending: 0,
        days_without_spending: 0,
        days_recorded: statusesList.length,
        days_not_recorded: totalDays - statusesList.length,
        goal_achieved_days: 0,
        goal_failed_days: 0,
        success_rate: 0,
        total_saved_amount: 0,
        total_exceeded_amount: 0,
        average_daily_amount: 0,
        consecutive_success_days: 0,
        consecutive_failure_days: 0,
        longest_success_streak: 0,
        longest_failure_streak: 0,
    };

    let currentSuccessStreak = 0;
    let currentFailureStreak = 0;

    statusesList.forEach(status => {
        if (status.has_spending) {
            stats.days_with_spending++;
        } else {
            stats.days_without_spending++;
        }

        if (status.is_goal_achieved === true) {
            stats.goal_achieved_days++;
            currentSuccessStreak++;
            currentFailureStreak = 0;
            stats.longest_success_streak = Math.max(stats.longest_success_streak, currentSuccessStreak);
        } else if (status.is_goal_achieved === false) {
            stats.goal_failed_days++;
            currentFailureStreak++;
            currentSuccessStreak = 0;
            stats.longest_failure_streak = Math.max(stats.longest_failure_streak, currentFailureStreak);
        }

        // 절약/초과 금액 계산
        if (status.is_goal_achieved !== null && status.daily_goal) {
            const difference = status.total_amount - status.daily_goal;
            if (difference <= 0) {
                stats.total_saved_amount += Math.abs(difference);
            } else {
                stats.total_exceeded_amount += difference;
            }
        }
    });

    // 성공률 계산
    const totalGoalDays = stats.goal_achieved_days + stats.goal_failed_days;
    stats.success_rate = totalGoalDays > 0 ? Math.round((stats.goal_achieved_days / totalGoalDays) * 100) : 0;

    // 평균 일일 지출액 계산
    stats.average_daily_amount = stats.days_with_spending > 0 
        ? Math.round(stats.total_saved_amount / stats.days_with_spending) 
        : 0;

    return stats;
}

// 연속 성공/실패 기록 조회
export async function getConsecutiveGoalRecords(): Promise<{
    current_success_streak: number;
    current_failure_streak: number;
    longest_success_streak: number;
    longest_failure_streak: number;
    total_success_days: number;
    total_failure_days: number;
}> {
    const supabase = createClient();
    
    // 최근 30일간의 목표 달성 기록 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: achievements, error } = await supabase
        .from("goal_achievements")
        .select("*")
        .gte("date", startDate)
        .order("date", { ascending: false });

    if (error) {
        throw new Error(`연속 기록 조회 실패: ${error.message}`);
    }

    const achievementsList = achievements || [];
    
    let currentSuccessStreak = 0;
    let currentFailureStreak = 0;
    let longestSuccessStreak = 0;
    let longestFailureStreak = 0;
    let totalSuccessDays = 0;
    let totalFailureDays = 0;

    achievementsList.forEach(achievement => {
        if (achievement.is_achieved) {
            totalSuccessDays++;
            currentSuccessStreak++;
            currentFailureStreak = 0;
            longestSuccessStreak = Math.max(longestSuccessStreak, currentSuccessStreak);
        } else {
            totalFailureDays++;
            currentFailureStreak++;
            currentSuccessStreak = 0;
            longestFailureStreak = Math.max(longestFailureStreak, currentFailureStreak);
        }
    });

    return {
        current_success_streak: currentSuccessStreak,
        current_failure_streak: currentFailureStreak,
        longest_success_streak: longestSuccessStreak,
        longest_failure_streak: longestFailureStreak,
        total_success_days: totalSuccessDays,
        total_failure_days: totalFailureDays,
    };
}

// 일일 소비 요약 (목표 대비)
export async function getDailySpendingSummary(date: string): Promise<DailySpendingSummary> {
    const supabase = createClient();
    
    // 해당 날짜의 소비 상태 조회
    const { data: status, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .eq("date", date)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(`일일 소비 요약 조회 실패: ${error.message}`);
    }

    if (!status) {
        return {
            date,
            has_spending: false,
            total_amount: 0,
            is_goal_achieved: null,
            daily_goal: null,
            difference: null,
            status: 'no_record',
        };
    }

    // 상태 판단
    let summaryStatus: 'success' | 'failure' | 'no_goal' | 'no_record';
    if (status.is_goal_achieved === null) {
        summaryStatus = 'no_goal';
    } else if (status.is_goal_achieved) {
        summaryStatus = 'success';
    } else {
        summaryStatus = 'failure';
    }

    return {
        date: status.date,
        has_spending: status.has_spending,
        total_amount: status.total_amount,
        is_goal_achieved: status.is_goal_achieved,
        daily_goal: status.daily_goal,
        difference: status.daily_goal ? status.total_amount - status.daily_goal : null,
        status: summaryStatus,
    };
}

// 월별 목표 달성 히스토리
export async function getMonthlyGoalHistory(year: number, month: number): Promise<GoalAchievement[]> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data: achievements, error } = await supabase
        .from("goal_achievements")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

    if (error) {
        throw new Error(`월별 목표 달성 히스토리 조회 실패: ${error.message}`);
    }

    return achievements || [];
}
