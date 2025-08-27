-- 결제 수단 테이블 생성
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- "신용카드", "체크카드", "현금" 등
    type VARCHAR(20) NOT NULL, -- "card", "cash", "transfer" 등
    card_name VARCHAR(100), -- 카드사 이름 (카드인 경우)
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name) -- 사용자별로 결제 수단 이름 중복 방지
);

-- 지출-결제수단 연결 테이블 생성
CREATE TABLE IF NOT EXISTS expense_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(expense_id, payment_method_id) -- 하나의 지출에 같은 결제 수단 중복 방지
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_expense_payment_methods_expense_id ON expense_payment_methods(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_payment_methods_payment_method_id ON expense_payment_methods(payment_method_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_payment_methods ENABLE ROW LEVEL SECURITY;

-- payment_methods 테이블 보안 정책
CREATE POLICY "Users can view own payment methods" ON payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods" ON payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods" ON payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods" ON payment_methods
    FOR DELETE USING (auth.uid() = user_id);

-- expense_payment_methods 테이블 보안 정책
CREATE POLICY "Users can view own expense payment methods" ON expense_payment_methods
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own expense payment methods" ON expense_payment_methods
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own expense payment methods" ON expense_payment_methods
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM expenses 
            WHERE expenses.id = expense_payment_methods.expense_id 
            AND expenses.user_id = auth.uid()
        )
    );

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 기본 결제 수단 생성 함수
CREATE OR REPLACE FUNCTION create_default_payment_methods()
RETURNS void AS $$
BEGIN
    -- 신용카드
    INSERT INTO payment_methods (name, type, card_name, color, icon, is_default)
    VALUES ('신용카드', 'card', '기본 신용카드', '#EF4444', 'credit-card', true)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- 체크카드
    INSERT INTO payment_methods (name, type, card_name, color, icon, is_default)
    VALUES ('체크카드', 'card', '기본 체크카드', '#3B82F6', 'credit-card', false)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- 현금
    INSERT INTO payment_methods (name, type, card_name, color, icon, is_default)
    VALUES ('현금', 'cash', NULL, '#10B981', 'dollar-sign', false)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- 계좌이체
    INSERT INTO payment_methods (name, type, card_name, color, icon, is_default)
    VALUES ('계좌이체', 'transfer', NULL, '#8B5CF6', 'bank', false)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- 간편결제
    INSERT INTO payment_methods (name, type, card_name, color, icon, is_default)
    VALUES ('간편결제', 'digital', NULL, '#F59E0B', 'smartphone', false)
    ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
