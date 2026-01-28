# 🧪 Guía de Testing - Service Worker PWA
## PadelHub - Fase 1, Paso 2

**Fecha**: 28 de enero de 2026  
**Versión SW**: padelhub-v1  
**Ingeniero**: Senior QA Engineer

---

## 📋 Índice de Tests

1. [Punto 8: Testing en Chrome DevTools](#punto-8-testing-en-chrome-devtools)
2. [Punto 9: Testing en Modo Offline](#punto-9-testing-en-modo-offline)
3. [Punto 10: Testing en Dispositivos Reales](#punto-10-testing-en-dispositivos-reales)

---

## Punto 8: Testing en Chrome DevTools

### 🎯 Objetivo
Verificar que el Service Worker se registra correctamente, cachea los recursos y funciona según lo esperado usando las herramientas de desarrollo de Chrome.

### 📝 Pre-requisitos
- Chrome/Edge versión 90+ (recomendado última versión)
- Servidor local corriendo (puede ser Live Server, http-server, o similar)
- **IMPORTANTE**: El Service Worker solo funciona en `localhost` o HTTPS

### 🚀 Paso 1: Iniciar el Servidor Local

**Opción A - Usando Live Server (VSCode):**
1. Abre el proyecto en VSCode
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"
4. Anota la URL (ej: `http://127.0.0.1:5500`)

**Opción B - Usando http-server (Node.js):**
```bash
# Si no tienes http-server instalado:
npm install -g http-server

# Desde la raíz del proyecto:
http-server -p 8080

# La app estará en: http://localhost:8080
```

**Opción C - Usando Python:**
```bash
# Python 3:
python -m http.server 8000

# La app estará en: http://localhost:8000
```

---

### 🔍 Paso 2: Abrir Chrome DevTools

1. Abre Chrome/Edge
2. Navega a tu servidor local (ej: `http://localhost:8080`)
3. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
4. Ve a la pestaña **"Application"** (o "Aplicación" en español)

---

### ✅ Test 2.1: Verificar Registro del Service Worker

**Pasos:**
1. En DevTools → Application → Service Workers (panel izquierdo)
2. Deberías ver:
   - ✅ **Source**: `sw.js`
   - ✅ **Status**: "activated and is running"
   - ✅ Un punto verde junto al Service Worker

**Verificación en Consola:**
1. Ve a la pestaña **Console**
2. Busca el mensaje:
   ```
   ✅ [SW] Service Worker registrado correctamente: http://localhost:XXXX/
   ```

**✅ Criterio de Éxito:**
- El SW está registrado y activo
- No hay errores en la consola
- El badge del usuario aparece correctamente

**❌ Si falla:**
- Verifica que estás en `localhost` o HTTPS
- Revisa la consola por errores de sintaxis en `sw.js`
- Haz hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

---

### ✅ Test 2.2: Verificar Precaching de Recursos

**Pasos:**
1. DevTools → Application → Cache Storage (panel izquierdo)
2. Expande "Cache Storage"
3. Deberías ver: **`padelhub-v1`**
4. Click en `padelhub-v1`

**Verificación:**
Deberías ver TODOS estos recursos cacheados:

**Core:**
- ✅ `http://localhost:XXXX/` (raíz)
- ✅ `index.html`
- ✅ `manifest.json`
- ✅ `offline.html`

**Pages (8 archivos):**
- ✅ `pages/crear-partida.html`
- ✅ `pages/lista-jugadores.html`
- ✅ `pages/lista-partidas.html`
- ✅ `pages/login.html`
- ✅ `pages/perfil.html`
- ✅ `pages/ranking.html`
- ✅ `pages/resultados.html`
- ✅ `pages/torneos.html`

**Admin Pages (5 archivos):**
- ✅ `pages/admin/admin.html`
- ✅ `pages/admin/jugadorPerfilAdmin.html`
- ✅ `pages/admin/jugadoresAdmin.html`
- ✅ `pages/admin/partidaEdicionAdmin.html`
- ✅ `pages/admin/partidasAdmin.html`

**CSS (21 archivos):**
- ✅ Todos los archivos de `src/css/`

**JS (20 archivos):**
- ✅ Todos los archivos de `src/js/`

**Data (3 archivos):**
- ✅ `data/players.json`
- ✅ `data/clubs.json`
- ✅ `data/matches.json`

**Assets (4 archivos):**
- ✅ `assets/img/icons/logo.png`
- ✅ `assets/img/icons/manifest-icon-192.maskable.png`
- ✅ `assets/img/icons/manifest-icon-512.maskable.png`
- ✅ `assets/img/icons/apple-icon-180.png`

**✅ Criterio de Éxito:**
- Todos los archivos listados están en el cache
- Total aproximado: **95+ recursos**

**❌ Si faltan recursos:**
- Verifica que los archivos existen en tu proyecto
- Revisa la consola por errores 404
- Actualiza `PRECACHE_ASSETS` en `sw.js` si añadiste/eliminaste archivos

---

### ✅ Test 2.3: Verificar Estrategias de Cache

**Test 2.3.1 - Network First (HTML):**

1. DevTools → Network (pestaña)
2. Marca la casilla **"Disable cache"** (desactivar cache del navegador, NO del SW)
3. Recarga la página (`F5`)
4. Busca la petición a `index.html`
5. En la columna **"Size"**, debería decir:
   - Primera carga: tamaño real (ej: "12.4 kB")
   - Recargas siguientes: "from ServiceWorker"

**Test 2.3.2 - Stale While Revalidate (CSS/JS):**

1. En Network, busca `main.js` o `style.css`
2. Debería mostrar "from ServiceWorker"
3. En la consola, NO deberías ver errores de cache

**Test 2.3.3 - Cache First (Imágenes):**

1. En Network, busca `logo.png`
2. Debería mostrar "from ServiceWorker"
3. El tiempo de carga debe ser casi instantáneo (<10ms)

**✅ Criterio de Éxito:**
- Los recursos se sirven desde el Service Worker
- No hay errores en la consola
- La app carga rápidamente

---

### ✅ Test 2.4: Verificar Actualización del Service Worker

**Pasos:**
1. Abre `sw.js` en tu editor
2. Cambia la versión:
   ```javascript
   const CACHE_NAME = 'padelhub-v2'; // Cambiar de v1 a v2
   ```
3. Guarda el archivo
4. En Chrome, ve a DevTools → Application → Service Workers
5. Click en **"Update"** o recarga la página

**Verificación:**
1. Deberías ver en la consola:
   ```
   🔄 [SW] Nueva versión detectada
   ✨ [SW] Nueva versión activada
   ```
2. Debería aparecer el **banner azul de actualización** en la parte superior
3. El banner debe decir: "Nueva versión disponible"

**Acción:**
1. Click en **"ACTUALIZAR AHORA"**
2. La página se recarga
3. En Application → Cache Storage, deberías ver:
   - ✅ `padelhub-v2` (nuevo)
   - ❌ `padelhub-v1` (eliminado automáticamente)

**✅ Criterio de Éxito:**
- El banner aparece
- La actualización funciona
- El cache antiguo se elimina

**🔄 Restaurar:**
Vuelve a cambiar la versión a `v1` después del test:
```javascript
const CACHE_NAME = 'padelhub-v1';
```

---

### ✅ Test 2.5: Verificar Manifest.json

**Pasos:**
1. DevTools → Application → Manifest (panel izquierdo)

**Verificación:**
Deberías ver:
- ✅ **Name**: "PadelHub"
- ✅ **Short name**: "PadelHub"
- ✅ **Start URL**: "./index.html"
- ✅ **Theme color**: `#ccff00`
- ✅ **Background color**: `#121212`
- ✅ **Display**: "standalone"
- ✅ **Orientation**: "portrait"
- ✅ **Icons**: 2 iconos (192x192 y 512x512)

**Test de Instalabilidad:**
1. En la barra de direcciones de Chrome, deberías ver un icono de **instalación** (⊕)
2. Click en el icono
3. Debería aparecer un diálogo: "Instalar PadelHub"

**✅ Criterio de Éxito:**
- El manifest se carga correctamente
- La app es instalable
- Los iconos se muestran correctamente

---

## Punto 9: Testing en Modo Offline

### 🎯 Objetivo
Verificar que la aplicación funciona correctamente sin conexión a internet.

---

### ✅ Test 9.1: Simulación de Offline en DevTools

**Pasos:**
1. Con la app cargada, ve a DevTools → Network
2. En el dropdown superior, cambia de **"No throttling"** a **"Offline"**
3. Recarga la página (`F5`)

**Verificación:**
1. ✅ La página debe cargar completamente
2. ✅ El badge del usuario debe aparecer
3. ✅ Todos los estilos deben aplicarse
4. ✅ La navegación debe funcionar

**Test de Navegación Offline:**
1. Con el modo offline activo, navega a:
   - ✅ Crear Partida
   - ✅ Lista Jugadores
   - ✅ Ranking
   - ✅ Resultados
2. Todas las páginas deben cargar desde el cache

**✅ Criterio de Éxito:**
- Todas las páginas cargan offline
- No hay pantallas en blanco
- Los estilos se aplican correctamente

---

### ✅ Test 9.2: Página Offline Personalizada

**Pasos:**
1. En DevTools → Application → Service Workers
2. Click en **"Unregister"** para desregistrar el SW
3. Recarga la página
4. Vuelve a registrar el SW (recarga de nuevo)
5. DevTools → Network → Offline
6. En la barra de direcciones, intenta navegar a una página que NO existe:
   ```
   http://localhost:XXXX/pagina-inexistente.html
   ```

**Verificación:**
Deberías ver la **página offline personalizada** con:
- ✅ Fondo oscuro (#121212)
- ✅ Icono de "sin conexión"
- ✅ Texto: "Sin conexión"
- ✅ Botón: "REINTENTAR"

**Test del Botón:**
1. Vuelve a poner Network en **"Online"**
2. Click en **"REINTENTAR"**
3. Deberías ver un error 404 (normal, la página no existe)

**✅ Criterio de Éxito:**
- La página offline se muestra correctamente
- El diseño es coherente con la app
- El botón funciona

---

### ✅ Test 9.3: Datos JSON Offline

**Pasos:**
1. Network → Online
2. Navega a "Lista Jugadores"
3. Verifica que los jugadores se cargan
4. Network → Offline
5. Recarga la página de "Lista Jugadores"

**Verificación:**
- ✅ Los jugadores deben seguir apareciendo (desde cache)
- ✅ El buscador debe funcionar
- ✅ No debe haber errores en la consola

**✅ Criterio de Éxito:**
- Los datos JSON se sirven desde el cache
- La funcionalidad no se ve afectada

---

### ✅ Test 9.4: Logging de Errores Offline

**Pasos:**
1. Network → Offline
2. Abre la consola
3. Navega por diferentes páginas

**Verificación en Consola:**
Deberías ver mensajes como:
```
🔌 [SW] Red no disponible para: http://localhost:XXXX/...
✅ [SW] Sirviendo desde cache: http://localhost:XXXX/...
```

**✅ Criterio de Éxito:**
- Los logs son claros y descriptivos
- No hay errores no manejados
- El SW maneja gracefully la falta de red

---

## Punto 10: Testing en Dispositivos Reales

### 🎯 Objetivo
Verificar que la PWA funciona correctamente en dispositivos móviles reales (Android/iOS).

---

### 🔧 Preparación: Exponer el Servidor Local

Para probar en dispositivos móviles, necesitas que tu servidor local sea accesible desde la red local.

**Opción A - Usando ngrok (Recomendado para HTTPS):**

```bash
# Instalar ngrok (si no lo tienes)
# Descarga desde: https://ngrok.com/download

# Con tu servidor corriendo en el puerto 8080:
ngrok http 8080

# Copia la URL HTTPS que te da (ej: https://abc123.ngrok.io)
```

**Opción B - Usando tu IP local:**

```bash
# Encuentra tu IP local:
# Windows:
ipconfig
# Busca "IPv4 Address" (ej: 192.168.1.100)

# Mac/Linux:
ifconfig
# Busca "inet" (ej: 192.168.1.100)

# Inicia el servidor con la IP:
http-server -p 8080 -a 0.0.0.0

# Accede desde el móvil: http://192.168.1.100:8080
```

**⚠️ IMPORTANTE:**
- El Service Worker solo funciona en HTTPS o localhost
- Si usas IP local, algunas funciones PWA pueden no funcionar
- **Recomendado**: Usa ngrok para obtener HTTPS

---

### ✅ Test 10.1: Android - Instalación PWA

**Dispositivo:** Android 10+ con Chrome

**Pasos:**
1. Abre Chrome en tu Android
2. Navega a la URL de ngrok (ej: `https://abc123.ngrok.io`)
3. Espera a que cargue completamente
4. Toca el menú (⋮) → **"Añadir a pantalla de inicio"** o **"Instalar app"**
5. Confirma la instalación

**Verificación:**
- ✅ Aparece un icono de PadelHub en tu pantalla de inicio
- ✅ El icono usa el logo correcto (no el icono genérico de Chrome)
- ✅ Al abrir, la app se abre en modo standalone (sin barra de navegación)

**Test de Funcionalidad:**
1. Abre la app desde el icono
2. Verifica que:
   - ✅ El badge del usuario aparece
   - ✅ La navegación funciona
   - ✅ Los estilos se aplican correctamente
   - ✅ El theme color (#ccff00) se aplica en la barra de estado

**✅ Criterio de Éxito:**
- La app se instala correctamente
- Funciona como app nativa
- El diseño es responsive

---

### ✅ Test 10.2: Android - Modo Offline

**Pasos:**
1. Con la app instalada y abierta
2. Activa el **Modo Avión** en tu Android
3. Cierra la app completamente (swipe desde recientes)
4. Abre la app de nuevo

**Verificación:**
- ✅ La app debe abrir normalmente
- ✅ Todas las páginas cacheadas deben funcionar
- ✅ Los datos deben mostrarse desde el cache

**Test de Página No Cacheada:**
1. Con modo avión activo
2. Intenta navegar a una página que no existe
3. Deberías ver la página offline personalizada

**✅ Criterio de Éxito:**
- La app funciona completamente offline
- No hay pantallas en blanco
- La experiencia es fluida

---

### ✅ Test 10.3: iOS - Instalación PWA

**Dispositivo:** iPhone/iPad con iOS 14+ y Safari

**Pasos:**
1. Abre **Safari** (no Chrome) en tu iPhone
2. Navega a la URL de ngrok
3. Toca el botón **Compartir** (cuadrado con flecha hacia arriba)
4. Scroll hacia abajo y toca **"Añadir a pantalla de inicio"**
5. Confirma

**Verificación:**
- ✅ Aparece un icono de PadelHub en tu pantalla de inicio
- ✅ El icono usa `apple-icon-180.png`
- ✅ Al abrir, se muestra el splash screen (si está configurado)
- ✅ La app se abre en modo standalone

**Test de Meta Tags iOS:**
1. Abre la app
2. Verifica que:
   - ✅ La barra de estado es translúcida (black-translucent)
   - ✅ No hay barra de navegación de Safari
   - ✅ El título en el icono es "PadelHub"

**✅ Criterio de Éxito:**
- La app se instala correctamente en iOS
- Los meta tags de Apple funcionan
- El splash screen se muestra (si aplica)

---

### ✅ Test 10.4: iOS - Modo Offline

**Pasos:**
1. Con la app instalada y abierta
2. Activa el **Modo Avión**
3. Cierra la app completamente (swipe hacia arriba)
4. Abre la app de nuevo

**Verificación:**
- ✅ La app debe abrir normalmente
- ✅ Las páginas cacheadas funcionan
- ✅ La página offline se muestra cuando corresponde

**⚠️ Limitación conocida de iOS:**
- iOS puede ser más agresivo limpiando el cache
- Si la app no se usa por varios días, el cache puede limpiarse

**✅ Criterio de Éxito:**
- La app funciona offline en iOS
- La experiencia es similar a Android

---

### ✅ Test 10.5: Actualización en Dispositivos Reales

**Pasos:**
1. Con la app instalada en tu móvil
2. En tu computadora, cambia la versión del SW:
   ```javascript
   const CACHE_NAME = 'padelhub-v2';
   ```
3. Guarda y espera a que el servidor se actualice
4. En el móvil, abre la app
5. Espera unos segundos

**Verificación:**
- ✅ Debería aparecer el banner de actualización
- ✅ Al tocar "ACTUALIZAR AHORA", la app se recarga
- ✅ La nueva versión se aplica correctamente

**✅ Criterio de Éxito:**
- El sistema de actualizaciones funciona en móviles
- El banner es visible y funcional
- La actualización es fluida

---

## 📊 Checklist Final de Testing

### Punto 8: Chrome DevTools ✅
- [ ] Service Worker registrado y activo
- [ ] Todos los recursos en cache (95+)
- [ ] Estrategias de cache funcionando
- [ ] Sistema de actualización funcional
- [ ] Manifest.json correcto
- [ ] App instalable desde Chrome

### Punto 9: Modo Offline ✅
- [ ] App funciona completamente offline
- [ ] Navegación entre páginas offline
- [ ] Página offline personalizada se muestra
- [ ] Datos JSON disponibles offline
- [ ] Logging de errores correcto

### Punto 10: Dispositivos Reales ✅
- [ ] Instalación en Android exitosa
- [ ] Modo offline en Android funcional
- [ ] Instalación en iOS exitosa
- [ ] Modo offline en iOS funcional
- [ ] Sistema de actualización en móviles
- [ ] Iconos y splash screens correctos

---

## 🐛 Troubleshooting Común

### Problema: El SW no se registra

**Solución:**
```javascript
// En la consola del navegador:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
// Luego recarga la página
```

### Problema: Cache no se actualiza

**Solución:**
1. DevTools → Application → Service Workers
2. Marca "Update on reload"
3. Click en "Unregister"
4. Recarga con `Ctrl+Shift+R`

### Problema: La app no es instalable

**Verificar:**
- ✅ Estás en HTTPS o localhost
- ✅ El manifest.json es válido
- ✅ Tienes al menos un icono de 192x192
- ✅ El Service Worker está activo

### Problema: Página offline no aparece

**Verificar:**
- ✅ `offline.html` está en el cache
- ✅ La estrategia `networkFirst` está implementada
- ✅ El SW está activo

---

## ✅ Conclusión

Una vez completados todos los tests:

1. ✅ Marca cada checkbox en este documento
2. ✅ Documenta cualquier problema encontrado
3. ✅ Actualiza `analisis_fase1_pwa.md` con los resultados
4. ✅ Si todo funciona, la Fase 1 está **COMPLETA**

**¡Felicidades! Tu PWA está lista para producción.** 🎉

---

**Última actualización**: 28 de enero de 2026  
**Próximo paso**: Fase 2 - Backend con Bun + Elysia + Supabase
