/**
 * Global auth interceptor plugin
 * Handles 401/403 errors and automatic logout
 */
export default defineNuxtPlugin(() => {
  const { clear } = useUserSession()
  const router = useRouter()
  const toast = useToast()

  // Track if we're already handling a 401 to prevent loops
  let isHandling401 = false

  // Interceptor for client-side $fetch calls
  if (process.client) {
    $fetch.create({
      async onResponseError({ response }) {
        // Only handle auth errors once
        if (isHandling401) return

        if (response.status === 401 || response.status === 403) {
          isHandling401 = true

          try {
            // Clear session
            await clear()

            // Show user-friendly message
            toast.add({
              id: 'session-expired',
              title: 'Sessão expirada',
              description: 'Por favor, faça login novamente',
              color: 'red',
              timeout: 5000
            })

            // Redirect to login page
            await router.push('/')
          } finally {
            // Reset flag after a delay to allow potential retries
            setTimeout(() => {
              isHandling401 = false
            }, 1000)
          }
        }
      }
    })
  }
})
