import { createClient } from '@/utils/supabase/client'

type UserGoal = {
  id: string
  user_id: string
  daily_goal: number
  monthly_goal: number
  created_at: string
  updated_at: string
}

// 사용자의 목표 설정 가져오기
export async function getUserGoals(userId: string): Promise<UserGoal | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching user goals:', error)
    return null
  }
}

// 사용자 목표 설정 생성 또는 업데이트
export async function upsertUserGoals(
  userId: string, 
  goals: { daily_goal: number; monthly_goal: number }
): Promise<UserGoal | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .upsert({
        user_id: userId,
        daily_goal: goals.daily_goal,
        monthly_goal: goals.monthly_goal
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error upserting user goals:', error)
    return null
  }
}

// 사용자 목표 설정 삭제
export async function deleteUserGoals(userId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting user goals:', error)
    return false
  }
} 