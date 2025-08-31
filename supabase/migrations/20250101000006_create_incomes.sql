-- 월간 수입 테이블 생성
CREATE TABLE IF NOT EXISTS incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    year INTEGER NOT NULL,      -- 년도
    month INTEGER NOT NULL,     -- 월 (1-12)
    name VARCHAR(100) NOT NULL, -- 수입명
    amount INTEGER NOT NULL,    -- 수입금액
    income_date DATE NOT NULL,  -- 수입 날짜
    memo TEXT,                  -- 메모
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_year_month ON incomes(year, month);
CREATE INDEX IF NOT EXISTS idx_incomes_user_year_month ON incomes(user_id, year, month);

-- RLS (Row Level Security) 활성화
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 수입만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own incomes" ON incomes
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 수입만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own incomes" ON incomes
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 수입만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own incomes" ON incomes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 수입만 삭제할 수 있도록 정책 설정
CREATE POLICY "Users can delete own incomes" ON incomes
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_incomes_updated_at 
    BEFORE UPDATE ON incomes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

