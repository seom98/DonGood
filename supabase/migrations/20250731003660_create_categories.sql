-- 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- 카테고리 이름
    color VARCHAR(7) DEFAULT '#3B82F6', -- 카테고리 색상 (기본값: 파란색)
    icon VARCHAR(50), -- 카테고리 아이콘
    is_default BOOLEAN DEFAULT FALSE, -- 기본 카테고리 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name) -- 사용자별로 카테고리 이름 중복 방지
);

-- 지출-카테고리 관계 테이블 생성
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(expense_id, category_id) -- 하나의 지출에 같은 카테고리 중복 방지
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_expense_id ON expense_categories(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_category_id ON expense_categories(category_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- 카테고리 테이블 보안 정책
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- 지출-카테고리 관계 테이블 보안 정책
CREATE POLICY "Users can view own expense categories" ON expense_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expenses e 
            WHERE e.id = expense_categories.expense_id 
            AND e.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own expense categories" ON expense_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM expenses e 
            WHERE e.id = expense_categories.expense_id 
            AND e.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own expense categories" ON expense_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM expenses e 
            WHERE e.id = expense_categories.expense_id 
            AND e.user_id = auth.uid()
        )
    );

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 기본 카테고리 데이터 삽입 함수
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO categories (user_id, name, color, icon, is_default) VALUES
        (user_uuid, '식비', '#EF4444', '🍽️', true),
        (user_uuid, '교통비', '#3B82F6', '🚗', true),
        (user_uuid, '쇼핑', '#8B5CF6', '🛍️', true),
        (user_uuid, '문화생활', '#EC4899', '🎭', true),
        (user_uuid, '의료비', '#10B981', '🏥', true),
        (user_uuid, '교육비', '#F59E0B', '📚', true),
        (user_uuid, '주거비', '#6366F1', '🏠', true),
        (user_uuid, '통신비', '#06B6D4', '📱', true),
        (user_uuid, '기타', '#6B7280', '📌', true)
    ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
