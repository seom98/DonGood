-- 사용자 목표 설정 테이블 생성
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    daily_goal INTEGER NOT NULL DEFAULT 0, -- 일간 목표금액
    include_general_expense BOOLEAN NOT NULL DEFAULT FALSE, -- 일반지출 포함
    include_fixed_expense BOOLEAN NOT NULL DEFAULT FALSE,   -- 고정지출 포함
    include_waste_expense BOOLEAN NOT NULL DEFAULT FALSE,   -- 낭비지출 포함
    include_special_expense BOOLEAN NOT NULL DEFAULT FALSE, -- 특수지출 포함
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 목표만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 목표만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 목표만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_user_goals_updated_at 
    BEFORE UPDATE ON user_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

