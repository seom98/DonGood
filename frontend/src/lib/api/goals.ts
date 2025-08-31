import { createClient } from "@/utils/supabase/client";
import { 
    UserGoal, 
    CreateUserGoalData, 
    UpdateUserGoalData, 
    GoalResponse, 
    GetGoalResponse 
} from "@/types/goals";

/**
 * 현재 사용자의 목표 설정을 가져옵니다.
 * @returns 목표 설정 데이터 또는 null (설정되지 않은 경우)
 */
export async function getCurrentUserGoal(): Promise<GetGoalResponse> {
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

        // 사용자의 목표 설정 조회
        const { data, error } = await supabase
            .from("user_goals")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // 목표가 설정되지 않은 경우
                return {
                    success: true,
                    data: null
                };
            }
            
            return {
                success: false,
                error: `목표 조회 실패: ${error.message}`
            };
        }

        return {
            success: true,
            data: data as UserGoal
        };
    } catch (error) {
        return {
            success: false,
            error: `목표 조회 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

/**
 * 새로운 목표 설정을 생성합니다.
 * @param goalData 목표 설정 데이터
 * @returns 생성된 목표 설정
 */
export async function createUserGoal(goalData: CreateUserGoalData): Promise<GoalResponse> {
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

        // 목표 설정 생성
        const { data, error } = await supabase
            .from("user_goals")
            .insert({
                user_id: user.id,
                ...goalData
            })
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `목표 생성 실패: ${error.message}`
            };
        }

        return {
            success: true,
            data: data as UserGoal
        };
    } catch (error) {
        return {
            success: false,
            error: `목표 생성 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

/**
 * 기존 목표 설정을 수정합니다.
 * @param updateData 수정할 목표 데이터
 * @returns 수정된 목표 설정
 */
export async function updateUserGoal(updateData: UpdateUserGoalData): Promise<GoalResponse> {
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

        // 목표 설정 수정
        const { data, error } = await supabase
            .from("user_goals")
            .update({
                daily_goal: updateData.daily_goal,
                include_general_expense: updateData.include_general_expense,
                include_fixed_expense: updateData.include_fixed_expense,
                include_waste_expense: updateData.include_waste_expense,
                include_special_expense: updateData.include_special_expense
            })
            .eq("id", updateData.id)
            .eq("user_id", user.id) // 보안을 위해 사용자 ID도 확인
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `목표 수정 실패: ${error.message}`
            };
        }

        return {
            success: true,
            data: data as UserGoal
        };
    } catch (error) {
        return {
            success: false,
            error: `목표 수정 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

/**
 * 목표 설정을 생성하거나 수정합니다 (upsert).
 * @param goalData 목표 설정 데이터
 * @returns 생성/수정된 목표 설정
 */
export async function upsertUserGoal(goalData: CreateUserGoalData): Promise<GoalResponse> {
    try {
        // 먼저 기존 목표가 있는지 확인
        const existingGoal = await getCurrentUserGoal();
        
        if (existingGoal.success && existingGoal.data) {
            // 기존 목표가 있으면 수정
            return await updateUserGoal({
                id: existingGoal.data.id,
                ...goalData
            });
        } else if (existingGoal.success) {
            // 기존 목표가 없으면 생성
            return await createUserGoal(goalData);
        } else {
            // 오류가 발생한 경우
            return {
                success: false,
                error: existingGoal.error
            };
        }
    } catch (error) {
        return {
            success: false,
            error: `목표 설정 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        };
    }
}

