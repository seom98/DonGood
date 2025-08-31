-- 결제 수단 테이블 생성
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL, -- 카드명/결제수단명
    color VARCHAR(7) NOT NULL,  -- 색상 (#RRGGBB)
    is_default BOOLEAN DEFAULT FALSE, -- 기본 결제수단 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 결제 수단만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 결제 수단만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own payment methods" ON payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 결제 수단만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own payment methods" ON payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 결제 수단만 삭제할 수 있도록 정책 설정
CREATE POLICY "Users can delete own payment methods" ON payment_methods
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

