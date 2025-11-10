declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    email: string
    balance: number
    xp: number
    level: number
  }

  interface UserSession {
    user: User
  }
}

export {}
