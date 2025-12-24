/**
 * ==========================================
 * AUTH - Sistema de autenticación de usuarios
 * ==========================================
 * Archivo: src/js/utils/auth.js
 * Proporciona funciones reutilizables para gestionar la sesión del usuario
 */
console.log("🚪 → 📁 auth.js");

import { initializeAppData } from './dataLoader.js';
import { getItem, setItem } from './storage.js';

/**
 * Obtiene la sesión actual del usuario desde localStorage
 * @returns {Object|null} - Objeto con { id, isAdmin } o null si no hay sesión
 */
export function getCurrentUser() {
  const session = getItem('currentUser');
  
  if (!session) {
    return null;
  }
  
  return session;
}

/**
 * Inicializa la sesión del usuario
 * - Verifica si ya existe sesión en localStorage
 * - Si no existe, crea sesión simulada (Samu Coach - ID: 1)
 * @returns {Object} - Sesión del usuario { id, isAdmin }
 */
export function initializeCurrentUser() {
  console.log('⚙️ Ejecutando initializeCurrentUser()...');
  
  // Guarda en una variable la sesión existente en localStorage
  const existingSession = getCurrentUser();

  // Si existe sesión, devolverla
  if (existingSession) {
    console.log(`✅ Sesión encontrada: Usuario ID ${existingSession.id} - Rol: ${existingSession.isAdmin ? 'Administrador' : 'Usuario'}`);
    return existingSession;
  }
  
  // Si no existe, crear sesión simulada (Samu Coach - Admin)
  const simulatedSession = {
    id: 1,          // Samu Coach (existe en players.json)
    isAdmin: true   // Rol de administrador
  };
  
  // Guardar en localStorage usando nuestro wrapper
  setItem('currentUser', simulatedSession);
  console.log('✅ Sesión creada: Usuario ID 1 (Samu Coach) - Rol: Administrador');
  
  return simulatedSession;
}

/**
 * Obtiene los datos completos del usuario actual
 * - Combina la sesión (id, isAdmin) con los datos del jugador (name, avatar, etc.)
 * @returns {Object|null} - Datos completos del jugador o null si no existe
 */
export function getUserData() {
  // Obtener sesión actual
  const session = getCurrentUser();
  
  if (!session) {
    console.error('❌ No hay sesión activa');
    return null;
  }
  
  // Obtener el objeto JSON completo cacheado
  const allDataObjectCached = getItem('allDataObject');
  
  // Guardamos los jugadores en una variable  
  const players = allDataObjectCached.players;
  
  if (!players) {
    console.error('❌ No se encontraron datos de jugadores en localStorage');
    return null;
  }
  
  // Buscar jugador por ID
  const player = players.find(p => p.id === session.id);
  
  if (!player) {
    console.error(`❌ No se encontró jugador con ID ${session.id}`);
    return null;
  }
  
  // Combinar datos de sesión con datos del jugador
  const userData = {
    ...player,
    isAdmin: session.isAdmin
  };
  
  console.log(`✅ Datos del usuario obtenidos: ${player.name}`);
  return userData;
}

/**
 * Verifica si hay un usuario logueado
 * @returns {boolean} - true si existe sesión activa, false si no
 */
export function isUserLoggedIn() {
  const session = getCurrentUser();
  return session !== null;
}

/**
 * Renderiza el badge del usuario en un contenedor específico
 * @param {string} containerSelector - Selector CSS del contenedor (ej: '.user-badge')
 * @param {Object} userData - Opcional. Datos del usuario. Si no se provee, se obtiene del cache
 * @returns {boolean} - true si se renderizó correctamente, false si hubo error
 */
export function renderUserBadge(containerSelector, userData = null) {
  console.log(`🎨 Renderizando badge del usuario en: ${containerSelector}`);

  // Si no se proveen los datos, obtenerlos del cache (lectura directa, sin búsquedas)
  if (!userData) {
    userData = getCachedUserData();
  }

  // Validar datos del usuario
  if (!userData) {
    console.error('❌ No se pudo obtener datos del usuario');
    return false;
  }

  // Validar propiedades requeridas
  if (!userData.name || !userData.avatar) {
    console.error('❌ Datos del usuario incompletos - faltan name o avatar');
    return false;
  }

  // Validar que el DOM esté listo
  if (!document.body) {
    console.error('❌ DOM no está listo aún');
    return false;
  }

  // Buscar contenedor en el DOM con validación mejorada
  let container = document.querySelector(containerSelector);

  if (!container) {
    console.warn(`⚠️ Contenedor ${containerSelector} no encontrado. Esperando a que el DOM esté completamente cargado...`);

    // Intentar nuevamente después de un breve delay (útil para carga asíncrona)
    setTimeout(() => {
      container = document.querySelector(containerSelector);
      if (container) {
        console.log('✅ Contenedor encontrado en reintento');
        renderBadgeContent(container, userData);
      } else {
        console.error(`❌ Contenedor ${containerSelector} no encontrado después de reintento`);
      }
    }, 100);

    return false; // Retornar false inicialmente
  }
  
  // Renderizar contenido del badge
  return renderBadgeContent(container, userData);
}

/**
 * Función helper para renderizar el contenido del badge
 * @param {HTMLElement} container - Elemento contenedor
 * @param {Object} userData - Datos del usuario
 * @returns {boolean} - true si se renderizó correctamente
 */
function renderBadgeContent(container, userData) {
  try {
    // Limpiar contenido existente
    container.innerHTML = '';

    // Crear elementos del badge
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = userData.avatar; // Iniciales del jugador (ej: "SC")
    avatar.setAttribute('aria-label', `Avatar de ${userData.name}`);

    container.appendChild(avatar);

    // Añadir nombre solo en landing page
    if (document.body.getAttribute('aria-label') === 'landing-page') {
      const userName = document.createElement('span');
      userName.className = 'user-name';
      userName.textContent = userData.name;
      userName.setAttribute('aria-label', `Usuario: ${userData.name}`);

      container.appendChild(userName);
    }

    // Añadir badge de admin solo si es admin
    if (userData.isAdmin) {
      const adminBadge = document.createElement('span');
      adminBadge.className = 'admin-badge';
      adminBadge.textContent = '👑';
      adminBadge.setAttribute('aria-label', 'Administrador');
      adminBadge.setAttribute('title', 'Usuario Administrador');

      container.appendChild(adminBadge);
      console.log('👑 Badge de administrador añadido');
    }

    console.log(`✅ Badge renderizado: ${userData.name}`);
    return true;

  } catch (error) {
    console.error('❌ Error al renderizar badge:', error.message);
    return false;
  }
}

/**
 * Cachea los datos completos del usuario en localStorage
 * Evita tener que hacer búsquedas repetidas en el array de jugadores
 * @returns {Object|null} - Datos del usuario cacheados o null si hay error
 */
export function cacheUserData() {
  console.log('💾 Cacheando datos completos del usuario...');
  
  const userData = getUserData();
  
  if (!userData) {
    console.error('❌ No se pudieron obtener datos del usuario para cachear');
    return null;
  }
  
  // Guardar userData completo en localStorage
  setItem('cachedUserData', userData);
  console.log(`✅ Datos del usuario cacheados: ${userData.name}`);
  
  return userData;
}

/**
 * Obtiene los datos del usuario desde el cache
 * Lectura directa de localStorage sin búsquedas en arrays
 * @returns {Object|null} - Datos completos del usuario o null si no existe cache
 */
export function getCachedUserData() {
  const cachedData = getItem('cachedUserData');
  
  if (!cachedData) {
    console.warn('⚠️ No hay datos de usuario en cache');
    return null;
  }
  
  console.log(`✅ Datos de usuario obtenidos desde cache: ${cachedData.name}`);
  return cachedData;
}

/**
 * Inicializa la sesión completa del usuario
 * - Crea/obtiene sesión
 * - Obtiene datos completos del usuario
 * - Cachea los datos
 * - Renderiza el badge en el DOM
 * @param {string} containerSelector - Selector CSS del contenedor del badge
 * @returns {Promise<Object|null>} - Datos del usuario o null si hay error
 */
export async function initializeUserSession(containerSelector) {
  console.log('👤 Inicializando sesión completa de usuario...');

  try {
    // 1. Crear/obtener sesión
    const session = initializeCurrentUser();

    // 2. Intentar obtener datos del usuario del cache primero (más eficiente)
    let userData = getCachedUserData();

    if (!userData) {
      console.log('📝 No hay datos de usuario en cache, obteniendo desde datos principales...');

      // Si no hay cache, obtener datos completos (búsqueda en array)
      userData = getUserData();

      if (!userData) {
        throw new Error('No se pudieron obtener los datos del usuario');
      }

      // Cachear datos para futuras inicializaciones
      cacheUserData(userData);
    } else {
      console.log('💾 Usando datos de usuario desde cache');
    }

    // 3. Renderizar badge del usuario
    const renderSuccess = renderUserBadge(containerSelector, userData);

    if (!renderSuccess) {
      console.warn('⚠️ No se pudo renderizar el badge del usuario, pero la sesión está inicializada');
    }

    console.log('✅ Sesión de usuario inicializada completamente');
    return userData;

  } catch (error) {
    console.error('❌ Error al inicializar sesión de usuario:', error.message);
    throw error;
  }
}


