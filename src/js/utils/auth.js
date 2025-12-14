/**
 * ==========================================
 * AUTH - Sistema de autenticación de usuarios
 * ==========================================
 * Archivo: src/js/utils/auth.js
 * Proporciona funciones reutilizables para gestionar la sesión del usuario
 */
console.log("🚪 → 📁 auth.js");

import { getItem, setItem } from './storage.js';

/**
 * Obtiene la sesión actual del usuario desde localStorage
 * @returns {Object|null} - Objeto con { id, isAdmin } o null si no hay sesión
 */
export function getCurrentUser() {
  const session = getItem('currentUser');
  
  if (!session) {
    console.log('⚠️ No hay sesión activa');
    return null;
  }
  
  console.log(`👤 Sesión activa: Usuario ID ${session.id}`);
  return session;
}

/**
 * Inicializa la sesión del usuario
 * - Verifica si ya existe sesión en localStorage
 * - Si no existe, crea sesión simulada (Samu Coach - ID: 1)
 * @returns {Object} - Sesión del usuario { id, isAdmin }
 */
export function initializeCurrentUser() {
  console.log('👤 Inicializando sesión de usuario...');
  
  // Verificar si ya existe sesión
  const existingSession = getCurrentUser();
  
  if (existingSession) {
    console.log(`✅ Sesión encontrada: Usuario ID ${existingSession.id}`);
    return existingSession;
  }
  
  // Si no existe, crear sesión simulada (Samu Coach - Admin)
  console.log('📝 Creando sesión simulada...');
  
  const simulatedSession = {
    id: 1,          // Samu Coach (existe en players.json)
    isAdmin: true   // Rol de administrador
  };
  
  // Guardar en localStorage usando nuestro wrapper
  setItem('currentUser', simulatedSession);
  console.log('✅ Sesión creada: Usuario ID 1 (Samu Coach)');
  console.log('👑 Rol: Administrador');
  
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
  
  // Obtener lista de jugadores
  const players = getItem('players');
  
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
 * @returns {boolean} - true si se renderizó correctamente, false si hubo error
 */
export function renderUserBadge(containerSelector) {
  console.log(`🎨 Renderizando badge del usuario en: ${containerSelector}`);
  
  // Obtener datos completos del usuario
  const userData = getUserData();
  
  if (!userData) {
    console.error('❌ No se pudo obtener datos del usuario');
    return false;
  }
  
  // Buscar contenedor en el DOM
  const container = document.querySelector(containerSelector);
  
  if (!container) {
    console.error(`❌ No se encontró elemento: ${containerSelector}`);
    return false;
  }
  
  // Limpiar contenido existente
  container.innerHTML = '';
  
  // Crear elementos del badge
  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  avatar.textContent = userData.avatar; // Iniciales del jugador (ej: "SC")
  
  container.appendChild(avatar);
  if(document.body.getAttribute('aria-label') === 'landing-page') {
    const userName = document.createElement('span');
    userName.className = 'user-name';
    userName.textContent = userData.name;
  
    // Añadir avatar y nombre al contenedor
    container.appendChild(userName);
  }
  
  // Añadir badge de admin solo si es admin
  if (userData.isAdmin) {
    const adminBadge = document.createElement('span');
    adminBadge.className = 'admin-badge';
    adminBadge.textContent = '👑';
    adminBadge.setAttribute('aria-label', 'Administrador');
    container.appendChild(adminBadge);
    
    console.log('👑 Badge de administrador añadido');
  }
  
  console.log(`✅ Badge renderizado: ${userData.name}`);
  return true;
}




