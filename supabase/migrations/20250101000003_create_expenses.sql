-- 소비 기록 테이블 생성
CREATE TABLE IF NOT EXISTS expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL, -- 소비명
    amount INTEGER NOT NULL,    -- 소비금액
    memo TEXT,                  -- 메모
    expense_date DATE NOT NULL, -- 지출 날짜 (시간 없음)
    expense_type INTEGER NOT NULL, -- 소비형태 (1:일반, 2:고정, 3:낭비, 4:특수)
    is_favorite BOOLEAN DEFAULT FALSE, -- 즐겨찾기 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT check_expense_type CHECK (expense_type >= 1 AND expense_type <= 4)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_type ON expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_user_type ON expenses(user_id, expense_type);

-- RLS (Row Level Security) 활성화
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 지출만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 지출만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 지출만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 지출만 삭제할 수 있도록 정책 설정
CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

