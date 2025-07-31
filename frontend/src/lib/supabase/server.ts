import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { User, Session } from '@supabase/supabase-js'

/**
 * 서버 사이드에서 사용할 Supabase 클라이언트 생성
 * - 서버 컴포넌트에서만 사용 가능
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

/**
 * 서버 사이드에서 현재 사용자 정보 가져오기
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  
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
 * 서버 사이드에서 현재 세션 정보 가져오기
 */
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = await createServerSupabaseClient()
  
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
export async function signOut() {
  const { createBrowserClient } = await import('@supabase/ssr')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  await supabase.auth.signOut()
} 