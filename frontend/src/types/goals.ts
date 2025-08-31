// 목표 설정 관련 타입 정의

// 사용자 목표 설정
export interface UserGoal {
    id: string;
    user_id: string;
    daily_goal: number;                    // 일간 목표금액 (원)
    include_general_expense: boolean;      // 일반지출 포함 여부
    include_fixed_expense: boolean;        // 고정지출 포함 여부
    include_waste_expense: boolean;        // 낭비지출 포함 여부
    include_special_expense: boolean;      // 특수지출 포함 여부
    created_at: string;                    // 생성일시
    updated_at: string;                    // 수정일시
}

// 목표 생성/수정 시 사용할 데이터
export interface CreateUserGoalData {
    daily_goal: number;                    // 일간 목표금액 (원)
    include_general_expense: boolean;      // 일반지출 포함 여부
    include_fixed_expense: boolean;        // 고정지출 포함 여부
    include_waste_expense: boolean;        // 낭비지출 포함 여부
    include_special_expense: boolean;      // 특수지출 포함 여부
}

// 목표 수정 시 사용할 데이터 (일부 필드만 수정 가능)
export interface UpdateUserGoalData extends Partial<CreateUserGoalData> {
    id: string;                            // 수정할 목표 ID
}

// 목표 설정 응답 타입
export interface GoalResponse {
    success: boolean;
    data?: UserGoal;
    error?: string;
}

// 목표 조회 응답 타입
export interface GetGoalResponse {
    success: boolean;
    data?: UserGoal | null;
    error?: string;
}

