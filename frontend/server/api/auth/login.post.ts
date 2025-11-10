export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const response = await callBackendAPI<{
    success: boolean
    data: {
      user: {
        id: string
        username: string
        email: string
        balance: number
        xp: number
        level: number
      }
    }
  }>(event, '/api/auth/login', {
    method: 'POST',
    body
  })

  if (response.success) {
    await setUserSession(event, {
      user: response.data.user
    })

    return { success: true, user: response.data.user }
  }

  throw createError({
    statusCode: 401,
    message: 'Login failed'
  })
})
