import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { healthRoutes } from './routes/health'

const PORT = process.env.PORT || 3000

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'PadelHub API',
        version: '1.0.0',
        description: 'Backend para la gestión de partidas de pádel'
      },
      tags: [
        { name: 'Health', description: 'Endpoints de estado del servidor' },
        { name: 'Auth', description: 'Autenticación y registro (Fase 2)' },
        { name: 'Matches', description: 'Gestión de partidas (Fase 3)' }
      ]
    }
  }))
  .use(healthRoutes)
  .get('/', () => 'PadelHub API - Use /swagger for docs')
  .listen(PORT)

console.log(`🦊 Elysia is running at http://localhost:${PORT}`)
console.log(`📚 Swagger docs at http://localhost:${PORT}/swagger`)
