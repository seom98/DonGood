import { createClient } from "@/utils/supabase/client";

export interface Income {
    id: string;
    user_id: string;
    amount: number;
    name: string;
    memo?: string;
    income_date: string; // YYYY-MM-DD 형식
    created_at: string;
    updated_at: string;
}

export interface CreateIncomeData {
    amount: number;
    name: string;
    memo?: string;
    income_date: string;
}

export interface UpdateIncomeData extends Partial<CreateIncomeData> {
    id: string;
}

export interface DailyIncomeSummary {
    date: string;
    total_amount: number;
    income_count: number;
}

// 수입 기록 생성
export async function createIncome(data: CreateIncomeData): Promise<Income> {
    const supabase = createClient();
    
    const { data: income, error } = await supabase
        .from("incomes")
        .insert({
            amount: data.amount,
            name: data.name,
            memo: data.memo || null,
            income_date: data.income_date,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`수입 기록 생성 실패: ${error.message}`);
    }

    return income;
}

// 수입 기록 조회 (월별)
export async function getIncomesByMonth(year: number, month: number): Promise<Income[]> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data: incomes, error } = await supabase
        .from("incomes")
        .select("*")
        .gte("income_date", startDate)
        .lte("income_date", endDate)
        .order("income_date", { ascending: false });

    if (error) {
        throw new Error(`수입 기록 조회 실패: ${error.message}`);
    }

    return incomes || [];
}

// 수입 기록 조회 (날짜별)
export async function getIncomesByDate(date: string): Promise<Income[]> {
    const supabase = createClient();
    
    const { data: incomes, error } = await supabase
        .from("incomes")
        .select("*")
        .eq("income_date", date)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`수입 기록 조회 실패: ${error.message}`);
    }

    return incomes || [];
}

// 수입 기록 수정
export async function updateIncome(data: UpdateIncomeData): Promise<Income> {
    const supabase = createClient();
    
    const { id, ...updateData } = data;
    
    const { data: income, error } = await supabase
        .from("incomes")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(`수입 기록 수정 실패: ${error.message}`);
    }

    return income;
}

// 수입 기록 삭제
export async function deleteIncome(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("incomes")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(`수입 기록 삭제 실패: ${error.message}`);
    }
}

// 날짜별 수입 요약
export async function getDailyIncomeSummary(date: string): Promise<DailyIncomeSummary> {
    const supabase = createClient();
    
    const { data: incomes, error } = await supabase
        .from("incomes")
        .select("amount")
        .eq("income_date", date);

    if (error) {
        throw new Error(`일일 수입 요약 조회 실패: ${error.message}`);
    }

    const totalAmount = incomes?.reduce((sum, income) => sum + income.amount, 0) || 0;
    const incomeCount = incomes?.length || 0;

    return {
        date,
        total_amount: totalAmount,
        income_count: incomeCount,
    };
}

// 월별 수입 통계
export async function getMonthlyIncomeStats(year: number, month: number) {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data: incomes, error } = await supabase
        .from("incomes")
        .select("*")
        .gte("income_date", startDate)
        .lte("income_date", endDate);

    if (error) {
        throw new Error(`월별 수입 통계 조회 실패: ${error.message}`);
    }

    const incomesList = incomes || [];
    
    const stats = {
        total_amount: 0,
        total_count: incomesList.length,
        average_amount: 0,
        highest_amount: 0,
        lowest_amount: 0,
    };

    if (incomesList.length > 0) {
        stats.total_amount = incomesList.reduce((sum, income) => sum + income.amount, 0);
        stats.average_amount = Math.round(stats.total_amount / incomesList.length);
        stats.highest_amount = Math.max(...incomesList.map(income => income.amount));
        stats.lowest_amount = Math.min(...incomesList.map(income => income.amount));
    }

    return stats;
}

// 월별 수입-지출 차액 계산
export async function getMonthlyBalance(year: number, month: number) {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    // 월별 수입 합계
    const { data: incomes, error: incomeError } = await supabase
        .from("incomes")
        .select("amount")
        .gte("income_date", startDate)
        .lte("income_date", endDate);

    if (incomeError) {
        throw new Error(`월별 수입 조회 실패: ${incomeError.message}`);
    }

    // 월별 지출 합계 (고정지출, 쓸수밖에없었던지출 제외)
    const { data: expenses, error: expenseError } = await supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .eq("is_fixed_expense", false)
        .eq("is_necessary_expense", false);

    if (expenseError) {
        throw new Error(`월별 지출 조회 실패: ${expenseError.message}`);
    }

    const totalIncome = incomes?.reduce((sum, income) => sum + income.amount, 0) || 0;
    const totalExpense = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const balance = totalIncome - totalExpense;

    return {
        year,
        month,
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance,
        is_positive: balance >= 0,
    };
}
