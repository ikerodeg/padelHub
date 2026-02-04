import { Elysia } from 'elysia'

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get('/ping', () => ({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }), {
    detail: {
      tags: ['Health'],
      summary: 'Health check endpoint',
      description: 'Verifica que el servidor está corriendo correctamente'
    }
  })
