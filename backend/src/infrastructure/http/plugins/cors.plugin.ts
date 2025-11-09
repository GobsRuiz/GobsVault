import { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { buildCorsConfig } from '../../config/cors.config'

export async function corsPlugin(app: FastifyInstance) {
  const corsConfig = buildCorsConfig(app.log)
  await app.register(cors, corsConfig)
}