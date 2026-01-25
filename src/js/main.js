/**
 * ==========================================
 * MAIN - Punto de entrada de la aplicación
 * ==========================================
 * Archivo: src/js/main.js
 * Se ejecuta en: index.html (landing page)
 */
console.log("🚪 → 📁 main.js");

import { initializeAppData } from './utils/dataLoader.js';
import { initializeUserSession } from './utils/auth.js';
import { mostrarErrorCritico } from './utils/errores.js';

/**
 * Inicialización principal de la aplicación
 * Versión mejorada con manejo de errores robusto
 */
async function init() {
  console.log('⚙️ Ejecutando init()...');

  try {
    // 1. Cargar datos de la aplicación
    await initializeAppData();

    // 2. Inicializar sesión completa del usuario (sesión + UI)
    await initializeUserSession('.user-badge');

    console.log('🚀 APLICACIÓN INICIALIZADA EXITOSAMENTE');

  } catch (error) {
    console.error('💥 Error crítico al inicializar aplicación:', error.message);

    // Mostrar error crítico al usuario
    mostrarErrorCritico(
      'Error al cargar la aplicación',
      `No se pudo inicializar PadelHub. ${error.message}`,
      '🔄 Reintentar'
    );
  }
}


// Ejecutar al cargar la página
init();