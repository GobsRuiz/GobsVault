import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import cookie from '@fastify/cookie'
import { env } from '../../config/env.config'

async function cookiePluginCallback(app: FastifyInstance) {
  await app.register(cookie, {
    secret: env.COOKIE_SECRET
  })
}

export const cookiePlugin = fp(cookiePluginCallback, {
  name: 'cookie-plugin'
})