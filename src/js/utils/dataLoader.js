/**
 * ==========================================
 * DATA LOADER - Sistema de carga de datos
 * ==========================================
 * Archivo: src/js/utils/dataLoader.js
*/
console.log("🚪 → 📁 dataLoader.js");

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
    
    console.log(`✅ Archivo cargado correctamente: ${url}`);
    console.log(`📊 Datos cargados:`, data);
    
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
  console.log('🚀 Iniciando carga de todos los datos...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Cargar todos los JSON en paralelo con Promise.all
    const [players, clubs, matches, results] = await Promise.all([
      loadJSON('data/players.json'),
      loadJSON('data/clubs.json'),
      loadJSON('data/matches.json'),
      loadJSON('data/results.json')
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TODOS LOS DATOS CARGADOS EXITOSAMENTE');
    console.log(`📊 Estadísticas:`);
    console.log(`   👥 Jugadores: ${players.length}`);
    console.log(`   🏟️  Clubs: ${clubs.length}`);
    console.log(`   🎾 Partidas: ${matches.length}`);
    console.log(`   🏆 Resultados: ${results.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return allData;
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR CRÍTICO AL CARGAR DATOS');
    console.error('Mensaje:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
  console.log('🎬 INICIANDO APLICACIÓN - PadelSamu');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Verificar si ya existen datos en cache
    const cachedPlayers = localStorage.getItem('players');
    const cachedClubs = localStorage.getItem('clubs');
    const cachedMatches = localStorage.getItem('matches');
    const cachedResults = localStorage.getItem('results');
    
    // Si existe cache completo, usarlo
    if (cachedPlayers && cachedClubs && cachedMatches && cachedResults) {
      console.log('💾 DATOS ENCONTRADOS EN CACHE (localStorage)');
      console.log('✅ No es necesario recargar desde archivos JSON');
      
      // Parsear datos del cache
      const allData = {
        players: JSON.parse(cachedPlayers),
        clubs: JSON.parse(cachedClubs),
        matches: JSON.parse(cachedMatches),
        results: JSON.parse(cachedResults)
      };
      
      console.log('📊 Estadísticas del cache:');
      console.log(`   👥 Jugadores: ${allData.players.length}`);
      console.log(`   🏟️  Clubs: ${allData.clubs.length}`);
      console.log(`   🎾 Partidas: ${allData.matches.length}`);
      console.log(`   🏆 Resultados: ${allData.results.length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ APLICACIÓN LISTA');
      
      return allData;
    }
    
    // Si no hay cache, cargar desde JSON
    console.log('📂 NO HAY CACHE - Cargando desde archivos JSON...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allData = await loadAllData();
    
    // Guardar en localStorage
    console.log('💾 Guardando datos en localStorage...');
    localStorage.setItem('players', JSON.stringify(allData.players));
    localStorage.setItem('clubs', JSON.stringify(allData.clubs));
    localStorage.setItem('matches', JSON.stringify(allData.matches));
    localStorage.setItem('results', JSON.stringify(allData.results));
    console.log('✅ Datos guardados en cache correctamente');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ APLICACIÓN LISTA');
    
    return allData;
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR CRÍTICO AL INICIALIZAR APLICACIÓN');
    console.error('Mensaje:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    localStorage.setItem('players', JSON.stringify(allData.players));
    localStorage.setItem('clubs', JSON.stringify(allData.clubs));
    localStorage.setItem('matches', JSON.stringify(allData.matches));
    localStorage.setItem('results', JSON.stringify(allData.results));
    console.log('✅ Datos guardados en cache correctamente');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ACTUALIZACIÓN COMPLETADA');
    
    return allData;
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR AL ACTUALIZAR DATOS');
    console.error('Mensaje:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw error;
  }
}

// Exportar funciones
export { loadJSON, loadAllData, initializeAppData, refreshData };