import { FastifyInstance } from 'fastify'
import cookie from '@fastify/cookie'
import { env } from '../../config/env.config'

export async function cookiePlugin(app: FastifyInstance) {
  await app.register(cookie, {
    secret: env.COOKIE_SECRET
  })
}