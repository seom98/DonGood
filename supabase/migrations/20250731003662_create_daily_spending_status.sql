-- 일일 소비 상태 테이블 생성
CREATE TABLE IF NOT EXISTS daily_spending_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL, -- 날짜 (시간 없음)
    has_spending BOOLEAN NOT NULL, -- 지출이 있었는지 여부
    total_amount INTEGER DEFAULT 0, -- 해당 날짜 총 지출액
    is_goal_achieved BOOLEAN, -- 일일 목표 달성 여부 (NULL: 목표 설정 안됨)
    daily_goal INTEGER, -- 해당 날짜의 일일 목표
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date) -- 사용자별로 날짜 중복 방지
);

-- 목표 달성 기록 테이블 생성
CREATE TABLE IF NOT EXISTS goal_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL, -- 날짜
    is_achieved BOOLEAN NOT NULL, -- 목표 달성 여부
    daily_goal INTEGER NOT NULL, -- 해당 날짜의 일일 목표
    actual_amount INTEGER NOT NULL, -- 실제 지출액
    difference INTEGER NOT NULL, -- 목표 대비 차액 (음수: 절약, 양수: 초과)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_daily_spending_status_user_date ON daily_spending_status(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_spending_status_date ON daily_spending_status(date);
CREATE INDEX IF NOT EXISTS idx_goal_achievements_user_date ON goal_achievements(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goal_achievements_user_achieved ON goal_achievements(user_id, is_achieved);

-- RLS (Row Level Security) 활성화
ALTER TABLE daily_spending_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_achievements ENABLE ROW LEVEL SECURITY;

-- daily_spending_status 테이블 보안 정책
CREATE POLICY "Users can view own daily spending status" ON daily_spending_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own daily spending status" ON daily_spending_status
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily spending status" ON daily_spending_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily spending status" ON daily_spending_status
    FOR DELETE USING (auth.uid() = user_id);

-- goal_achievements 테이블 보안 정책
CREATE POLICY "Users can view own goal achievements" ON goal_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal achievements" ON goal_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 트리거 생성
CREATE TRIGGER update_daily_spending_status_updated_at 
    BEFORE UPDATE ON daily_spending_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 지출 기록 시 일일 소비 상태 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_daily_spending_status()
RETURNS TRIGGER AS $$
DECLARE
    daily_goal_amount INTEGER;
    total_expense INTEGER;
    is_goal_achieved BOOLEAN;
BEGIN
    -- 해당 날짜의 일일 목표 조회
    SELECT daily_goal INTO daily_goal_amount
    FROM user_goals
    WHERE user_id = NEW.user_id;
    
    -- 해당 날짜의 총 지출액 계산 (고정지출, 쓸수밖에없었던지출 제외)
    SELECT COALESCE(SUM(amount), 0) INTO total_expense
    FROM expenses
    WHERE user_id = NEW.user_id 
    AND expense_date = NEW.expense_date
    AND is_fixed_expense = false
    AND is_necessary_expense = false;
    
    -- 목표 달성 여부 계산
    IF daily_goal_amount IS NOT NULL AND daily_goal_amount > 0 THEN
        is_goal_achieved := total_expense <= daily_goal_amount;
    ELSE
        is_goal_achieved := NULL;
    END IF;
    
    -- 일일 소비 상태 업데이트 또는 생성
    INSERT INTO daily_spending_status (user_id, date, has_spending, total_amount, is_goal_achieved, daily_goal)
    VALUES (NEW.user_id, NEW.expense_date, true, total_expense, is_goal_achieved, daily_goal_amount)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        has_spending = true,
        total_amount = total_expense,
        is_goal_achieved = is_goal_achieved,
        daily_goal = daily_goal_amount,
        updated_at = NOW();
    
    -- 목표 달성 기록 생성
    IF daily_goal_amount IS NOT NULL AND daily_goal_amount > 0 THEN
        INSERT INTO goal_achievements (user_id, date, is_achieved, daily_goal, actual_amount, difference)
        VALUES (NEW.user_id, NEW.expense_date, is_goal_achieved, daily_goal_amount, total_expense, total_expense - daily_goal_amount);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 지출 삭제 시 일일 소비 상태 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_daily_spending_status_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    daily_goal_amount INTEGER;
    total_expense INTEGER;
    is_goal_achieved BOOLEAN;
BEGIN
    -- 해당 날짜의 일일 목표 조회
    SELECT daily_goal INTO daily_goal_amount
    FROM user_goals
    WHERE user_id = OLD.user_id;
    
    -- 해당 날짜의 총 지출액 계산 (고정지출, 쓸수밖에없었던지출 제외)
    SELECT COALESCE(SUM(amount), 0) INTO total_expense
    FROM expenses
    WHERE user_id = OLD.user_id 
    AND expense_date = OLD.expense_date
    AND is_fixed_expense = false
    AND is_necessary_expense = false;
    
    -- 목표 달성 여부 계산
    IF daily_goal_amount IS NOT NULL AND daily_goal_amount > 0 THEN
        is_goal_achieved := total_expense <= daily_goal_amount;
    ELSE
        is_goal_achieved := NULL;
    END IF;
    
    -- 일일 소비 상태 업데이트
    UPDATE daily_spending_status
    SET 
        has_spending = (total_expense > 0),
        total_amount = total_expense,
        is_goal_achieved = is_goal_achieved,
        updated_at = NOW()
    WHERE user_id = OLD.user_id AND date = OLD.expense_date;
    
    -- 목표 달성 기록 업데이트
    IF daily_goal_amount IS NOT NULL AND daily_goal_amount > 0 THEN
        UPDATE goal_achievements
        SET 
            is_achieved = is_goal_achieved,
            actual_amount = total_expense,
            difference = total_expense - daily_goal_amount
        WHERE user_id = OLD.user_id AND date = OLD.expense_date;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_daily_spending_status
    AFTER INSERT OR UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_spending_status();

CREATE TRIGGER trigger_update_daily_spending_status_on_delete
    AFTER DELETE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_spending_status_on_delete();
