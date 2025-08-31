// 유저 레벨 관련 타입 정의

// 사용자 레벨 정보
export interface UserLevel {
    id: string;
    user_id: string;
    current_level: number;                 // 현재 레벨 (기본값: 1)
    created_at: string;                    // 생성일시
    updated_at: string;                    // 수정일시
}

// 레벨 수정 시 사용할 데이터
export interface UpdateUserLevelData {
    current_level: number;                 // 새로운 레벨
}

// 레벨 조회 응답 타입
export interface GetUserLevelResponse {
    success: boolean;
    data?: UserLevel | null;
    error?: string;
}

// 레벨 수정 응답 타입
export interface UpdateUserLevelResponse {
    success: boolean;
    data?: UserLevel;
    error?: string;
}
