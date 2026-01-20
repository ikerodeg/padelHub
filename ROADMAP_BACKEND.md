# 🗺️ Roadmap Backend: PadelSamu API (v3 - "The Bun Native Stack")

Este es el roadmap definitivo, optimizado para aprovechar al máximo la velocidad de **Bun** y las capacidades "Todo en Uno" de **Supabase**.

## 🏗️ Stack Tecnológico Seleccionado

*   **Runtime:** **Bun.js** 🍙
    *   Ejecución de JavaScript de ultra-alta velocidad.
*   **Framework Web:** **Elysia.js** 🦊
    *   *¿Por qué?* Creado específicamente para Bun. Es el framework más rápido que existe actualmente para JS. Tiene un sistema de tipos "mágico" (Type safety) y sintaxis súper elegante. Incluye plugins geniales para Swagger (documentación) y validaciones.
*   **Base de Datos y Auth:** **Supabase** ⚡
    *   *Nota:* Supabase utiliza **PostgreSQL** por debajo (no SQLite), lo cual es *aún mejor* para producción. Es la base de datos más potente del mundo open source.
    *   *Ventaja Clave:* **Autenticación (Auth) incluida**. Nos ahorramos semanas de trabajo programando login/registro/seguridad. También incluye gestión de usuarios y reglas de seguridad.
*   **Deployment:** **Render** ☁️
    *   Para alojar nuestro servidor Elysia gratuitamente.

---

## 📅 Hitos Detallados (Micro-pasos)

### ✅ Fase 1: Setup del Entorno "Bun Native"
Objetivo: Tener el servidor Elysia corriendo con Swagger (documentación automática).

1.  [ ] **Instalar Bun Globalmente**:
    *   Comando `curl -fsSL https://bun.sh/install | bash` (si no está ya).
    *   Verificar con `bun --version`.
2.  [ ] **Inicializar Proyecto Elysia**:
    *   Crear carpeta `/backend`.
    *   `bun create elysia app` (esto crea la estructura base optimizada).
3.  [ ] **Instalar Plugin Swagger**:
    *   `bun add @elysiajs/swagger`.
    *   Configurarlo en `src/index.ts` para tener documentación automática en `/swagger`.
4.  [ ] **Hola Mundo de Alto Rendimiento**:
    *   Crear ruta `GET /ping` que devuelva "pong".
    *   Probar velocidad de respuesta.

### 🔐 Fase 2: Configuración Supabase (DB + Auth)
Objetivo: Tener la infraestructura de datos lista en la nube.

1.  [ ] **Crear Proyecto Supabase**:
    *   Registrarse en supabase.com.
    *   Crear nuevo proyecto "PadelSamu".
    *   Guardar la `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
2.  [ ] **Diseñar Tablas en Supabase (Editor SQL)**:
    *   Ejecutar script para tabla `profiles` (vinculada a usuarios auth).
    *   Ejecutar script para tabla `matches` (partidas).
    *   Ejecutar script para tabla `players_matches` (relación muchos a muchos).
3.  [ ] **Configurar Auth en Supabase**:
    *   Activar proveedor Email/Password.
    *   Desactivar confirmación de email (para desarrollo rápido).
4.  [ ] **Conectar Elysia con Supabase**:
    *   `bun add @supabase/supabase-js`.
    *   Crear archivo `src/lib/supabase.ts` para inicializar el cliente usando variables de entorno (`.env`).

### 🔌 Fase 3: API Endpoints con Elysia (CRUD)
Objetivo: El motor de la aplicación.

1.  [ ] **Endpoints de Autenticación (`/auth`)**:
    *   `POST /auth/register`: Recibe email/pass -> Llama a `supabase.auth.signUp()`.
    *   `POST /auth/login`: Recibe email/pass -> Llama a `supabase.auth.signInWithPassword()`.
2.  [ ] **Middlewares de Protección**:
    *   Crear guardia `derived` en Elysia para verificar que el usuario tiene token válido antes de dejarle crear partidas.
3.  [ ] **Endpoints de Partidas (`/matches`)**:
    *   `GET /matches`: `supabase.from('matches').select('*')`.
    *   `POST /matches`: Validar body con Elysia.t (tipos) -> Insertar en Supabase -> Devolver ID.
    *   *Nota:* Aquí es donde Elysia brilla validando los datos automáticamente antes de tocar la DB.

### 🤖 Fase 4: Integración Telegram (El toque "Pro")
Objetivo: Comunicación automática.

1.  [ ] **Setup Bot**:
    *   Crear bot en Telegram y obtener Chat ID del grupo.
2.  [ ] **Servicio Telegram**:
    *   Crear `src/services/telegram.ts`.
    *   Función `sendNewMatchNotification(matchDetails)`.
3.  [ ] **Hook en Creación**:
    *   En el endpoint `POST /matches`, justo después de recibir el "OK" de Supabase...
    *   Llamar a `await sendNewMatchNotification(...)`.
    *   Hacerlo de forma asíncrona para no ralentizar la respuesta al usuario.

### 🔄 Fase 5: Conexión Frontend (La Migración)
Objetivo: El frontend deja de ser solitario.

1.  [ ] **Variables de Entorno Frontend**:
    *   Configurar URL del backend (localhost al principio).
2.  [ ] **Login UI**:
    *   Crear formulario de login real en el index (o un modal).
    *   Guardar el `access_token` que devuelve el backend en memoria/cookie (no en localStorage inseguro).
3.  [ ] **Adaptar `crear-partida.js`**:
    *   En vez de guardar en localStorage, hace `POST /matches` al backend enviando el token del usuario.

### 🚀 Fase 6: Despliegue Final
Objetivo: Salir en vivo.

1.  [ ] **Backend en Render**:
    *   Dockerizar la app Elysia (Bun tiene imágenes oficiales ligeras).
    *   Desplegar en Render (detectará Dockerfile automáticamente).
    *   Añadir variables de entorno (Supabase Keys, Telegram Token).
2.  [ ] **Frontend Update**:
    *   Apuntar a la URL de Render.
    *   Asegurar que CORS está configurado para permitir peticiones desde tu dominio de GitHub Pages.

---

## 📝 Próximo Paso Inmediato
Empezar la **Fase 1**: Crear la estructura de carpetas `/backend` e instalar Elysia + Bun.
