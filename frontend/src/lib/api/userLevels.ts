import { createClient } from "@/utils/supabase/client";
import { 
    UserLevel, 
    GetUserLevelResponse, 
    UpdateUserLevelResponse 
} from "@/types/userLevels";

/**
 * 현재 사용자의 레벨 정보를 가져옵니다.
 * @returns 사용자 레벨 정보 또는 null (레벨이 설정되지 않은 경우)
 */
export async function getCurrentUserLevel(): Promise<GetUserLevelResponse> {
    try {
        const supabase = createClient();
        
        // 현재 인증된 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return {
                success: false,
                error: "사용자 인증 정보를 찾을 수 없습니다."
            };
        }

        // 사용자의 레벨 정보 조회
        const { data, error } = await supabase
            .from("user_levels")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // 레벨이 설정되지 않은 경우 (기본값 1로 생성)
                return await createDefaultUserLevel(user.id);
            }
            
            return {
                success: false,
                error: `레벨 조회 실패: ${error.message}`
            };
        }

        return {
            success: true,
            data: data as UserLevel
        };
    } catch (error) {
        return {
            success: false,
            error: `레벨 조회 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

/**
 * 사용자의 레벨을 수정합니다.
 * @param newLevel 새로운 레벨
 * @returns 수정된 레벨 정보
 */
export async function updateUserLevel(newLevel: number): Promise<UpdateUserLevelResponse> {
    try {
        const supabase = createClient();
        
        // 현재 인증된 사용자 정보 가져오기
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return {
                success: false,
                error: "사용자 인증 정보를 찾을 수 없습니다."
            };
        }

        // 레벨 유효성 검사
        if (newLevel < 1) {
            return {
                success: false,
                error: "레벨은 1 이상이어야 합니다."
            };
        }

        // 먼저 현재 레벨 정보 확인
        const currentLevelResponse = await getCurrentUserLevel();
        if (!currentLevelResponse.success) {
            return {
                success: false,
                error: currentLevelResponse.error
            };
        }

        let levelId: string;
        if (currentLevelResponse.data) {
            // 기존 레벨이 있으면 수정
            levelId = currentLevelResponse.data.id;
        } else {
            // 레벨이 없으면 새로 생성
            const createResponse = await createDefaultUserLevel(user.id);
            if (!createResponse.success || !createResponse.data) {
                return {
                    success: false,
                    error: createResponse.error
                };
            }
            levelId = createResponse.data.id;
        }

        // 레벨 수정
        const { data, error } = await supabase
            .from("user_levels")
            .update({ current_level: newLevel })
            .eq("id", levelId)
            .eq("user_id", user.id) // 보안을 위해 사용자 ID도 확인
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `레벨 수정 실패: ${error.message}`
            };
        }

        return {
            success: true,
            data: data as UserLevel
        };
    } catch (error) {
        return {
            success: false,
            error: `레벨 수정 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

/**
 * 사용자의 레벨을 1씩 증가시킵니다.
 * @returns 증가된 레벨 정보
 */
export async function incrementUserLevel(): Promise<UpdateUserLevelResponse> {
    try {
        const currentLevelResponse = await getCurrentUserLevel();
        
        if (!currentLevelResponse.success) {
            return {
                success: false,
                error: currentLevelResponse.error
            };
        }

        const currentLevel = currentLevelResponse.data?.current_level || 1;
        const newLevel = currentLevel + 1;
        
        return await updateUserLevel(newLevel);
    } catch (error) {
        return {
            success: false,
            error: `레벨 증가 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

/**
 * 기본 레벨(1)로 사용자 레벨을 생성합니다.
 * @param userId 사용자 ID
 * @returns 생성된 레벨 정보
 */
async function createDefaultUserLevel(userId: string): Promise<GetUserLevelResponse> {
    try {
        const supabase = createClient();
        
        const { data, error } = await supabase
            .from("user_levels")
            .insert({
                user_id: userId,
                current_level: 1
            })
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `기본 레벨 생성 실패: ${error.message}`
            };
        }

        return {
            success: true,
            data: data as UserLevel
        };
    } catch (error) {
        return {
            success: false,
            error: `기본 레벨 생성 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}
