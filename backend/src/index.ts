import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { healthRoutes } from './routes/health'
import { validateConfig, config } from './config'

// Validar configuración antes de arrancar
validateConfig()

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
        { name: 'Auth', description: 'Autenticación y registro' },
        { name: 'Matches', description: 'Gestión de partidas' }
      ]
    }
  }))
  .use(healthRoutes)
  .get('/', () => ({
    message: 'PadelHub API - v2.0 (Supabase Integrated)',
    version: '2.0.0',
    docs: '/swagger',
    environment: config.server.env,
    database_status: 'connected'
  }))
  .listen(config.server.port)

console.log(`🦊 Elysia is running at http://localhost:${config.server.port}`)
console.log(`📚 Swagger docs at http://localhost:${config.server.port}/swagger`)
console.log(`🗄️  Connected to Supabase: ${config.supabase.url}`)
