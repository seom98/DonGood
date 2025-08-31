-- 소비-결제수단 연결 테이블 생성
CREATE TABLE IF NOT EXISTS expense_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(expense_id, payment_method_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_expense_payment_methods_expense_id ON expense_payment_methods(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_payment_methods_payment_method_id ON expense_payment_methods(payment_method_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE expense_payment_methods ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 소비-결제수단 연결만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own expense payment methods" ON expense_payment_methods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 소비-결제수단 연결만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own expense payment methods" ON expense_payment_methods
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 소비-결제수단 연결만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own expense payment methods" ON expense_payment_methods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- 사용자는 자신의 소비-결제수단 연결만 삭제할 수 있도록 정책 설정
CREATE POLICY "Users can delete own expense payment methods" ON expense_payment_methods
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

