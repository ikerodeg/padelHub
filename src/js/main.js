/**
 * ==========================================
 * MAIN - Punto de entrada de la aplicación
 * ==========================================
 * Archivo: src/js/main.js
 * Se ejecuta en: index.html (landing page)
 */
console.log("🚪 → 📁 main.js");

import { initializeAppData } from './utils/dataLoader.js';
import { initializeCurrentUser, renderUserBadge } from './utils/auth.js';

/**
 * Inicialización principal de la aplicación
 */
async function init() {
  try {
    // 1. Cargar datos
    await initializeAppData();
    
    // 2. Inicializar sesión de usuario
    initializeCurrentUser();
    
    // 3. Renderizar badge del usuario
    renderUserBadge('.user-badge');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 APLICACIÓN INICIALIZADA CORRECTAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('💥 Error al inicializar aplicación:', error);
  }
}

// Ejecutar al cargar la página
init();