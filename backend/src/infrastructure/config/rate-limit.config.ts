export const rateLimitConfigs = {
  authenticated: {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    keyGenerator: (req: any) => req.user?.id || req.ip,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    }),
    nameSpace: 'authenticated-limit'
  },
  
  login: {
    max: 5,
    timeWindow: '2 minutes',
    ban: 10,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'LOGIN_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Blocked for 10 minutes'
      }
    })
  },
  
  register: {
    max: 10,
    timeWindow: '10 minutes',
    ban: 1440,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'REGISTER_RATE_LIMIT_EXCEEDED',
        message: 'Too many registration attempts. Blocked for 24 hours'
      }
    })
  },
  
  public: {
    max: 30,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'PUBLIC_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests to public endpoint'
      }
    })
  }
}