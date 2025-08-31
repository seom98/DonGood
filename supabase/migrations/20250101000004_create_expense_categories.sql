-- 소비-카테고리 연결 테이블 생성
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(expense_id, category_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_expense_categories_expense_id ON expense_categories(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_category_id ON expense_categories(category_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 소비-카테고리 연결만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own expense categories" ON expense_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_categories.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 소비-카테고리 연결만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own expense categories" ON expense_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_categories.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 소비-카테고리 연결만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own expense categories" ON expense_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_categories.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 소비-카테고리 연결만 삭제할 수 있도록 정책 설정
CREATE POLICY "Users can delete own expense categories" ON expense_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_categories.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

