import { createClient } from "@/utils/supabase/client";
import { getMonthlyExpenseStats } from "./expenses";
import { getMonthlyIncomeStats, getMonthlyBalance } from "./incomes";
import { getMonthlyCategoryStats } from "./categories";
import { getMonthlyPaymentMethodStats } from "./paymentMethods";
import { getMonthlyGoalStats, getConsecutiveGoalRecords } from "./dailySpendingStatus";

export interface DashboardSummary {
    year: number;
    month: number;
    // 지출 통계
    expense_stats: {
        total_amount: number;
        fixed_expense_amount: number;
        necessary_expense_amount: number;
        unnecessary_expense_amount: number;
        regular_expense_amount: number;
        total_count: number;
        category_stats: Array<{
            name: string;
            amount: number;
            count: number;
        }>;
        payment_method_stats: Array<{
            name: string;
            type: string;
            amount: number;
            count: number;
        }>;
    };
    // 수입 통계
    income_stats: {
        total_amount: number;
        total_count: number;
        average_amount: number;
        highest_amount: number;
        lowest_amount: number;
    };
    // 수입-지출 차액
    balance: {
        total_income: number;
        total_expense: number;
        balance: number;
        is_positive: boolean;
    };
    // 카테고리별 통계
    category_stats: Array<{
        category_id: string;
        category_name: string;
        category_color: string;
        category_icon?: string;
        total_amount: number;
        expense_count: number;
        percentage: number;
    }>;
    // 결제 수단별 통계
    payment_method_stats: Array<{
        payment_method_id: string;
        payment_method_name: string;
        payment_method_type: string;
        payment_method_color: string;
        payment_method_icon?: string;
        total_amount: number;
        expense_count: number;
        percentage: number;
    }>;
    // 목표 달성 통계
    goal_stats: {
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
    };
    // 연속 기록
    consecutive_records: {
        current_success_streak: number;
        current_failure_streak: number;
        longest_success_streak: number;
        longest_failure_streak: number;
        total_success_days: number;
        total_failure_days: number;
    };
}

// 월별 대시보드 요약 정보
export async function getMonthlyDashboardSummary(year: number, month: number): Promise<DashboardSummary> {
    try {
        // 모든 통계 정보를 병렬로 조회
        const [
            expenseStats,
            incomeStats,
            balance,
            categoryStats,
            paymentMethodStats,
            goalStats,
            consecutiveRecords
        ] = await Promise.all([
            getMonthlyExpenseStats(year, month),
            getMonthlyIncomeStats(year, month),
            getMonthlyBalance(year, month),
            getMonthlyCategoryStats(year, month),
            getMonthlyPaymentMethodStats(year, month),
            getMonthlyGoalStats(year, month),
            getConsecutiveGoalRecords()
        ]);

        return {
            year,
            month,
            expense_stats: expenseStats,
            income_stats: incomeStats,
            balance,
            category_stats: categoryStats,
            payment_method_stats: paymentMethodStats,
            goal_stats: goalStats,
            consecutive_records: consecutiveRecords,
        };
    } catch (error) {
        throw new Error(`월별 대시보드 요약 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}

// 오늘의 소비 현황 요약
export async function getTodaySummary(): Promise<{
    date: string;
    has_spending: boolean;
    total_amount: number;
    is_goal_achieved: boolean | null;
    daily_goal: number | null;
    difference: number | null;
    status: 'success' | 'failure' | 'no_goal' | 'no_record';
    remaining_budget: number | null;
    spending_percentage: number | null;
}> {
    const supabase = createClient();
    
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘의 소비 상태 조회
    const { data: status, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .eq("date", today)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(`오늘의 소비 현황 조회 실패: ${error.message}`);
    }

    if (!status) {
        // 오늘 기록이 없는 경우 기본값 반환
        const { data: userGoal, error: goalError } = await supabase
            .from("user_goals")
            .select("daily_goal")
            .single();

        if (goalError && goalError.code !== "PGRST116") {
            throw new Error(`일일 목표 조회 실패: ${goalError.message}`);
        }

        const dailyGoal = userGoal?.daily_goal || null;
        
        return {
            date: today,
            has_spending: false,
            total_amount: 0,
            is_goal_achieved: null,
            daily_goal: dailyGoal,
            difference: null,
            status: 'no_record',
            remaining_budget: dailyGoal,
            spending_percentage: 0,
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

    // 남은 예산 및 지출 비율 계산
    const remainingBudget = status.daily_goal ? Math.max(0, status.daily_goal - status.total_amount) : null;
    const spendingPercentage = status.daily_goal ? Math.round((status.total_amount / status.daily_goal) * 100) : null;

    return {
        date: status.date,
        has_spending: status.has_spending,
        total_amount: status.total_amount,
        is_goal_achieved: status.is_goal_achieved,
        daily_goal: status.daily_goal,
        difference: status.daily_goal ? status.total_amount - status.daily_goal : null,
        status: summaryStatus,
        remaining_budget: remainingBudget,
        spending_percentage: spendingPercentage,
    };
}

// 주간 소비 현황 요약
export async function getWeeklySummary(year: number, month: number, weekStart: number): Promise<{
    week_start: number;
    week_end: number;
    total_amount: number;
    average_daily_amount: number;
    days_with_spending: number;
    days_without_spending: number;
    goal_achieved_days: number;
    goal_failed_days: number;
    success_rate: number;
    weekly_trend: 'improving' | 'declining' | 'stable';
}> {
    const supabase = createClient();
    
    // 해당 주의 시작일과 종료일 계산
    const weekStartDate = new Date(year, month - 1, weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    const startDate = weekStartDate.toISOString().split('T')[0];
    const endDate = weekEndDate.toISOString().split('T')[0];

    // 해당 주의 소비 상태 조회
    const { data: statuses, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

    if (error) {
        throw new Error(`주간 소비 현황 조회 실패: ${error.message}`);
    }

    const statusesList = statuses || [];
    
    // 주간 통계 계산
    const stats = {
        week_start: weekStart,
        week_end: weekStart + 6,
        total_amount: 0,
        average_daily_amount: 0,
        days_with_spending: 0,
        days_without_spending: 0,
        goal_achieved_days: 0,
        goal_failed_days: 0,
        success_rate: 0,
        weekly_trend: 'stable' as 'improving' | 'declining' | 'stable',
    };

    statusesList.forEach(status => {
        stats.total_amount += status.total_amount;
        
        if (status.has_spending) {
            stats.days_with_spending++;
        } else {
            stats.days_without_spending++;
        }

        if (status.is_goal_achieved === true) {
            stats.goal_achieved_days++;
        } else if (status.is_goal_achieved === false) {
            stats.goal_failed_days++;
        }
    });

    // 평균 일일 지출액 계산
    stats.average_daily_amount = stats.days_with_spending > 0 
        ? Math.round(stats.total_amount / stats.days_with_spending) 
        : 0;

    // 성공률 계산
    const totalGoalDays = stats.goal_achieved_days + stats.goal_failed_days;
    stats.success_rate = totalGoalDays > 0 ? Math.round((stats.goal_achieved_days / totalGoalDays) * 100) : 0;

    // 주간 트렌드 계산 (간단한 로직)
    if (stats.success_rate >= 70) {
        stats.weekly_trend = 'improving';
    } else if (stats.success_rate <= 30) {
        stats.weekly_trend = 'declining';
    } else {
        stats.weekly_trend = 'stable';
    }

    return stats;
}
