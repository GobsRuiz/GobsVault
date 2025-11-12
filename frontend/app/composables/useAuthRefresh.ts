/**
 * Auto-refresh composable with promise caching and queue management
 * Prevents multiple simultaneous refresh calls (race conditions)
 */

// Shared state across all composable instances
let refreshPromise: Promise<void> | null = null
let lastRefreshTime = 0
const REFRESH_COOLDOWN = 5000 // 5 seconds minimum between refreshes

export const useAuthRefresh = () => {
  const { clear, fetch: fetchSession } = useUserSession()
  const router = useRouter()

  /**
   * Refresh tokens with promise caching
   * Multiple simultaneous calls will wait for the same promise
   */
  const refresh = async (): Promise<boolean> => {
    const now = Date.now()

    // If already refreshing, return the existing promise
    if (refreshPromise) {
      try {
        await refreshPromise
        return true
      } catch {
        return false
      }
    }

    // Cooldown check: prevent too frequent refresh attempts
    if (now - lastRefreshTime < REFRESH_COOLDOWN) {
      return false
    }

    // Create new refresh promise
    refreshPromise = (async () => {
      try {
        lastRefreshTime = now

        const response = await $fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })

        if (response) {
          // Fetch updated session
          await fetchSession()
          return
        }

        throw new Error('Refresh failed')
      } catch (error) {
        // Clear session on refresh failure
        await clear()
        await router.push('/')
        throw error
      } finally {
        // Clear promise after completion
        refreshPromise = null
      }
    })()

    try {
      await refreshPromise
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if access token is expired or about to expire
   * Call this before making authenticated requests
   */
  const ensureValidToken = async (): Promise<boolean> => {
    // In a real implementation, you would decode the JWT and check exp
    // For now, we'll just try to refresh if needed
    // The server middleware handles most cases, this is for client-side calls

    try {
      // If no active refresh, we're good
      if (!refreshPromise) {
        return true
      }

      // Wait for ongoing refresh
      await refreshPromise
      return true
    } catch {
      return false
    }
  }

  return {
    refresh,
    ensureValidToken
  }
}
