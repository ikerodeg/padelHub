# 🗺️ ROADMAP TOTAL: PadelHub 2026

Este documento unifica la visión completa del proyecto hasta su lanzamiento final (Backend, PWA y Automatización).
**Nota importante**: La aplicación no se lanzará ni usará hasta estar 100% completa (Fase 3 finalizada).

---

## 📍 Situación Actual (Frontend v1.5)
La interfaz es funcionalmente completa en local.
- **Gestión Admin**: Creación/Edición de partidas y jugadores.
- **Cliente**: Visualización de ranking, agenda y resultados.
- **Datos**: Mock en `localStorage` (a migrar).
- **UI/UX**: Diseño Premium Mobile-First.

---

## 🚀 Estrategia de Evolución

### 📱 Fase 1: PWA (App Nativa)
*Preparar la web para instalarse como app en iOS/Android.*
- [x] **Manifest.json**: Configuración completa (Nombre: PadelHub, Iconos, `standalone`).
- [ ] **Service Worker**: Caché básica y configuración offline.
- [x] **Compatibilidad iOS**: Meta tags específicos para Safari (`apple-touch-icon`).

### ⚙️ Fase 2: Backend Core (El Motor)
*Sustituir localStorage por base de datos real en la nube.*
*(Stack: Bun + Elysia + Supabase)*

- [ ] **Infraestructura**: Setup de proyecto Bun y Supabase (PostgreSQL).
- [ ] **Base de Datos**: Tablas `users`, `matches`, `players` (migración de JSON actual a SQL).
- [ ] **Autenticación**: Login real (JWT) para Admin y Jugadores.
- [ ] **API**: Endpoints para gestión de partidas y jugadores.
- [ ] **Conexión Frontend**: Reemplazar lógica de `storage.js` por llamadas `fetch()` al API.

### 🤖 Fase 3: Automatización Telegram (El Lanzamiento)
*El sistema gestiona el grupo de Telegram automáticamente.*

#### 3.1 Notificaciones Unidireccionales (Backend -> Telegram)
- [ ] **Bot Setup**: Crear bot y añadirlo al grupo como admin.
- [ ] **Nuevo Partido**: Al crear partida (Admin), el bot envía: "🆕 | 📅 Sábado | 🥎 🥎 (Huecos) | [Enlace App]".
- [ ] **Actualización**: Al unirse alguien, el bot edita o reenvía: "🧢 | ... | 🥎 (Falta 1) | [Enlace App]".
- [ ] **Cierre**: Al completarse, notifica y menciona: "🔒 | PARTIDA CERRADA | @Juan @Pedro...".

#### 3.2 Interacción Bidireccional (Telegram -> Backend) ❓
*(Funcionalidad Opcional / Experimental)*
- [ ] **Botones Inline**: Investigar uso de `InlineKeyboard` ("✅ Me apunto") en Telegram para acciones rápidas sin abrir la web.
    -   *Nota*: Evaluar seguridad y usabilidad (evitar clicks accidentales). Si es complejo o riesgoso, se descarta.

---

## 📝 Próximos Pasos

1.  **Ejecutar Fase 0**: Renombrar todo a **PadelHub**.
2.  **Ejecutar Fase 1**: Configurar PWA.
3.  **Iniciar Fase 2**: Desarrollo del Backend.
