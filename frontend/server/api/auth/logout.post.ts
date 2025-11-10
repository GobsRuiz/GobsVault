export default defineEventHandler(async (event) => {
  await clearUserSession(event)

  deleteCookie(event, 'accessToken')
  deleteCookie(event, 'refreshToken')

  return { success: true }
})
