import { createClient } from "@/utils/supabase/client";

export interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string;
    icon?: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryData {
    name: string;
    color?: string;
    icon?: string;
    is_default?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id: string;
}

export interface CategoryExpenseStats {
    category_id: string;
    category_name: string;
    category_color: string;
    category_icon?: string;
    total_amount: number;
    expense_count: number;
    percentage: number; // 전체 지출 대비 비율
}

// 카테고리 생성
export async function createCategory(data: CreateCategoryData): Promise<Category> {
    const supabase = createClient();
    
    const { data: category, error } = await supabase
        .from("categories")
        .insert({
            name: data.name,
            color: data.color || '#3B82F6',
            icon: data.icon || null,
            is_default: data.is_default || false,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`카테고리 생성 실패: ${error.message}`);
    }

    return category;
}

// 사용자의 모든 카테고리 조회
export async function getUserCategories(): Promise<Category[]> {
    const supabase = createClient();
    
    const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");

    if (error) {
        throw new Error(`카테고리 조회 실패: ${error.message}`);
    }

    return categories || [];
}

// 카테고리 수정
export async function updateCategory(data: UpdateCategoryData): Promise<Category> {
    const supabase = createClient();
    
    const { id, ...updateData } = data;
    
    const { data: category, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(`카테고리 수정 실패: ${error.message}`);
    }

    return category;
}

// 카테고리 삭제
export async function deleteCategory(id: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(`카테고리 삭제 실패: ${error.message}`);
    }
}

// 지출에 카테고리 할당
export async function assignCategoryToExpense(expenseId: string, categoryId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("expense_categories")
        .insert({
            expense_id: expenseId,
            category_id: categoryId,
        });

    if (error) {
        throw new Error(`카테고리 할당 실패: ${error.message}`);
    }
}

// 지출에서 카테고리 제거
export async function removeCategoryFromExpense(expenseId: string, categoryId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
        .from("expense_categories")
        .delete()
        .eq("expense_id", expenseId)
        .eq("category_id", categoryId);

    if (error) {
        throw new Error(`카테고리 제거 실패: ${error.message}`);
    }
}

// 지출의 모든 카테고리 조회
export async function getExpenseCategories(expenseId: string): Promise<Category[]> {
    const supabase = createClient();
    
    const { data: expenseCategories, error } = await supabase
        .from("expense_categories")
        .select(`
            category_id,
            categories (
                id,
                name,
                color,
                icon,
                is_default
            )
        `)
        .eq("expense_id", expenseId);

    if (error) {
        throw new Error(`지출 카테고리 조회 실패: ${error.message}`);
    }

    // 타입 안전하게 카테고리 정보 추출
    const categories: Category[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (expenseCategories || []).forEach((ec: any) => {
        if (ec.categories) {
            categories.push({
                id: ec.categories.id,
                user_id: '', // join에서는 user_id가 없으므로 빈 문자열
                name: ec.categories.name,
                color: ec.categories.color,
                icon: ec.categories.icon,
                is_default: ec.categories.is_default || false,
                created_at: '',
                updated_at: '',
            });
        }
    });
    
    return categories;
}

// 월별 카테고리별 지출 통계
export async function getMonthlyCategoryStats(year: number, month: number): Promise<CategoryExpenseStats[]> {
    const supabase = createClient();
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    // 해당 월의 모든 지출과 카테고리 정보 조회
    const { data: expenses, error } = await supabase
        .from("expenses")
        .select(`
            id,
            amount,
            expense_categories (
                category_id,
                categories (
                    id,
                    name,
                    color,
                    icon
                )
            )
        `)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate);

    if (error) {
        throw new Error(`월별 카테고리 통계 조회 실패: ${error.message}`);
    }

    const expensesList = expenses || [];
    
    // 카테고리별 통계 계산
    const categoryStats = new Map<string, CategoryExpenseStats>();
    let totalAmount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expensesList.forEach((expense: any) => {
        const expenseCategories = expense.expense_categories || [];
        
        if (expenseCategories.length === 0) {
            // 카테고리가 없는 경우 '기타'로 분류
            const otherKey = 'other';
            if (!categoryStats.has(otherKey)) {
                categoryStats.set(otherKey, {
                    category_id: otherKey,
                    category_name: '기타',
                    category_color: '#6B7280',
                    total_amount: 0,
                    expense_count: 0,
                    percentage: 0,
                });
            }
            
            const otherStats = categoryStats.get(otherKey)!;
            otherStats.total_amount += expense.amount;
            otherStats.expense_count += 1;
            totalAmount += expense.amount;
        } else {
            // 각 카테고리별로 통계 계산
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expenseCategories.forEach((ec: any) => {
                const category = ec.categories;
                if (category) {
                    const categoryKey = category.id;
                    
                    if (!categoryStats.has(categoryKey)) {
                        categoryStats.set(categoryKey, {
                            category_id: category.id,
                            category_name: category.name,
                            category_color: category.color,
                            category_icon: category.icon,
                            total_amount: 0,
                            expense_count: 0,
                            percentage: 0,
                        });
                    }
                    
                    const stats = categoryStats.get(categoryKey)!;
                    stats.total_amount += expense.amount;
                    stats.expense_count += 1;
                    totalAmount += expense.amount;
                }
            });
        }
    });

    // 비율 계산 및 정렬
    const result = Array.from(categoryStats.values()).map(stats => ({
        ...stats,
        percentage: totalAmount > 0 ? Math.round((stats.total_amount / totalAmount) * 100) : 0,
    })).sort((a, b) => b.total_amount - a.total_amount);

    return result;
}

// 기본 카테고리 생성 (사용자 가입 시 호출)
export async function createDefaultCategories(): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase.rpc('create_default_categories');
    
    if (error) {
        throw new Error(`기본 카테고리 생성 실패: ${error.message}`);
    }
}
