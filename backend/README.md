# 🏓 PadelHub Backend API

API RESTful para la gestión de partidas de pádel.

## 🚀 Tech Stack

- **Runtime**: Bun 1.x
- **Framework**: Elysia.js
- **Database**: Supabase (PostgreSQL)
- **Docs**: Swagger/OpenAPI

## 📦 Instalación

```bash
# Instalar dependencias
bun install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

## 🧑‍💻 Desarrollo

```bash
# Modo desarrollo (hot-reload)
bun run dev

# Servidor en: http://localhost:3000
# Docs en: http://localhost:3000/swagger
```

## 📚 API Endpoints

### Health Check
- `GET /health/ping` - Verifica estado del servidor

### Autenticación (Fase 2)
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### Partidas (Fase 3)
- `GET /matches` - Listar partidas
- `POST /matches` - Crear partida
- `PUT /matches/:id` - Editar partida
- `DELETE /matches/:id` - Eliminar partida

## 🔧 Variables de Entorno

Ver `.env.example` para la configuración completa.

## 📖 Documentación

La documentación interactiva está disponible en `/swagger` cuando el servidor está corriendo.