import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import { cryptoRoutes } from './api/routes/crypto.routes'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})

// Segurança
await app.register(helmet, {
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
})

await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})

await app.register(cookie, {
  secret: process.env.COOKIE_SECRET || 'dev-secret-change-in-production'
})

// Rate limiting global
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

// Rotas
await app.register(cryptoRoutes)

// Health check
app.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

// Error handler global
app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  
  const statusCode = error.statusCode || 500
  
  reply.code(statusCode).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    }
  })
})

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000
    const host = process.env.HOST || '0.0.0.0'
    
    await app.listen({ port, host })
    
    console.log(`
🚀 Server running!
📍 URL: http://localhost:${port}
🏥 Health: http://localhost:${port}/health
🌍 Environment: ${process.env.NODE_ENV || 'development'}
    `)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...')
  await app.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...')
  await app.close()
  process.exit(0)
})

start()