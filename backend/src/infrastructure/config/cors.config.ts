import { FastifyCorsOptions } from '@fastify/cors'
import { env } from './env.config'

export function buildCorsConfig(logger: any): FastifyCorsOptions {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  
  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } 
      else {
        logger.warn({ origin, allowedOrigins }, 'CORS: Origin blocked')
        callback(new Error('Not allowed by CORS'), false)
      }
    },

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'PATCH']
  }
}