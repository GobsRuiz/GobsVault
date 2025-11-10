import envSchema from 'env-schema'
import { Type, Static } from '@sinclair/typebox'



const envConfig = Type.Object({
    // App
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('production'),
    Type.Literal('test')
  ], { default: 'development' }),
  
  PORT: Type.Number({ default: 4000, minimum: 1, maximum: 65535 }),
  HOST: Type.String({ default: '0.0.0.0' }),
  LOG_LEVEL: Type.Union([
    Type.Literal('fatal'),
    Type.Literal('error'),
    Type.Literal('warn'),
    Type.Literal('info'),
    Type.Literal('debug'),
    Type.Literal('trace')
  ], { default: 'info' }),

  COOKIE_SECRET: Type.String({ minLength: 32 }),

  // JWT
  JWT_SECRET: Type.String({ minLength: 32 }),
  JWT_REFRESH_SECRET: Type.String({ minLength: 32 }),
  JWT_EXPIRES_IN: Type.String({ default: '15m' }),
  JWT_REFRESH_EXPIRES_IN: Type.String({ default: '7d' }),

  // Security
  BCRYPT_ROUNDS: Type.Number({ default: 12, minimum: 10, maximum: 15 }),

  // Front
  ALLOWED_ORIGINS: Type.String(),

  // Redis
  REDIS_HOST: Type.String({ default: 'localhost' }),
  REDIS_PORT: Type.Number({ default: 6379, minimum: 1, maximum: 65535 }),
  REDIS_PASSWORD: Type.Optional(Type.String()),
  REDIS_MAX_RETRIES: Type.Number({ default: 3, minimum: 1, maximum: 10 }),
  REDIS_CONNECT_TIMEOUT: Type.Number({ default: 10000, minimum: 1000, maximum: 30000 }),
  REDIS_COMMAND_TIMEOUT: Type.Number({ default: 5000, minimum: 1000, maximum: 30000 }),

  // Cache
  CACHE_TTL_DEFAULT: Type.Number({ default: 300, minimum: 1 }),

  // MongoDB
  MONGODB_URI: Type.String({ minLength: 1 })
})

export type EnvConfig = Static<typeof envConfig>

export const env = envSchema<EnvConfig>({
  schema: envConfig,
  dotenv: true
})