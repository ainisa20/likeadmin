import { SystemVariables } from '@/types/dify'

export function useDifyUser() {
  const STORAGE_KEY = 'dify_user_id'

  const getUserId = (): string => {
    if (typeof window === 'undefined') {
      return 'anonymous'
    }

    let userId = sessionStorage.getItem(STORAGE_KEY)

    if (!userId) {
      try {
        userId = crypto.randomUUID()
        sessionStorage.setItem(STORAGE_KEY, userId)
      } catch (error) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem(STORAGE_KEY, userId)
      }
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
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    getUserId,
    getSystemVariables,
    resetUserId
  }
}
