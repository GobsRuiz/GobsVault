type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ShowToastOptions {
  title?: string
  message?: string
  type?: ToastType
}

export function useAppToast() {
  const toast = useToast()

  const show = ({ title, message, type = 'info' }: ShowToastOptions) => {
    if (!title && !message) {
      return
    }

    toast.add({
      title,
      description: message,
      color: type
    })
  }

  const success = (title?: string, message?: string) => {
    show({ title, message, type: 'success' })
  }

  const error = (title?: string, message?: string) => {
    show({ title, message, type: 'error' })
  }

  const warning = (title?: string, message?: string) => {
    show({ title, message, type: 'warning' })
  }

  const info = (title?: string, message?: string) => {
    show({ title, message, type: 'info' })
  }

  return {
    show,
    success,
    error,
    warning,
    info
  }
}
