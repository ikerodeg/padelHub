/**
 * PadelHub - Service Worker
 * @version 1.0
 * @description Gestión de cache y modo offline para el proyecto PadelHub.
 */

const CACHE_NAME = 'padelhub-v8';

/**
 * Manejador global de errores no capturados
 */
self.addEventListener('error', (event) => {
  console.error('[SW] 💥 Error no capturado:', event.error);
  console.error('[SW] 📋 Stack:', event.error?.stack);
});

/**
 * Manejador de promesas rechazadas no capturadas
 */
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] 💥 Promise rechazada no manejada:', event.reason);
  event.preventDefault(); // Evitar que el error se propague
});

// Lista de archivos críticos para el precaching
const PRECACHE_ASSETS = [
  // Core
  './',
  './index.html',
  './manifest.json',
  './offline.html',
  
  // Pages
  './pages/crear-partida.html',
  './pages/lista-jugadores.html',
  './pages/lista-partidas.html',
  './pages/login.html',
  './pages/perfil.html',
  './pages/ranking.html',
  './pages/resultados.html',
  './pages/torneos.html',
  
  // Admin Pages
  './pages/admin/admin.html',
  './pages/admin/jugadorPerfilAdmin.html',
  './pages/admin/jugadoresAdmin.html',
  './pages/admin/partidaEdicionAdmin.html',
  './pages/admin/partidasAdmin.html',
  
  // CSS - Core & Components
  './src/css/normalize.css',
  './src/css/variables.css',
  './src/css/style.css',
  './src/css/components/baseLayout.css',
  './src/css/components/footer.css',
  './src/css/components/buttons.css',
  './src/css/components/authUser.css',
  './src/css/components/header.css',
  './src/css/components/pageHeader.css',
  './src/css/components/forms.css',
  './src/css/components/filter-tabs.css',
  
  // CSS - Pages
  './src/css/pages/crear-partida.css',
  './src/css/pages/lista-jugadores.css',
  './src/css/pages/lista-partidas.css',
  './src/css/pages/login.css',
  './src/css/pages/perfil.css',
  './src/css/pages/ranking.css',
  './src/css/pages/resultados.css',
  './src/css/pages/torneos.css',
  './src/css/pages/admin/jugadorPerfilAdmin.css',
  './src/css/pages/admin/jugadoresAdmin.css',
  
  // JS - Core & Utils
  './src/js/main.js',
  './src/js/utils/auth.js',
  './src/js/utils/dataLoader.js',
  './src/js/utils/storage.js',
  './src/js/utils/errores.js',
  './src/js/utils/statusHelper.js',
  './src/js/utils/swUpdateHandler.js',
  
  // JS - Components
  './src/js/components/notification.js',
  './src/js/components/userAvatar.js',
  
  // JS - Pages
  './src/js/pages/crearPartida.js',
  './src/js/pages/listaJugadores.js',
  './src/js/pages/listaPartidas.js',
  './src/js/pages/login.js',
  './src/js/pages/perfil.js',
  './src/js/pages/ranking.js',
  './src/js/pages/resultados.js',
  './src/js/pages/torneos.js',
  './src/js/pages/admin/jugadorPerfilAdmin.js',
  './src/js/pages/admin/jugadoresAdmin.js',
  './src/js/pages/admin/partidaEdicionAdmin.js',
  './src/js/pages/admin/partidasAdmin.js',
  
  // Data (Critical for current offline logic)
  './data/players.json',
  './data/clubs.json',
  './data/matches.json',
  
  // Assets
  './assets/img/icons/logo.png',
  './assets/img/icons/icons8-volver-48.png',
  './assets/img/icons/icons8-volver-50.png',
  './assets/img/icons/icons8-volver-64.png',
  './assets/img/icons/favicon-196.png',
  './assets/img/icons/manifest-icon-192.maskable.png',
  './assets/img/icons/manifest-icon-512.maskable.png',
  './assets/img/icons/apple-icon-180.png'
];

/**
 * Evento INSTALL: Precarga de archivos críticos.
 */
self.addEventListener('install', (event) => {
  console.log('[SW] 🔧 Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 📦 Iniciando precaching de activos críticos');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] ✅ Precaching completado exitosamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] ❌ Error durante la instalación:', error);
        console.error('[SW] 📋 Detalles:', {
          message: error.message,
          stack: error.stack
        });
        // Intentar continuar con la instalación a pesar del error
        return self.skipWaiting();
      })
  );
});

/**
 * Evento ACTIVATE: Limpieza de versiones antiguas de cache.
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] 🔄 Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('[SW] 🗑️ Limpiando caches antiguos...');
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] 🧹 Borrando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] 📢 Notificando a clientes sobre actualización...');
        // Notificar a todos los clientes que hay una nueva versión
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_NAME
            });
          });
          console.log(`[SW] 📨 Notificación enviada a ${clients.length} cliente(s)`);
        });
      })
      .then(() => {
        console.log('[SW] ✅ Activación completada exitosamente');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[SW] ❌ Error durante la activación:', error);
        console.error('[SW] 📋 Detalles:', {
          message: error.message,
          stack: error.stack
        });
        // Intentar reclamar clientes a pesar del error
        return self.clients.claim();
      })
  );
});

/**
 * Evento FETCH: Intercepción de peticiones y aplicación de estrategias de cache.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  try {
    const url = new URL(request.url);
    
    // Solo manejar peticiones GET y protocolos HTTP/HTTPS
    if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

    // Solo manejar peticiones a nuestro propio dominio
    if (url.origin !== self.location.origin) return;

    // Estrategia según el tipo de recurso
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
      // 1. HTML: Stale While Revalidate (Fixes white screen flash)
      event.respondWith(staleWhileRevalidate(request));
    } else if (url.pathname.endsWith('.json')) {
      // 2. Data JSON: Network First
      event.respondWith(networkFirst(request));
    } else if (url.pathname.match(/\.(js|css)$/)) {
      // 3. JS y CSS: Stale While Revalidate
      event.respondWith(staleWhileRevalidate(request));
    } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
      // 4. Imágenes: Cache First
      event.respondWith(cacheFirst(request));
    } else {
      // Resto: Por defecto Cache First para assets estáticos
      event.respondWith(cacheFirst(request));
    }
  } catch (error) {
    console.error('[SW] ❌ Error en fetch event:', error);
    // Fallback genérico en caso de error crítico
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).catch(() => {
          // Si todo falla, intentar retornar la página offline
          if (request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
          return new Response('Error de red', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
  }
});

/**
 * Estrategia: Network First
 * Intenta red, si falla busca en cache.
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      cache.put(request, response.clone()).catch(err => {
        console.warn('[SW] ⚠️ No se pudo cachear:', request.url, err);
      });
    }
    return response;
  } catch (error) {
    console.warn('[SW] 🔌 Red no disponible (fetch failed):', request.url, error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[SW] ✅ Sirviendo desde cache:', request.url);
      return cachedResponse;
    }

    // Si falla la red y no hay cache, y es una navegación HTML, mostrar página offline
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
      console.log('[SW] 📴 Mostrando página offline');
      const offlinePage = await cache.match('./offline.html');
      return offlinePage || new Response('Offline', { status: 503 });
    }

    console.error('[SW] ❌ No se pudo servir (Red y Cache fallaron):', request.url, error);
    // En lugar de 503, intentamos un fetch directo sin SW si es posible, o retornamos error
    return fetch(request);
  }
}

/**
 * Estrategia: Cache First
 * Busca en cache, si no está va a la red y guarda el resultado.
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  let cachedResponse = await cache.match(request);
  
  // Mejora: Si no hay match y es un recurso de assets, intentar buscarlo por su ruta raíz
  // Esto previene que rutas relativas desde subcarpetas (como en el modo offline) fallen
  if (!cachedResponse && request.url.includes('/assets/img/icons/')) {
    const filename = request.url.split('/').pop();
    cachedResponse = await cache.match(`./assets/img/icons/${filename}`);
    if (cachedResponse) {
      console.log(`[SW] 💡 Cache Match alternativo para: ${filename}`);
    }
  }

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone()).catch(err => {
        console.warn('[SW] ⚠️ No se pudo cachear:', request.url, err);
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] 🔌 Error de red para:', request.url, error);
    // Si falla todo, intentamos fetch normal para que el navegador maneje el error
    return fetch(request);
  }
}

/**
 * Estrategia: Stale While Revalidate
 * Retorna cache inmediatamente (si existe) y actualiza en background desde la red.
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkFetch = fetch(request.clone())
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone()).catch(err => {
          console.warn('[SW] ⚠️ No se pudo actualizar cache:', request.url, err);
        });
      }
      return networkResponse;
    })
    .catch(error => {
      console.warn('[SW] 🔌 Error al revalidar:', request.url, error);
      // Si falla la red y hay cache, retornamos cache. Si no, intentamos fetch directo.
      return cachedResponse || fetch(request);
    });

  return cachedResponse || networkFetch;
}
