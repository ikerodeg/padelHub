<div align="center">
  <img src="assets/img/icons/logo.png" alt="PadelHub Logo" width="120" height="120">

  # 🎾 PADEL HUB

  **Gestiona tus partidas. Domina la pista.**

  [![Live Demo](https://img.shields.io/badge/Acceso-App_Web-brightgreen?style=for-the-badge&logo=pwa)](https://ikerodeg.github.io/padelHub/)
  ![Status](https://img.shields.io/badge/Estado-Activo-success?style=for-the-badge)
  ![Mobile](https://img.shields.io/badge/Diseño-100%25_Móvil-blue?style=for-the-badge&logo=iphone&logoColor=white)
  ![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=progressive-web-apps&logoColor=white)

  <p align="center">
    <a href="#-sobre-padelhub">Sobre PadelHub</a> •
    <a href="#-para-jugadores">Soy Jugador</a> •
    <a href="#-para-el-admin">Soy Admin</a> •
    <a href="#-tecnología">Tecnología</a> •
    <a href="#-roadmap">Futuro</a>
  </p>
</div>

---

## 🚀 Sobre PadelHub

**PadelHub** es la aplicación definitiva para tu grupo de pádel. Olvídate de los interminables hilos de WhatsApp o listas de notas desordenadas. 

Diseñada desde cero para ser **100% móvil**, PadelHub centraliza toda la gestión deportiva de tu comunidad en una interfaz moderna, rápida y sencilla. Funciona directamente en tu navegador como una App Nativa (PWA).

### 🎯 **¿Por qué te encantará?**
- ✅ **Instalable**: Añádela a tu pantalla de inicio y úsala como una app nativa.
- ✅ **Modo Offline**: Accede a la información básica incluso sin conexión a internet.
- ✅ **Todo organizado**: Partidas, resultados y ranking en un solo lugar.
- ✅ **Perfil de Jugador**: Estadísticas personales, insignias y agenda.
- ✅ **Seguridad**: Sistema de login personalizado para proteger los datos.

<div align="center">
  <h3>📱 Capturas de Pantalla</h3>
  <img src="assets/img/bg/court-bg-desktop.jpeg" alt="PadelHub Interfaz" width="90%" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
  <p><em>Interfaz diseñada para pulgares: navegación fluida y sin distracciones.</em></p>
</div>

---

## ✨ Características Principales

### 🧢 **Para el Jugador**
¡Tu carrera deportiva empieza aquí!

*   **🔑 Acceso Personal**: Sistema de autenticación para ver tu perfil y estadísticas.
*   **🏆 Ranking en Tiempo Real**: Consulta quién es el número 1 de la temporada.
*   **📅 Agenda Personal**: Tu perfil muestra tus próximas partidas y tu historial reciente.
*   **⚡ Acción Rápida**: Únete a partidas abiertas con un solo toque.
*   **✅ Validación de Resultados**: Cierra las partidas y asigna los ganadores. Reparto de puntos automático.
*   **🏅 Insignias**: Desbloquea logros únicos (MVP, Muralla, Francotirador...) que lucen en tu perfil.

### 👑 **Para el Administrador**
Control total sobre la app.

*   **⚙️ Panel de Control**: Interfaz exclusiva para la gestión avanzada de la app.
*   **📝 Gestión de Partidas**: Modifica y borra partidas.
*   **👥 Control de Jugadores**: Gestiona el alta de nuevos miembros y edita sus perfiles.

---

## 🛠 Tecnología

### Frontend (PWA)
PadelHub es una **Progressive Web App (PWA)** de alto rendimiento.

*   **📦 PWA Full Stack**: Manifest, Service Workers y precarga inteligente para una experiencia fluida.
*   **📶 Soporte Offline Premium**: Página de desvío personalizada (`offline.html`) y acceso a datos cacheados.
*   **📱 Optimización Nativa**: Splash Screens dinámicos para iOS y carga instantánea (Stale-While-Revalidate).
*   **⚡ Vanilla JS & Power**: Rendimiento extremo sin frameworks pesados.
*   **🔐 Auth System**: Sistema de login por usuario integrado.

### Backend (API)
Backend ultrarrápido construido con tecnologías de última generación.

*   **🍙 Bun Runtime**: JavaScript/TypeScript 3x más rápido que Node.js
*   **🦊 Elysia.js**: Framework web de alto rendimiento con type-safety end-to-end
*   **⚡ Supabase**: PostgreSQL managed con autenticación integrada
*   **📚 Swagger/OpenAPI**: Documentación automática de la API
*   **🔥 Hot-reload**: Desarrollo ágil con recarga instantánea

> **Estado**: ✅ Fase 1 completada - Servidor corriendo con documentación automática

---

## 🗺 Roadmap

### ✅ **Fase 1: Backend Setup (Completada)**
- [x] **Entorno Bun + Elysia**: Servidor de alto rendimiento configurado
- [x] **Swagger UI**: Documentación automática en `/swagger`
- [x] **Health Check**: Endpoint `/health/ping` operativo
- [x] **Variables de Entorno**: Configuración segura con `.env`
- [x] **Hot-reload**: Desarrollo rápido con `bun run dev`

### ✅ **Fase 2: Supabase Integration (Completada)**
- [x] **Proyecto Supabase**: Base de datos PostgreSQL en la nube
- [x] **Schema de DB**: Tablas `profiles`, `matches`, `match_players`
- [x] **Row Level Security**: Políticas de seguridad a nivel de fila
- [x] **Cliente Supabase**: Integración con Elysia
- [x] **Auth Config**: Sistema de autenticación configurado

### 🔄 **Fase 3: API CRUD**
- [ ] **Auth Endpoints**: Registro y login con JWT
- [ ] **Endpoints de Partidas**: GET/POST/PUT/DELETE `/matches`
- [ ] **Gestión de Jugadores**: Inscripciones y salidas de partidas
- [ ] **Conexión Frontend**: Migrar de localStorage a API real

### 🤖 **Fase 4: Automatización Telegram**
- [ ] **Bot de Telegram**: Notificaciones automáticas de nuevas partidas
- [ ] **Webhooks**: Actualizaciones en tiempo real al grupo

---

## 🧑‍💻 Desarrollo Local

### Frontend (PWA)
```bash
# Abrir con Live Server o directamente en navegador
open index.html
```

### Backend (API)
```bash
cd backend
bun install
bun run dev

# Servidor: http://localhost:3000
# Docs: http://localhost:3000/swagger
```

Ver [backend/README.md](backend/README.md) para más detalles.

---

---

<div align="center">
  <p><strong>PadelHub 2026</strong></p>
  <p><em>Season 2026 - v1.7</em></p>
</div>
