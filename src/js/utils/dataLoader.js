/**
 * ==========================================
 * DATA LOADER - Sistema de carga de datos
 * ==========================================
 * Archivo: src/js/utils/dataLoader.js
*/

import { setItem, getItem } from './storage.js';

console.log("🚪 → 📁 dataLoader.js");

/**
 * Calcula el prefijo de ruta necesario basándose en la ubicación actual
 * Permite que los scripts funcionen desde / o desde /pages/ o /pages/admin/
 */
function getPathPrefix() {
    const path = window.location.pathname;
    if (path.includes('/pages/admin/')) return '../../';
    if (path.includes('/pages/')) return '../';
    return './';
}

const PREFIX = getPathPrefix();

/**
 * Carga un archivo JSON desde una URL
 * @param {string} url - Ruta al archivo JSON (ej: 'data/players.json')
 * @returns {Promise<any>} - Datos del JSON parseados
 * @throws {Error} - Si falla la carga o el parseo
 */
async function loadJSON(url) {
  console.log(`⏳ Cargando archivo: ${url}`);
  
  try {
    // Realizar petición fetch
    const response = await fetch(url);
    
    // Verificar que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parsear JSON
    const data = await response.json();
    
    // Validar que los datos no estén vacíos
    if (!data) {
      throw new Error(`El archivo ${url} está vacío o no es válido`);
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error al cargar ${url}:`, error.message);
    throw error; // Re-lanzar el error para manejarlo en niveles superiores
  }
}

/**
 * Carga todos los archivos JSON necesarios para la aplicación
 * @returns {Promise<Object>} - Objeto con todos los datos: { players, clubs, matches, results }
 * @throws {Error} - Si algún archivo falla al cargar
 */
async function loadAllData() {
  console.log('⚙️ Ejecutando loadAllData()...');
  
  try {
    // Cargar todos los JSON en paralelo con Promise.all
    const [players, clubs, matches, results] = await Promise.all([
      loadJSON(`${PREFIX}data/players.json`),
      loadJSON(`${PREFIX}data/clubs.json`),
      loadJSON(`${PREFIX}data/matches.json`),
      loadJSON(`${PREFIX}data/results.json`)
    ]);
    
    // Validar que todos los datos se cargaron
    if (!players || !clubs || !matches || !results) {
      throw new Error('Algunos datos no se cargaron correctamente');
    }
    
    // Crear objeto con todos los datos
    const allData = {
      players,
      clubs,
      matches,
      results
    };
    
    // Logs detallados de confirmación
    console.log('✅ Archivos JSON cargados');
    
    return allData;
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO AL CARGAR DATOS');
    console.error('Mensaje:', error.message);
    throw error;
  }
}

/**
 * Inicializa los datos de la aplicación
 * - Verifica si ya existen en localStorage (cache)
 * - Si no existen, los carga desde JSON
 * - Guarda los datos en localStorage
 * @returns {Promise<Object>} - Objeto con todos los datos cargados
 */
async function initializeAppData() {
  console.log('⚙️ Ejecutando initializeAppData()...');
  
  try {
    // Guarda en una variable el objeto JSON cacheado
    const allDataObjectCached = await getItem('allDataObject');
    
    // Si existen datos en cache, usarlos
    if (allDataObjectCached) {
      console.log('💾 Datos encontrados en cache (localStorage)');
      
      // Retorna el objeto
      return allDataObjectCached;
    }
    
    // Si no hay cache, cargar desde JSON
    console.log('❌ NO HAY CACHE - Cargando archivos JSON...');
    
    // Guardar todos los datos en un solo objeto JSON
    const allDataObject = await loadAllData();

    // Guardar el objeto JSON en localStorage
    console.log('💾 Guardando objeto unificador de todos los JSON en localStorage...');
    setItem('allDataObject', allDataObject);
    
    return allDataObject;
  } catch (error) {
    console.error('❌ ERROR CRÍTICO AL INICIALIZAR APLICACIÓN');
    console.error('Mensaje:', error.message);
    throw error;
  }
}

/**
 * Fuerza la recarga de todos los datos
 * - Limpia el cache de localStorage
 * - Carga datos desde JSON
 * - Guarda nuevamente en localStorage
 * @returns {Promise<Object>} - Objeto con todos los datos actualizados
 */
async function refreshData() {
  console.log('🔄 FORZANDO ACTUALIZACIÓN DE DATOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️ Limpiando cache de localStorage...');
  
  try {
    // Limpiar localStorage
    localStorage.removeItem('players');
    localStorage.removeItem('clubs');
    localStorage.removeItem('matches');
    localStorage.removeItem('results');
    console.log('✅ Cache limpiado correctamente');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📂 Recargando datos desde archivos JSON...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Cargar datos frescos desde JSON
    const allData = await loadAllData();
    
    // Guardar en localStorage
    console.log('💾 Guardando datos actualizados en localStorage...');
    setItem('allDataObject', allData);
    console.log('✅ Datos guardados en cache exitosamente');
    
    return allData;
    
  } catch (error) {
    throw error;
  }
}

// Exportar funciones
export { loadJSON, loadAllData, initializeAppData, refreshData };