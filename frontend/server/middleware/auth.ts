export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/_auth/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/assets/') ||
    path.includes('.')
  ) {
    return
  }

  const session = await getUserSession(event)
  if (!session.user) return

  const accessToken = getCookie(event, 'accessToken')

  if (!accessToken) {
    try {
      await callBackendAPI(event, '/api/auth/refresh', {
        method: 'POST'
      })
    } catch {
      await clearUserSession(event)
      deleteCookie(event, 'accessToken')
      deleteCookie(event, 'refreshToken')
    }
  }
})
