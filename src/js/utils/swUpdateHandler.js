/**
 * Service Worker Update Handler
 * Maneja la detección y notificación de actualizaciones del Service Worker
 */

/**
 * Mostrar banner de actualización con diseño premium y soporte para móviles
 */
export function showUpdateBanner() {
  // Evitar duplicados
  if (document.getElementById('update-banner')) return;

  console.log('📢 Mostrando banner de actualización');

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #0084ff 0%, #0066cc 100%);
      color: #ffffff;
      padding-top: max(env(safe-area-inset-top, 0px), 1rem);
      padding-bottom: 1rem;
      padding-left: max(env(safe-area-inset-left, 0px), 1.5rem);
      padding-right: max(env(safe-area-inset-right, 0px), 1.5rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 132, 255, 0.3);
      z-index: 2147483647;
      animation: slideDown 0.3s ease-out;
      flex-wrap: wrap;
    ">
      <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 200px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
          <path d="M16 16h5v5"></path>
        </svg>
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">Nueva versión disponible</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">Actualiza para obtener las últimas mejoras</div>
        </div>
      </div>
      <button id="update-banner-btn" style="
        background: #ffffff;
        color: #0084ff;
        border: none;
        padding: 0.65rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
      ">
        ACTUALIZAR AHORA
      </button>
    </div>
    <style>
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      #update-banner-btn:hover,
      #update-banner-btn:active {
        transform: scale(1.05);
      }
      
      /* Asegurar que el banner esté sobre todo */
      #update-banner {
        isolation: isolate;
      }
    </style>
  `;
  
  document.body.prepend(banner);
  
  // Agregar event listener al botón
  const updateBtn = document.getElementById('update-banner-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      console.log('🔄 Recargando página para aplicar actualización');
      location.reload();
    });
  }
}

/**
 * Inicializar el manejador de actualizaciones del Service Worker
 */
export function initServiceWorkerUpdateHandler() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker no soportado en este navegador');
    return;
  }

  // Escuchar mensajes del Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log('📢 [SW] Mensaje recibido: Nueva versión disponible');
      showUpdateBanner();
    }
  });

  console.log('✅ Service Worker update handler inicializado');
}

/**
 * Registrar el Service Worker (solo para index.html)
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker no soportado en este navegador');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('✅ [SW] Service Worker registrado correctamente:', registration.scope);

        // Detectar actualizaciones del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 [SW] Nueva versión detectada');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              console.log('✨ [SW] Nueva versión activada');
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ [SW] Error al registrar Service Worker:', error);
      });
  });
}
