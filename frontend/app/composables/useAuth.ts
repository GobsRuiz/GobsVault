interface RegisterData {
  username: string
  email: string
  password: string
}

interface LoginData {
  login: string
  password: string
}

interface ApiResponse {
  success: boolean
  user?: {
    id: string
    username: string
    email: string
    balance: number
    xp: number
    level: number
  }
}

export const useAuth = () => {
  const { loggedIn, user, clear, fetch } = useUserSession()
  const router = useRouter()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const register = async (data: RegisterData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse>('/api/auth/register', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await router.push('/')
        return true
      }

      return false
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao cadastrar. Tente novamente.'
      return false
    } finally {
      loading.value = false
    }
  }

  const login = async (data: LoginData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse>('/api/auth/login', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        await fetch()
        await router.push('/dashboard')
        return true
      }

      return false
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao fazer login. Tente novamente.'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      await clear()
      await router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return {
    user,
    loggedIn,
    loading: readonly(loading),
    error: readonly(error),
    register,
    login,
    logout
  }
}
