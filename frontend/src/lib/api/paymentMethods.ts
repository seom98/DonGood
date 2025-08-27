import { createClient } from "@/utils/supabase/client";

export interface PaymentMethod {
    id: string;
    user_id: string;
    name: string;
    type: 'card' | 'cash' | 'transfer' | 'digital';
    card_name?: string;
    color: string;
    icon?: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentMethodData {
    name: string;
    type: 'card' | 'cash' | 'transfer' | 'digital';
    card_name?: string;
    color?: string;
    icon?: string;
    is_default?: boolean;
}

export interface UpdatePaymentMethodData extends Partial<CreatePaymentMethodData> {
    id: string;
}

export interface PaymentMethodExpenseStats {
    payment_method_id: string;
    payment_method_name: string;
    payment_method_type: string;
    payment_method_color: string;
    payment_method_icon?: string;
    total_amount: number;
    expense_count: number;
    percentage: number;
}

// 결제 수단 생성
export async function createPaymentMethod(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    const supabase = createClient();
    
    const { data: paymentMethod, error } = await supabase
        .from("payment_methods")
        .insert({
            name: data.name,
            type: data.type,
            card_name: data.card_name || null,
            color: data.color || '#3B82F6',
            icon: data.icon || null,
            is_default: data.is_default || false,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`결제 수단 생성 실패: ${error.message}`);
    }

    return paymentMethod;
}

// 사용자의 모든 결제 수단 조회
export async function getUserPaymentMethods(): Promise<PaymentMethod[]> {
    const supabase = createClient();
    
    const { data: paymentMethods, error } = await supabase
        .from("payment_methods")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

    if (error) {
        throw new Error(`결제 수단 조회 실패: ${error.message}`);
    }

    return paymentMethods || [];
}

// 결제 수단 수정
export async function updatePaymentMethod(data: UpdatePaymentMethodData): Promise<PaymentMethod> {
    const supabase = createClient();
    
    const { id, ...updateData } = data;
    
    const { data: paymentMethod, error } = await supabase
        .from("payment_methods")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(`결제 수단 수정 실패: ${error.message}`);
    }

    return paymentMethod;
}

// 결제 수단 삭제
export async function deletePaymentMethod(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(`결제 수단 삭제 실패: ${error.message}`);
    }
}

// 지출에 결제 수단 할당
export async function assignPaymentMethodToExpense(expenseId: string, paymentMethodId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("expense_payment_methods")
        .insert({
            expense_id: expenseId,
            payment_method_id: paymentMethodId,
        });

    if (error) {
        throw new Error(`결제 수단 할당 실패: ${error.message}`);
    }
}

// 지출에서 결제 수단 제거
export async function removePaymentMethodFromExpense(expenseId: string, paymentMethodId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("expense_payment_methods")
        .delete()
        .eq("expense_id", expenseId)
        .eq("payment_method_id", paymentMethodId);

    if (error) {
        throw new Error(`결제 수단 제거 실패: ${error.message}`);
    }
}

// 지출의 모든 결제 수단 조회
export async function getExpensePaymentMethods(expenseId: string): Promise<PaymentMethod[]> {
    const supabase = createClient();
    
    const { data: expensePaymentMethods, error } = await supabase
        .from("expense_payment_methods")
        .select(`
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
        `)
        .eq("expense_id", expenseId);

    if (error) {
        throw new Error(`지출 결제 수단 조회 실패: ${error.message}`);
    }

    // 타입 안전하게 결제 수단 정보 추출
    const paymentMethods: PaymentMethod[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expensePaymentMethods || []).forEach((epm: any) => {
        if (epm.payment_methods) {
            paymentMethods.push({
                id: epm.payment_methods.id,
                user_id: '', // join에서는 user_id가 없으므로 빈 문자열
                name: epm.payment_methods.name,
                type: epm.payment_methods.type,
                card_name: epm.payment_methods.card_name,
                color: epm.payment_methods.color,
                icon: epm.payment_methods.icon,
                is_default: epm.payment_methods.is_default || false,
                created_at: '',
                updated_at: '',
            });
        }
    });
    
    return paymentMethods;
}

// 월별 결제 수단별 지출 통계
export async function getMonthlyPaymentMethodStats(year: number, month: number): Promise<PaymentMethodExpenseStats[]> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    // 해당 월의 모든 지출과 결제 수단 정보 조회
    const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
            id,
            amount,
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
        throw new Error(`월별 결제 수단 통계 조회 실패: ${error.message}`);
    }

    const expensesList = expenses || [];
    
    // 결제 수단별 통계 계산
    const paymentMethodStats = new Map<string, PaymentMethodExpenseStats>();
    let totalAmount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expensesList.forEach((expense: any) => {
        const expensePaymentMethods = expense.expense_payment_methods || [];
        
        if (expensePaymentMethods.length === 0) {
            // 결제 수단이 없는 경우 '기타'로 분류
            const otherKey = 'other';
            if (!paymentMethodStats.has(otherKey)) {
                paymentMethodStats.set(otherKey, {
                    payment_method_id: otherKey,
                    payment_method_name: '기타',
                    payment_method_type: 'unknown',
                    payment_method_color: '#6B7280',
                    total_amount: 0,
                    expense_count: 0,
                    percentage: 0,
                });
            }
            
            const otherStats = paymentMethodStats.get(otherKey)!;
            otherStats.total_amount += expense.amount;
            otherStats.expense_count += 1;
            totalAmount += expense.amount;
        } else {
            // 각 결제 수단별로 통계 계산
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expensePaymentMethods.forEach((epm: any) => {
                const paymentMethod = epm.payment_methods;
                if (paymentMethod) {
                    const paymentMethodKey = paymentMethod.id;
                    
                    if (!paymentMethodStats.has(paymentMethodKey)) {
                        paymentMethodStats.set(paymentMethodKey, {
                            payment_method_id: paymentMethod.id,
                            payment_method_name: paymentMethod.name,
                            payment_method_type: paymentMethod.type,
                            payment_method_color: paymentMethod.color,
                            payment_method_icon: paymentMethod.icon,
                            total_amount: 0,
                            expense_count: 0,
                            percentage: 0,
                        });
                    }
                    
                    const stats = paymentMethodStats.get(paymentMethodKey)!;
                    stats.total_amount += expense.amount;
                    stats.expense_count += 1;
                    totalAmount += expense.amount;
                }
            });
        }
    });

    // 비율 계산 및 정렬
    const result = Array.from(paymentMethodStats.values()).map(stats => ({
        ...stats,
        percentage: totalAmount > 0 ? Math.round((stats.total_amount / totalAmount) * 100) : 0,
    })).sort((a, b) => b.total_amount - a.total_amount);

    return result;
}

// 기본 결제 수단 생성 (사용자 가입 시 호출)
export async function createDefaultPaymentMethods(): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase.rpc('create_default_payment_methods');
    
    if (error) {
        throw new Error(`기본 결제 수단 생성 실패: ${error.message}`);
    }
}
