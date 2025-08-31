-- 사용자 레벨 관리 테이블 생성
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 1, -- 현재 레벨 (기본값: 1)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 레벨만 볼 수 있도록 정책 설정
CREATE POLICY "Users can view own level" ON user_levels
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 레벨만 수정할 수 있도록 정책 설정
CREATE POLICY "Users can update own level" ON user_levels
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 레벨만 삽입할 수 있도록 정책 설정
CREATE POLICY "Users can insert own level" ON user_levels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_user_levels_updated_at 
    BEFORE UPDATE ON user_levels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 새 사용자 가입 시 자동으로 레벨 1 생성하는 트리거 함수
CREATE OR REPLACE FUNCTION create_default_user_level()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_levels (user_id, current_level)
    VALUES (NEW.id, 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 새 사용자 가입 시 자동으로 레벨 1 생성하는 트리거
CREATE TRIGGER create_user_level_on_signup 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION create_default_user_level();

