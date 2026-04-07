import { SystemVariables } from '@/types/dify'

export function useDifyUser() {
  const STORAGE_KEY = 'dify_user_id'

  const getUserId = (): string => {
    // #ifdef H5
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
    // #endif

    // #ifndef H5
    let userId = uni.getStorageSync(STORAGE_KEY)

    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      uni.setStorageSync(STORAGE_KEY, userId)
    }

    return userId
    // #endif
  }

  const getSystemVariables = (): SystemVariables => {
    return {
      user_id: getUserId()
    }
  }

  const resetUserId = () => {
    // #ifdef H5
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    // #endif

    // #ifndef H5
    uni.removeStorageSync(STORAGE_KEY)
    // #endif
  }

  return {
    getUserId,
    getSystemVariables,
    resetUserId
  }
}
