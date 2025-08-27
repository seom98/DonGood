import { createClient } from "@/utils/supabase/client";
import { Category } from "./categories";
import { PaymentMethod } from "./paymentMethods";

export interface Expense {
    id: string;
    user_id: string;
    amount: number;
    name: string;
    memo?: string;
    expense_date: string; // YYYY-MM-DD 형식
    is_fixed_expense: boolean;
    is_necessary_expense: boolean;
    is_unnecessary_expense: boolean;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
    categories?: Category[]; // 카테고리 정보 포함
    payment_methods?: PaymentMethod[]; // 결제 수단 정보 포함
}

export interface CreateExpenseData {
    amount: number;
    name: string;
    memo?: string;
    expense_date: string;
    is_fixed_expense?: boolean;
    is_necessary_expense?: boolean;
    is_unnecessary_expense?: boolean;
    is_favorite?: boolean;
    category_ids?: string[]; // 카테고리 ID 배열
    payment_method_ids?: string[]; // 결제 수단 ID 배열
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
    id: string;
}

export interface DailyExpenseSummary {
    date: string;
    total_amount: number;
    is_over_budget: boolean;
    daily_goal: number;
}

// Supabase join 쿼리 결과 타입 정의
interface ExpenseJoinResult {
    id: string;
    user_id: string;
    amount: number;
    name: string;
    memo?: string;
    expense_date: string;
    is_fixed_expense: boolean;
    is_necessary_expense: boolean;
    is_unnecessary_expense: boolean;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
    expense_categories: Array<{
        category_id: string;
        categories: {
            id: string;
            name: string;
            color: string;
            icon?: string;
            is_default?: boolean;
        } | null;
    }> | null;
    expense_payment_methods: Array<{
        payment_method_id: string;
        payment_methods: {
            id: string;
            name: string;
            type: string;
            card_name?: string;
            color: string;
            icon?: string;
            is_default?: boolean;
        } | null;
    }> | null;
}

// 지출 기록 생성 (카테고리 + 결제 수단 포함 + 일일 소비 상태 자동 업데이트)
export async function createExpense(data: CreateExpenseData): Promise<Expense> {
    const supabase = createClient();
    
    const { category_ids, payment_method_ids, ...expenseData } = data;
    
    // 지출 기록 생성
    const { data: expense, error } = await supabase
        .from("expenses")
        .insert({
            amount: expenseData.amount,
            name: expenseData.name,
            memo: expenseData.memo || null,
            expense_date: expenseData.expense_date,
            is_fixed_expense: expenseData.is_fixed_expense || false,
            is_necessary_expense: expenseData.is_necessary_expense || false,
            is_unnecessary_expense: expenseData.is_unnecessary_expense || false,
            is_favorite: expenseData.is_favorite || false,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`지출 기록 생성 실패: ${error.message}`);
    }

    // 카테고리 할당
    if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
            await supabase
                .from("expense_categories")
                .insert({
                    expense_id: expense.id,
                    category_id: categoryId,
                });
        }
    }

    // 결제 수단 할당
    if (payment_method_ids && payment_method_ids.length > 0) {
        for (const paymentMethodId of payment_method_ids) {
            await supabase
                .from("expense_payment_methods")
                .insert({
                    expense_id: expense.id,
                    payment_method_id: paymentMethodId,
                });
        }
    }

    // 일일 소비 상태는 트리거로 자동 업데이트됨
    // 별도로 API 호출할 필요 없음

    return expense;
}

// 지출 기록 조회 (월별, 카테고리 + 결제 수단 포함)
export async function getExpensesByMonth(year: number, month: number): Promise<Expense[]> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
            *,
            expense_categories (
                category_id,
                categories (
                    id,
                    name,
                    color,
                    icon,
                    is_default
                )
            ),
            expense_payment_methods (
                payment_method_id,
                payment_methods (
                    id,
                    name,
                    type,
                    card_name,
                    color,
                    icon,
                    is_default
                )
            )
        `)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .order("expense_date", { ascending: false });

    if (error) {
        throw new Error(`지출 기록 조회 실패: ${error.message}`);
    }

    // 카테고리와 결제 수단 정보 정리
    return (expenses || []).map((expense: ExpenseJoinResult) => ({
        ...expense,
        categories: (expense.expense_categories || [])
            .map((ec) => ec.categories)
            .filter((cat): cat is NonNullable<typeof cat> => cat !== null)
            .map((cat) => ({
                id: cat.id,
                user_id: '',
                name: cat.name,
                color: cat.color,
                icon: cat.icon,
                is_default: cat.is_default || false,
                created_at: '',
                updated_at: '',
            })),
        payment_methods: (expense.expense_payment_methods || [])
            .map((epm) => epm.payment_methods)
            .filter((pm): pm is NonNullable<typeof pm> => pm !== null)
            .map((pm) => ({
                id: pm.id,
                user_id: '',
                name: pm.name,
                type: pm.type as 'card' | 'cash' | 'transfer' | 'digital',
                card_name: pm.card_name,
                color: pm.color,
                icon: pm.icon,
                is_default: pm.is_default || false,
                created_at: '',
                updated_at: '',
            })),
    }));
}

// 지출 기록 조회 (날짜별, 카테고리 + 결제 수단 포함)
export async function getExpensesByDate(date: string): Promise<Expense[]> {
    const supabase = createClient();
    
    const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
            *,
            expense_categories (
                category_id,
                categories (
                    id,
                    name,
                    color,
                    icon,
                    is_default
                )
            ),
            expense_payment_methods (
                payment_method_id,
                payment_methods (
                    id,
                    name,
                    type,
                    card_name,
                    color,
                    icon,
                    is_default
                )
            )
        `)
        .eq("expense_date", date)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`지출 기록 조회 실패: ${error.message}`);
    }

    // 카테고리와 결제 수단 정보 정리
    return (expenses || []).map((expense: ExpenseJoinResult) => ({
        ...expense,
        categories: (expense.expense_categories || [])
            .map((ec) => ec.categories)
            .filter((cat): cat is NonNullable<typeof cat> => cat !== null)
            .map((cat) => ({
                id: cat.id,
                user_id: '',
                name: cat.name,
                color: cat.color,
                icon: cat.icon,
                is_default: cat.is_default || false,
                created_at: '',
                updated_at: '',
            })),
        payment_methods: (expense.expense_payment_methods || [])
            .map((epm) => epm.payment_methods)
            .filter((pm): pm is NonNullable<typeof pm> => pm !== null)
            .map((pm) => ({
                id: pm.id,
                user_id: '',
                name: pm.name,
                type: pm.type as 'card' | 'cash' | 'transfer' | 'digital',
                card_name: pm.card_name,
                color: pm.color,
                icon: pm.icon,
                is_default: pm.is_default || false,
                created_at: '',
                updated_at: '',
            })),
    }));
}

// 지출 기록 수정 (카테고리 + 결제 수단 포함 + 일일 소비 상태 자동 업데이트)
export async function updateExpense(data: UpdateExpenseData): Promise<Expense> {
    const supabase = createClient();
    
    const { id, category_ids, payment_method_ids, ...updateData } = data;
    
    // 지출 기록 수정
    const { data: expense, error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(`지출 기록 수정 실패: ${error.message}`);
    }

    // 카테고리 업데이트
    if (category_ids !== undefined) {
        // 기존 카테고리 모두 제거
        await supabase
            .from("expense_categories")
            .delete()
            .eq("expense_id", id);

        // 새로운 카테고리 할당
        if (category_ids.length > 0) {
            for (const categoryId of category_ids) {
                await supabase
                    .from("expense_categories")
                    .insert({
                        expense_id: id,
                        category_id: categoryId,
                    });
            }
        }
    }

    // 결제 수단 업데이트
    if (payment_method_ids !== undefined) {
        // 기존 결제 수단 모두 제거
        await supabase
            .from("expense_payment_methods")
            .delete()
            .eq("expense_id", id);

        // 새로운 결제 수단 할당
        if (payment_method_ids.length > 0) {
            for (const paymentMethodId of payment_method_ids) {
                await supabase
                    .from("expense_payment_methods")
                    .insert({
                        expense_id: id,
                        payment_method_id: paymentMethodId,
                    });
            }
        }
    }

    // 일일 소비 상태는 트리거로 자동 업데이트됨

    return expense;
}

// 지출 기록 삭제 (일일 소비 상태 자동 업데이트)
export async function deleteExpense(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(`지출 기록 삭제 실패: ${error.message}`);
    }

    // 일일 소비 상태는 트리거로 자동 업데이트됨
}

// 즐겨찾기 지출 조회 (카테고리 + 결제 수단 포함)
export async function getFavoriteExpenses(): Promise<Expense[]> {
    const supabase = createClient();
    
    const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
            *,
            expense_categories (
                category_id,
                categories (
                    id,
                    name,
                    color,
                    icon,
                    is_default
                )
            ),
            expense_payment_methods (
                payment_method_id,
                payment_methods (
                    id,
                    name,
                    type,
                    card_name,
                    color,
                    icon,
                    is_default
                )
            )
        `)
        .eq("is_favorite", true)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`즐겨찾기 지출 조회 실패: ${error.message}`);
    }

    // 카테고리와 결제 수단 정보 정리
    return (expenses || []).map((expense: ExpenseJoinResult) => ({
        ...expense,
        categories: (expense.expense_categories || [])
            .map((ec) => ec.categories)
            .filter((cat): cat is NonNullable<typeof cat> => cat !== null)
            .map((cat) => ({
                id: cat.id,
                user_id: '',
                name: cat.name,
                color: cat.color,
                icon: cat.icon,
                is_default: cat.is_default || false,
                created_at: '',
                updated_at: '',
            })),
        payment_methods: (expense.expense_payment_methods || [])
            .map((epm) => epm.payment_methods)
            .filter((pm): pm is NonNullable<typeof pm> => pm !== null)
            .map((pm) => ({
                id: pm.id,
                user_id: '',
                name: pm.name,
                type: pm.type as 'card' | 'cash' | 'transfer' | 'digital',
                card_name: pm.card_name,
                color: pm.color,
                icon: pm.icon,
                is_default: pm.is_default || false,
                created_at: '',
                updated_at: '',
            })),
    }));
}

// 날짜별 지출 요약 (일일 목표 대비) - 이제 daily_spending_status 테이블 사용
export async function getDailyExpenseSummary(date: string): Promise<DailyExpenseSummary> {
    const supabase = createClient();
    
    // daily_spending_status 테이블에서 해당 날짜 정보 조회
    const { data: status, error } = await supabase
        .from("daily_spending_status")
        .select("*")
        .eq("date", date)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(`일일 지출 요약 조회 실패: ${error.message}`);
    }

    if (!status) {
        // 해당 날짜에 기록이 없는 경우 기본값 반환
        const { data: userGoal, error: goalError } = await supabase
            .from("user_goals")
            .select("daily_goal")
            .single();

        if (goalError && goalError.code !== "PGRST116") {
            throw new Error(`일일 목표 조회 실패: ${goalError.message}`);
        }

        const dailyGoal = userGoal?.daily_goal || 0;
        
        return {
            date,
            total_amount: 0,
            is_over_budget: false,
            daily_goal: dailyGoal,
        };
    }

    return {
        date: status.date,
        total_amount: status.total_amount,
        is_over_budget: status.is_goal_achieved === false,
        daily_goal: status.daily_goal || 0,
    };
}

// 월별 지출 통계 (카테고리별 + 결제 수단별 포함)
export async function getMonthlyExpenseStats(year: number, month: number) {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
            *,
            expense_categories (
                category_id,
                categories (
                    id,
                    name,
                    color,
                    icon
                )
            ),
            expense_payment_methods (
                payment_method_id,
                payment_methods (
                    id,
                    name,
                    type,
                    color,
                    icon
                )
            )
        `)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate);

    if (error) {
        throw new Error(`월별 지출 통계 조회 실패: ${error.message}`);
    }

    const expensesList = expenses || [];
    
    const stats = {
        total_amount: 0,
        fixed_expense_amount: 0,
        necessary_expense_amount: 0,
        unnecessary_expense_amount: 0,
        regular_expense_amount: 0,
        total_count: expensesList.length,
        category_stats: new Map<string, { name: string; amount: number; count: number }>(),
        payment_method_stats: new Map<string, { name: string; type: string; amount: number; count: number }>(),
    };

    expensesList.forEach((expense: ExpenseJoinResult) => {
        stats.total_amount += expense.amount;
        
        if (expense.is_fixed_expense) {
            stats.fixed_expense_amount += expense.amount;
        } else if (expense.is_necessary_expense) {
            stats.necessary_expense_amount += expense.amount;
        } else if (expense.is_unnecessary_expense) {
            stats.unnecessary_expense_amount += expense.amount;
        } else {
            stats.regular_expense_amount += expense.amount;
        }

        // 카테고리별 통계
        const categories = (expense.expense_categories || [])
            .map((ec) => ec.categories)
            .filter((cat): cat is NonNullable<typeof cat> => cat !== null);
            
        if (categories.length === 0) {
            // 카테고리가 없는 경우 '기타'로 분류
            const otherKey = 'other';
            if (!stats.category_stats.has(otherKey)) {
                stats.category_stats.set(otherKey, { name: '기타', amount: 0, count: 0 });
            }
            const otherStats = stats.category_stats.get(otherKey)!;
            otherStats.amount += expense.amount;
            otherStats.count += 1;
        } else {
            categories.forEach((category) => {
                if (!stats.category_stats.has(category.id)) {
                    stats.category_stats.set(category.id, { 
                        name: category.name, 
                        amount: 0, 
                        count: 0 
                    });
                }
                const categoryStats = stats.category_stats.get(category.id)!;
                categoryStats.amount += expense.amount;
                categoryStats.count += 1;
            });
        }

        // 결제 수단별 통계
        const paymentMethods = (expense.expense_payment_methods || [])
            .map((epm) => epm.payment_methods)
            .filter((pm): pm is NonNullable<typeof pm> => pm !== null);
            
        if (paymentMethods.length === 0) {
            // 결제 수단이 없는 경우 '기타'로 분류
            const otherKey = 'other';
            if (!stats.payment_method_stats.has(otherKey)) {
                stats.payment_method_stats.set(otherKey, { name: '기타', type: 'unknown', amount: 0, count: 0 });
            }
            const otherStats = stats.payment_method_stats.get(otherKey)!;
            otherStats.amount += expense.amount;
            otherStats.count += 1;
        } else {
            paymentMethods.forEach((paymentMethod) => {
                if (!stats.payment_method_stats.has(paymentMethod.id)) {
                    stats.payment_method_stats.set(paymentMethod.id, { 
                        name: paymentMethod.name, 
                        type: paymentMethod.type,
                        amount: 0, 
                        count: 0 
                    });
                }
                const paymentMethodStats = stats.payment_method_stats.get(paymentMethod.id)!;
                paymentMethodStats.amount += expense.amount;
                paymentMethodStats.count += 1;
            });
        }
    });

    return {
        ...stats,
        category_stats: Array.from(stats.category_stats.values()).sort((a, b) => b.amount - a.amount),
        payment_method_stats: Array.from(stats.payment_method_stats.values()).sort((a, b) => b.amount - a.amount),
    };
}

