/**
 * Lógica para la página lista-jugadores.html
 * Carga jugadores desde localStorage, ordena alfabéticamente y renderiza cards
 */

console.log('📋 → listaJugadores.js');

import { renderUserBadge } from '../utils/auth.js';
import { initializeAppData } from '../utils/dataLoader.js';

// Variables globales
let allPlayers = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
  
  // Cargar y renderizar jugadores
  await loadAndRenderPlayers();
  
  // Configurar búsqueda
  setupSearch();
});

/**
 * Carga los datos de jugadores desde localStorage y los renderiza
 */
async function loadAndRenderPlayers() {
  try {
    // Obtener datos de localStorage (via dataLoader)
    const appData = await initializeAppData();
    
    if (!appData || !appData.players) {
      console.error('❌ No se encontraron datos de jugadores');
      showEmptyState();
      return;
    }
    
    // Guardar referencia global para búsqueda
    allPlayers = appData.players;
    
    // Ordenar alfabéticamente por nombre
    const sortedPlayers = sortPlayersAlphabetically(allPlayers);
    
    // Renderizar en el DOM
    renderPlayerCards(sortedPlayers);
    
    console.log(`✅ ${sortedPlayers.length} jugadores cargados`);
    
  } catch (error) {
    console.error('❌ Error al cargar jugadores:', error);
    showEmptyState();
  }
}

/**
 * Ordena jugadores alfabéticamente por nombre
 * @param {Array} players - Array de objetos jugador
 * @returns {Array} - Array ordenado
 */
function sortPlayersAlphabetically(players) {
  return [...players].sort((a, b) => 
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  );
}

/**
 * Renderiza las cards de jugadores en el grid
 * @param {Array} players - Array de jugadores a renderizar
 */
function renderPlayerCards(players) {
  const grid = document.getElementById('playersGrid');
  
  if (!grid) {
    console.error('❌ No se encontró el contenedor #playersGrid');
    return;
  }
  
  // Limpiar grid
  grid.innerHTML = '';
  
  // Si no hay jugadores, mostrar estado vacío
  if (players.length === 0) {
    showEmptyState();
    return;
  }
  
  // Renderizar cada jugador
  players.forEach(player => {
    const card = createPlayerCard(player);
    grid.appendChild(card);
  });
}

/**
 * Crea un elemento card para un jugador
 * @param {Object} player - Datos del jugador
 * @returns {HTMLElement} - Elemento <a> con la card
 */
function createPlayerCard(player) {
  const card = document.createElement('a');
  card.href = `perfil.html?id=${player.id}`;
  card.className = 'player-card';
  
  // Determinar clase del badge según posición
  const positionClass = player.position === 'drive' ? 'badge-drive' : 'badge-reves';
  const positionText = player.position === 'drive' ? 'Drive' : 'Revés';
  
  // Obtener iniciales del avatar
  const avatar = getPlayerInitials(player);
  
  card.innerHTML = `
    <div class="player-avatar">${avatar}</div>
    <div class="player-info">
      <span class="player-name">${player.name}</span>
      <span class="position-badge ${positionClass}">${positionText}</span>
    </div>
    <svg class="card-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;
  
  return card;
}

/**
 * Obtiene las iniciales del jugador para el avatar
 * Si el avatar ya contiene un emoji o iniciales, las usa directamente
 * @param {Object} player - Datos del jugador
 * @returns {string} - Iniciales o emoji
 */
function getPlayerInitials(player) {
  // Si el avatar es un emoji (empieza con un carácter especial), usarlo directamente
  if (player.avatar && player.avatar.length <= 2) {
    return player.avatar;
  }
  
  // Si no, generar iniciales del nombre
  const nameParts = player.name.split(' ');
  if (nameParts.length >= 2) {
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  }
  return player.name.substring(0, 2).toUpperCase();
}

/**
 * Configura el buscador para filtrar jugadores en tiempo real
 */
function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  
  if (!searchInput) {
    console.warn('⚠️ No se encontró el input de búsqueda');
    return;
  }
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      // Si no hay búsqueda, mostrar todos ordenados
      renderPlayerCards(sortPlayersAlphabetically(allPlayers));
    } else {
      // Filtrar por nombre
      const filtered = allPlayers.filter(player => 
        player.name.toLowerCase().includes(searchTerm)
      );
      renderPlayerCards(sortPlayersAlphabetically(filtered));
    }
  });
}

/**
 * Muestra un mensaje cuando no hay jugadores
 */
function showEmptyState() {
  const grid = document.getElementById('playersGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron jugadores</p>
      </div>
    `;
  }
}