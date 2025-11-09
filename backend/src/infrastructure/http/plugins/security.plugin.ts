import { FastifyInstance } from 'fastify'
import helmet from '@fastify/helmet'
import { env } from '../../config/env.config'

export async function securityPlugin(app: FastifyInstance) {
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: env.NODE_ENV === 'production',
    crossOriginResourcePolicy: env.NODE_ENV === 'production',
    hsts: env.NODE_ENV === 'production' 
      ? { maxAge: 31536000, includeSubDomains: true }
      : false
  })
}