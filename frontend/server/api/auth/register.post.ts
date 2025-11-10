export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const response = await callBackendAPI<{
    success: boolean
    data: {
      user: {
        _id: string
        username: string
        email: string
        balance: number
        xp: number
        level: number
        totalTrades: number
        isActive: boolean
        createdAt: string
        updatedAt: string
      }
    }
  }>(event, '/api/auth/register', {
    method: 'POST',
    body
  })

  if (response.success) {
    return {
      success: true,
      user: {
        id: response.data.user._id,
        username: response.data.user.username,
        email: response.data.user.email,
        balance: response.data.user.balance,
        xp: response.data.user.xp,
        level: response.data.user.level
      }
    }
  }

  throw createError({
    statusCode: 400,
    message: 'Registration failed'
  })
})
