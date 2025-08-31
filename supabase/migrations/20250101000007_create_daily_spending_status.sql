-- 일일 지출 상태 테이블 생성
CREATE TABLE IF NOT EXISTS daily_spending_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,         -- 날짜
    daily_goal INTEGER NOT NULL DEFAULT 0, -- 일일 목표금액
    total_amount INTEGER NOT NULL DEFAULT 0, -- 전체 지출금액
    goal_related_amount INTEGER NOT NULL DEFAULT 0, -- 목표 관련 지출금액
    general_expense_amount INTEGER NOT NULL DEFAULT 0, -- 일반지출 금액 (expense_type = 1)
    fixed_expense_amount INTEGER NOT NULL DEFAULT 0,   -- 고정지출 금액 (expense_type = 2)
    waste_expense_amount INTEGER NOT NULL DEFAULT 0,   -- 낭비지출 금액 (expense_type = 3)
    special_expense_amount INTEGER NOT NULL DEFAULT 0, -- 특수지출 금액 (expense_type = 4)
    is_goal_achieved BOOLEAN,   -- 목표 달성 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_daily_spending_status_user_id ON daily_spending_status(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_spending_status_date ON daily_spending_status(date);
CREATE INDEX IF NOT EXISTS idx_daily_spending_status_user_date ON daily_spending_status(user_id, date);

-- RLS (Row Level Security) 활성화
ALTER TABLE daily_spending_status ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 일일 지출 상태만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own daily spending status" ON daily_spending_status
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 일일 지출 상태만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own daily spending status" ON daily_spending_status
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 일일 지출 상태만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own daily spending status" ON daily_spending_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_daily_spending_status_updated_at 
    BEFORE UPDATE ON daily_spending_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

