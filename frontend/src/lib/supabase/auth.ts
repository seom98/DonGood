import { signOutClient } from '@/lib/supabase/client'

// 로그아웃 처리 (클라이언트)
export { signOutClient as signOut };

// 클라이언트 사이드에서 인증이 필요한 경우를 위한 훅
// - 로그인 페이지 등에서만 사용
export function useAuth() {
    throw new Error(
        "useAuth는 클라이언트 컴포넌트에서만 사용 가능합니다. 서버 컴포넌트에서는 getAuthUser()를 사용하세요."
    );
} 