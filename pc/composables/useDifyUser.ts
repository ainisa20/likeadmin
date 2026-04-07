import { SystemVariables } from '@/types/dify'

export function useDifyUser() {
  const STORAGE_KEY = 'dify_user_id'

  const getUserId = (): string => {
    if (typeof window === 'undefined') {
      return 'anonymous'
    }

    let userId = localStorage.getItem(STORAGE_KEY)

    if (!userId) {
      try {
        userId = crypto.randomUUID()
        localStorage.setItem(STORAGE_KEY, userId)
        console.log('[Dify] Generated new user ID:', userId)
      } catch (error) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(STORAGE_KEY, userId)
        console.log('[Dify] Fallback user ID:', userId)
      }
    } else {
      console.log('[Dify] Using existing user ID:', userId)
    }

    return userId
  }

  const getSystemVariables = (): SystemVariables => {
    return {
      user_id: getUserId()
    }
  }

  const resetUserId = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      console.log('[Dify] User ID reset')
    }
  }

  return {
    getUserId,
    getSystemVariables,
    resetUserId
  }
}
