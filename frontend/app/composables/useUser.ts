/**
 * User composable
 * Handles user data fetching with fresh data from backend
 */
import { logger } from '~/utils/logger'

interface User {
  id: string
  username: string
  email: string
  balance: number
  xp: number
  level: number
}

// Global reactive state for user data
const userData = ref<User | null>(null)
const userLoading = ref(false)
const userError = ref<string | null>(null)

export const useUser = () => {
  const config = useRuntimeConfig()

  /**
   * Fetch current user data from backend
   * This gets fresh data including updated balance
   */
  const fetchUser = async () => {
    userLoading.value = true
    userError.value = null

    logger.log('[useUser] Fetching fresh user data...')

    try {
      const response = await $fetch<{ success: boolean; data: User }>(
        `${config.public.apiBase}/api/user/me`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      logger.log('[useUser] User response:', response)

      if (response.success) {
        userData.value = response.data
        logger.log('[useUser] User data updated:', userData.value)
      }
    } catch (err: any) {
      userError.value = err.data?.error?.message || 'Erro ao buscar dados do usuário'
      logger.error('[useUser] User fetch error:', err)
    } finally {
      userLoading.value = false
    }
  }

  return {
    user: readonly(userData),
    loading: readonly(userLoading),
    error: readonly(userError),
    fetchUser
  }
}
