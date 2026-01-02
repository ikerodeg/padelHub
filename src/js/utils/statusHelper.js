/**
 * ==========================================
 * STATUS HELPER - Utilidades para manejo de estados
 * ==========================================
 * Archivo: src/js/utils/statusHelper.js
 * 
 * Proporciona funciones para trabajar con el campo 'status' de partidas,
 * soportando tanto formato legacy (string) como nuevo formato (array).
 */

/**
 * Verifica si una partida tiene un estado específico
 * Compatible con formato string (legacy) y array (nuevo)
 * @param {Object} match - Objeto de partida
 * @param {string} statusToCheck - Estado a verificar
 * @returns {boolean} true si la partida tiene ese estado
 */
export function hasStatus(match, statusToCheck) {
  if (!match || !match.status) {
    return false;
  }

  if (Array.isArray(match.status)) {
    return match.status.includes(statusToCheck);
  }
  
  // Formato legacy (string)
  return match.status === statusToCheck;
}

/**
 * Añade un estado a una partida (sin duplicados)
 * @param {Object} match - Objeto de partida
 * @param {string} newStatus - Estado a añadir
 */
export function addStatus(match, newStatus) {
  if (!match) {
    console.warn('⚠️ addStatus: match es null o undefined');
    return;
  }

  // Convertir a array si aún es string (migración automática)
  if (!Array.isArray(match.status)) {
    match.status = [match.status];
  }

  // Añadir solo si no existe
  if (!match.status.includes(newStatus)) {
    match.status.push(newStatus);
  }
}

/**
 * Elimina un estado de una partida
 * @param {Object} match - Objeto de partida
 * @param {string} statusToRemove - Estado a eliminar
 */
export function removeStatus(match, statusToRemove) {
  if (!match || !match.status) {
    console.warn('⚠️ removeStatus: match o status es null/undefined');
    return;
  }

  if (Array.isArray(match.status)) {
    match.status = match.status.filter(s => s !== statusToRemove);
  } else {
    // Formato legacy: si coincide, convertir a array vacío
    if (match.status === statusToRemove) {
      match.status = [];
    }
  }
}

/**
 * Reemplaza todos los estados por uno(s) nuevo(s)
 * @param {Object} match - Objeto de partida
 * @param {string|Array<string>} newStatus - Nuevo(s) estado(s)
 */
export function setStatus(match, newStatus) {
  if (!match) {
    console.warn('⚠️ setStatus: match es null o undefined');
    return;
  }

  match.status = Array.isArray(newStatus) ? newStatus : [newStatus];
}

/**
 * Obtiene todos los estados de una partida como array
 * @param {Object} match - Objeto de partida
 * @returns {Array<string>} Array de estados
 */
export function getStatuses(match) {
  if (!match || !match.status) {
    return [];
  }

  return Array.isArray(match.status) ? match.status : [match.status];
}
