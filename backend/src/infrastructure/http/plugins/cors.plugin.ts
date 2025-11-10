import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { buildCorsConfig } from '../../config/cors.config'

async function corsPluginCallback(app: FastifyInstance) {
  const corsConfig = buildCorsConfig(app.log)
  await app.register(cors, corsConfig)
}

export const corsPlugin = fp(corsPluginCallback, {
  name: 'cors-plugin'
})