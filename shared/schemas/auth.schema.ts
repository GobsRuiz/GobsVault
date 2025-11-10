import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string({
    required_error: 'Username é obrigatório'
  })
    .min(1, 'Username é obrigatório')
    .min(3, 'Username deve ter no mínimo 3 caracteres')
    .max(30, 'Username deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username deve conter apenas letras, números e underscore'),

  email: z.string({
    required_error: 'Email é obrigatório'
  })
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim(),

  password: z.string({
    required_error: 'Senha é obrigatória'
  })
    .min(1, 'Senha é obrigatória')
    .min(5, 'Senha deve ter no mínimo 5 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial')
})

export const loginSchema = z.object({
  login: z.string({
    required_error: 'Email ou Username é obrigatório'
  })
    .min(1, 'Email ou Username é obrigatório')
    .min(3, 'Email ou Username deve ter no mínimo 3 caracteres')
    .trim(),

  password: z.string({
    required_error: 'Senha é obrigatória'
  })
    .min(1, 'Senha é obrigatória')
    .min(5, 'Senha deve ter no mínimo 5 caracteres')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token é obrigatório')
})

export type RegisterDTO = z.infer<typeof registerSchema>
export type LoginDTO = z.infer<typeof loginSchema>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>
