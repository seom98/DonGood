import { createBrowserClient } from '@supabase/ssr'
import { User, Session } from '@supabase/supabase-js'

/**
 * 클라이언트 사이드에서 사용할 Supabase 클라이언트 생성
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * 클라이언트 사이드에서 현재 사용자 정보 가져오기
 */
export async function getCurrentUserClient(): Promise<User | null> {
  const supabase = createBrowserSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * 클라이언트 사이드에서 현재 세션 정보 가져오기
 */
export async function getCurrentSessionClient(): Promise<Session | null> {
  const supabase = createBrowserSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

/**
 * 클라이언트 사이드에서 로그아웃 처리
 */
export async function signOutClient() {
  const supabase = createBrowserSupabaseClient()
  await supabase.auth.signOut()
} 