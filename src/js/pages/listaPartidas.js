/**
 * Lógica para la página lista-partidas.html
 */

console.log("🚪 → 📁 listaPartidas.js");

import { renderUserBadge } from '../utils/auth.js';
import { initializeAppData } from '../utils/dataLoader.js';
import { getItem, setItem } from '../utils/storage.js';
import { showNotification } from '../components/notification.js';
import { hasStatus, setStatus } from '../utils/statusHelper.js';

// Constantes para SVGs reutilizables
const ICONS = {
  calendar: `<svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>`,
  clock: `<svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>`,
  location: `<svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>`,
  court: `<svg class="info-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>`
};

// Función auxiliar para generar botones de admin
function generateAdminButtons(formattedId) {
  const editLabel = `Editar partida ${formattedId}`;
  const deleteLabel = `Eliminar partida ${formattedId}`;

  return `<div class="partida-actions" data-admin-only aria-hidden="true" style="display: none;">
      <button type="button" class="btn btn-admin" data-action="editar" aria-label="${editLabel}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="m14.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button type="button" class="btn btn-admin btn-danger" data-action="eliminar" aria-label="${deleteLabel}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <path d="M10 11v6"/>
          <path d="M14 11v6"/>
        </svg>
      </button>
    </div>`;
}

/**
 * Recupera todas las partidas y datos relacionados desde la cache
 * @returns {Promise<Object>} Objeto con matches y players
 */
async function getAllData() {
  try {
    console.log('🔄 Cargando datos desde cache...');

    // Inicializar datos de la aplicación (usa cache si existe)
    const { matches, players } = await initializeAppData();

    console.log(`✅ ${matches.length} partidas y ${players.length} jugadores cargados`);
    return { matches, players };

  } catch (error) {
    console.error('❌ Error al cargar los datos:', error);
    throw error;
  }
}

/**
 * Encuentra un jugador por su ID
 * @param {Array} players - Array de jugadores
 * @param {number} playerId - ID del jugador
 * @returns {Object|null} Jugador encontrado o null
 */
function findPlayerById(players, playerId) {
  return players.find(player => player.id === playerId) || null;
}

/**
 * Genera el HTML para una partida abierta (con selects para unirse)
 * @param {Object} match - Datos de la partida
 * @param {Array} players - Array de jugadores
 * @returns {string} HTML de la partida
 */
function generateOpenMatchHTML(match, players) {
  const formattedId = match.id.toString().padStart(3, '0');
  const matchId = match.id;

  // Crear opciones para los selects (jugadores disponibles)
  const availablePlayersOptions = players
    .filter(player => !Object.values(match.players).includes(player.id))
    .map(player => `<option value="${player.id}">${player.name}</option>`)
    .join('');

  return `
    <article class="partida-card" data-estado="${match.status.join(' ')}" data-partida-id="${formattedId}">
      <header class="partida-header">
        <div class="partida-number">
          <span class="number-label">Partida</span>
          <span class="number-value">#${formattedId}</span>
        </div>
        ${generateAdminButtons(formattedId)}
        <span class="partida-status status-${match.status[0]}">Abierta</span>
      </header>

      <div class="partida-info">
        <div class="info-item">
          ${ICONS.calendar}
          <span>${new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        <div class="info-item">
          ${ICONS.clock}
          <span>${match.time}</span>
        </div>
        <div class="info-item">
          ${ICONS.location}
          <span>${match.club}</span>
        </div>
        <div class="info-item">
          ${ICONS.court}
          <span>${match.court}</span>
        </div>
      </div>

      <div class="partida-jugadores">
        <h3 class="jugadores-title">Jugadores</h3>

        <div class="jugador-field">
          <label for="reves1-${formattedId}" class="jugador-label">Revés 1</label>
          <select id="reves1-${formattedId}" class="jugador-select" data-role="reves1" ${match.players.reves1 ? 'disabled aria-disabled="true"' : ''}>
            ${match.players.reves1 ?
              `<option value="${match.players.reves1}">${findPlayerById(players, match.players.reves1)?.name || 'Jugador desconocido'}</option>` :
              `<option value="">Disponible - Únete</option>${availablePlayersOptions}`
            }
          </select>
        </div>

        <div class="jugador-field">
          <label for="drive1-${formattedId}" class="jugador-label">Drive 1</label>
          <select id="drive1-${formattedId}" class="jugador-select" data-role="drive1" ${match.players.drive1 ? 'disabled aria-disabled="true"' : ''}>
            ${match.players.drive1 ?
              `<option value="${match.players.drive1}">${findPlayerById(players, match.players.drive1)?.name || 'Jugador desconocido'}</option>` :
              `<option value="">Disponible - Únete</option>${availablePlayersOptions}`
            }
          </select>
        </div>

        <div class="jugador-field">
          <label for="reves2-${formattedId}" class="jugador-label">Revés 2</label>
          <select id="reves2-${formattedId}" class="jugador-select" data-role="reves2" ${match.players.reves2 ? 'disabled aria-disabled="true"' : ''}>
            ${match.players.reves2 ?
              `<option value="${match.players.reves2}">${findPlayerById(players, match.players.reves2)?.name || 'Jugador desconocido'}</option>` :
              `<option value="">Disponible - Únete</option>${availablePlayersOptions}`
            }
          </select>
        </div>

        <div class="jugador-field">
          <label for="drive2-${formattedId}" class="jugador-label">Drive 2</label>
          <select id="drive2-${formattedId}" class="jugador-select" data-role="drive2" ${match.players.drive2 ? 'disabled aria-disabled="true"' : ''}>
            ${match.players.drive2 ?
              `<option value="${match.players.drive2}">${findPlayerById(players, match.players.drive2)?.name || 'Jugador desconocido'}</option>` :
              `<option value="">Disponible - Únete</option>${availablePlayersOptions}`
            }
          </select>
        </div>
      </div>

      <div class="partida-actions">
        <button type="button" class="btn btn-primary" data-action="unirse" aria-label="Unirse a partida ${formattedId}">
          Unirse
        </button>
      </div>
      ${generateAdminButtons(formattedId)}
    </article>
  `;
}

/**
 * Genera el HTML para una partida completa (con equipos formados)
 * @param {Object} match - Datos de la partida
 * @param {Array} players - Array de jugadores
 * @returns {string} HTML de la partida
 */
function generateCompleteMatchHTML(match, players) {
  const formattedId = match.id.toString().padStart(3, '0');
  const matchId = match.id;

  // Obtener nombres de los jugadores
  const reves1 = findPlayerById(players, match.players.reves1);
  const drive1 = findPlayerById(players, match.players.drive1);
  const reves2 = findPlayerById(players, match.players.reves2);
  const drive2 = findPlayerById(players, match.players.drive2);

  return `
    <article class="partida-card" data-estado="${match.status.join(' ')}" data-partida-id="${formattedId}">
      <header class="partida-header">
        <div class="partida-number">
          <span class="number-label">Partida</span>
          <span class="number-value">#${formattedId}</span>
        </div>
        ${generateAdminButtons(formattedId)}
        <span class="partida-status status-${match.status[0]}">Completa</span>
      </header>

      <div class="partida-info">
        <div class="info-item">
          ${ICONS.calendar}
          <span>${new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        <div class="info-item">
          ${ICONS.clock}
          <span>${match.time}</span>
        </div>
        <div class="info-item">
          ${ICONS.location}
          <span>${match.club}</span>
        </div>
        <div class="info-item">
          ${ICONS.court}
          <span>${match.court}</span>
        </div>
      </div>

      <div class="partida-teams">
        <div class="team-card">
          <h4 class="team-title">Pareja 1</h4>
          <div class="team-players">
            ${reves1 ? `<span class="player-name">${reves1.name}</span>` : ''}
            ${drive1 ? `<span class="player-name">${drive1.name}</span>` : ''}
          </div>
        </div>

        <div class="teams-versus">
          <span class="vs-text">VS</span>
        </div>

        <div class="team-card">
          <h4 class="team-title">Pareja 2</h4>
          <div class="team-players">
            ${reves2 ? `<span class="player-name">${reves2.name}</span>` : ''}
            ${drive2 ? `<span class="player-name">${drive2.name}</span>` : ''}
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Actualiza los contadores de los filtros con los números reales
 * @param {Array} matches - Array de todas las partidas
 */
function updateFilterCounts(matches) {
  console.log('🔢 Actualizando contadores de filtros...');

  // Calcular números reales (excluyendo finalizadas)
  const validMatches = matches.filter(match => !hasStatus(match, 'finalizada'));
  const totalCount = validMatches.length;
  const abiertasCount = validMatches.filter(match => hasStatus(match, 'abierta')).length;
  const completasCount = validMatches.filter(match => hasStatus(match, 'completa')).length;

  // Actualizar elementos del DOM
  const todasBadge = document.querySelector('.filter-badge[data-count="todas"]');
  const abiertasBadge = document.querySelector('.filter-badge[data-count="abiertas"]');
  const completasBadge = document.querySelector('.filter-badge[data-count="completas"]');

  if (todasBadge) todasBadge.textContent = totalCount;
  if (abiertasBadge) abiertasBadge.textContent = abiertasCount;
  if (completasBadge) completasBadge.textContent = completasCount;

  console.log(`📊 Contadores actualizados - Totales: ${totalCount}, Abiertas: ${abiertasCount}, Completas: ${completasCount}`);
}

// Estado del filtro actual
let currentFilter = 'todas';

/**
 * Aplica el filtro seleccionado y renderiza las partidas filtradas
 * @param {Array} matches - Array de todas las partidas
 * @param {Array} players - Array de jugadores
 * @param {string} filter - Tipo de filtro ('todas', 'abiertas', 'completas')
 */
function applyFilter(matches, players, filter) {
  console.log(`🔍 Aplicando filtro: ${filter}`);

  const container = document.getElementById('partidasContainer');
  if (!container) {
    console.error('❌ No se encontró el contenedor #partidasContainer');
    return;
  }

  // Obtener todas las partidas válidas (excluyendo finalizadas)
  const validMatches = matches.filter(match => !hasStatus(match, 'finalizada'));

  // Aplicar filtro específico
  let filteredMatches;
  switch (filter) {
    case 'abiertas':
      filteredMatches = validMatches.filter(match => hasStatus(match, 'abierta'));
      break;
    case 'completas':
      filteredMatches = validMatches.filter(match => hasStatus(match, 'completa'));
      break;
    case 'todas':
    default:
      filteredMatches = validMatches;
      break;
  }

  // Ordenar las partidas filtradas
  if (filter === 'todas') {
    // Para "todas": abiertas primero, luego completas, ordenadas por fecha dentro de cada grupo
    filteredMatches.sort((a, b) => {
      // Primero ordenar por estado: abiertas antes que completas
      if (hasStatus(a, 'abierta') && !hasStatus(b, 'abierta')) return -1;
      if (!hasStatus(a, 'abierta') && hasStatus(b, 'abierta')) return 1;

      // Dentro del mismo estado, ordenar por fecha descendente (más nuevas primero)
      return new Date(b.date) - new Date(a.date);
    });
  } else {
    // Para filtros específicos, ordenar solo por fecha descendente (más nuevas primero)
    filteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  console.log(`📊 Filtro "${filter}": ${filteredMatches.length} partidas de ${validMatches.length} totales`);

  // Limpiar el contenedor (eliminar cards de ejemplo del HTML)
  container.innerHTML = '';

  // Asegurarse de que no queden cards de ejemplo
  const exampleCards = container.querySelectorAll('.partida-card');
  exampleCards.forEach(card => card.remove());

  // Renderizar las partidas filtradas
  filteredMatches.forEach(match => {
    let matchHTML = '';

    if (hasStatus(match, 'abierta')) {
      matchHTML = generateOpenMatchHTML(match, players);
    } else if (hasStatus(match, 'completa')) {
      matchHTML = generateCompleteMatchHTML(match, players);
    } else {
      console.warn(`⚠️ Estado de partida desconocido: ${match.status} para partida ${match.id}`);
      return;
    }

    container.insertAdjacentHTML('beforeend', matchHTML);
  });

  console.log(`✅ ${filteredMatches.length} partidas renderizadas con filtro "${filter}"`);
}

/**
 * Actualiza la UI de los filtros (clase active, aria-selected)
 * @param {string} activeFilter - Filtro que debe estar activo
 */
function updateFilterUI(activeFilter) {
  // Actualizar todos los botones de filtro
  const filterButtons = document.querySelectorAll('.filter-tab');

  filterButtons.forEach(button => {
    const filterType = button.getAttribute('data-filter');
    const isActive = filterType === activeFilter;

    // Actualizar clases y atributos de accesibilidad
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive.toString());
  });
}

/**
 * Maneja el click en un botón de filtro
 * @param {Event} event - Evento del click
 * @param {Array} matches - Array de todas las partidas
 * @param {Array} players - Array de jugadores
 */
function handleFilterClick(event, matches, players) {
  const button = event.currentTarget;
  const filterType = button.getAttribute('data-filter');

  if (!filterType || filterType === currentFilter) return;

  // Actualizar estado del filtro
  currentFilter = filterType;

  // Actualizar UI
  updateFilterUI(currentFilter);

  // Aplicar filtro
  applyFilter(matches, players, currentFilter);
}

/**
 * Maneja la acción de unirse a una partida abierta
 * @param {Event} event - Evento del click
 * @param {Array} matches - Array de todas las partidas
 * @param {Array} players - Array de jugadores
 */
function handleJoinMatch(event, matches, players) {
  event.preventDefault();

  const button = event.currentTarget;
  const matchCard = button.closest('.partida-card');
  const matchId = parseInt(matchCard.getAttribute('data-partida-id'));

  console.log(`👥 Intentando unirse a partida #${matchId}`);

  // Encontrar la partida correspondiente
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    console.error(`❌ No se encontró la partida #${matchId}`);
    return;
  }

  // Encontrar TODAS las posiciones seleccionadas (no solo una)
  const selects = matchCard.querySelectorAll('.jugador-select');
  const selectedPositions = [];

  for (const select of selects) {
    const value = select.value;
    const role = select.getAttribute('data-role');

    // Solo procesar selects que no estén deshabilitados y tengan un valor válido
    if (value && value !== '' && !select.disabled) {
      selectedPositions.push({
        select,
        playerId: parseInt(value),
        role
      });
    }
  }

  // Validar que se haya seleccionado al menos una posición
  if (selectedPositions.length === 0) {
    console.warn('⚠️ No se ha seleccionado ningún jugador para unirse');
    showNotification('Por favor, selecciona al menos un jugador de la lista antes de unirte.', 'error');
    return;
  }

  console.log(`📋 ${selectedPositions.length} posiciones seleccionadas:`, selectedPositions.map(p => `${p.role}: ${p.playerId}`));

  // Verificar que no haya jugadores duplicados en las selecciones
  const selectedPlayerIds = selectedPositions.map(p => p.playerId);
  const uniquePlayerIds = [...new Set(selectedPlayerIds)];

  if (selectedPlayerIds.length !== uniquePlayerIds.length) {
    console.warn('⚠️ Se han seleccionado jugadores duplicados');
    showNotification('No puedes seleccionar el mismo jugador para múltiples posiciones.', 'error');
    return;
  }

  // Verificar que los jugadores no estén ya en la partida
  const currentPlayers = Object.values(match.players);
  const conflictingPlayers = selectedPlayerIds.filter(playerId => currentPlayers.includes(playerId));

  if (conflictingPlayers.length > 0) {
    const playerNames = conflictingPlayers.map(id => findPlayerById(players, id)?.name || `ID:${id}`);
    console.warn(`⚠️ Los jugadores ${playerNames.join(', ')} ya están en la partida`);
    showNotification(`Los siguientes jugadores ya están en la partida: ${playerNames.join(', ')}`, 'error');
    return;
  }

  // Aplicar todas las selecciones
  let playersAdded = [];
  selectedPositions.forEach(({ playerId, role }) => {
    match.players[role] = playerId;
    playersAdded.push(`${role}: ${findPlayerById(players, playerId)?.name || `ID:${playerId}`}`);
  });

  console.log(`✅ Jugadores añadidos: ${playersAdded.join(', ')}`);

  // Verificar si la partida está completa ahora
  const playerCount = Object.values(match.players).filter(id => id !== null).length;
  console.log(`📊 Jugadores en partida: ${playerCount}/4`);

  // Si hay 4 jugadores, cambiar estado a "completa"
  if (playerCount === 4) {
    setStatus(match, ['completa', 'pendiente']);
    console.log(`🎉 ¡Partida #${matchId} completada! Cambiando estado a "completa" y "pendiente"`);
    showNotification(`¡Partida #${matchId} completada! Ya están todos los jugadores.`, 'success');
  }

  // Actualizar todos los selects seleccionados
  selectedPositions.forEach(({ select, playerId, role }) => {
    // Deshabilitar el select
    select.disabled = true;
    select.setAttribute('aria-disabled', 'true');

    // Actualizar el valor del select para mostrar el nombre
    const player = findPlayerById(players, playerId);
    if (player) {
      select.innerHTML = `<option value="${playerId}">${player.name}</option>`;
    }
  });

  // Guardar cambios en localStorage
  saveMatchUpdate(match);

  console.log(`✅ ${selectedPositions.length} jugadores unidos exitosamente. Partida actualizada:`, match.players);

  // Mostrar mensaje de éxito
  const successMessage = playerCount === 4
    ? `¡Partida #${matchId} completada! Ya están todos los jugadores.`
    : `¡${selectedPositions.length} jugador(es) se han unido a la partida #${matchId}!`;

  showNotification(successMessage, 'success');

  // Si la partida se completó, recargar y re-renderizar para mostrar nueva estructura
  if (playerCount === 4) {
    setTimeout(() => {
      // Recargar datos y re-renderizar
      getAllData().then(({ matches: updatedMatches, players: updatedPlayers }) => {
        renderMatches(updatedMatches, updatedPlayers);
      }).catch(error => {
        console.error('❌ Error al recargar datos después de completar partida:', error);
      });
    }, 1500); // Pequeño delay para que el usuario vea la notificación
  }
}

/**
 * Guarda una partida actualizada en localStorage
 * @param {Object} updatedMatch - Partida con cambios
 */
function saveMatchUpdate(updatedMatch) {
  console.log('💾 Guardando actualización de partida...');

  try {
    // Obtener datos actuales del localStorage
    const allData = getItem('allDataObject');
    if (!allData) {
      console.error('❌ No se encontraron datos en localStorage');
      return;
    }

    // Encontrar y actualizar la partida
    const matchIndex = allData.matches.findIndex(m => m.id === updatedMatch.id);
    if (matchIndex === -1) {
      console.error(`❌ No se encontró la partida #${updatedMatch.id} en localStorage`);
      return;
    }

    // Actualizar la partida
    allData.matches[matchIndex] = updatedMatch;

    // Guardar en localStorage
    setItem('allDataObject', allData);

    console.log(`✅ Partida #${updatedMatch.id} guardada en localStorage`);
  } catch (error) {
    console.error('❌ Error al guardar la partida:', error);
  }
}

/**
 * Inicializa los event listeners para los filtros
 * @param {Array} matches - Array de todas las partidas
 * @param {Array} players - Array de jugadores
 */
function initializeFilters(matches, players) {
  console.log('🎛️ Inicializando filtros...');

  const filterButtons = document.querySelectorAll('.filter-tab');

  filterButtons.forEach(button => {
    button.addEventListener('click', (event) => handleFilterClick(event, matches, players));
  });

  console.log('✅ Filtros inicializados');
}

/**
 * Inicializa los event listeners para unirse a partidas
 * @param {Array} matches - Array de todas las partidas
 * @param {Array} players - Array de jugadores
 */
function initializeJoinFunctionality(matches, players) {
  console.log('🤝 Inicializando funcionalidad para unirse a partidas...');

  const joinButtons = document.querySelectorAll('.btn[data-action="unirse"]');

  joinButtons.forEach(button => {
    button.addEventListener('click', (event) => handleJoinMatch(event, matches, players));
  });

  console.log(`✅ ${joinButtons.length} botones de "Unirse" inicializados`);
}

/**
 * Renderiza todas las partidas en el DOM (excluyendo las pendientes y finalizadas)
 * @param {Array} matches - Array de partidas
 * @param {Array} players - Array de jugadores
 */
function renderMatches(matches, players) {
  console.log('🎨 Renderizando partidas en el DOM...');

  // Actualizar contadores de filtros
  updateFilterCounts(matches);

  // Aplicar el filtro actual (por defecto 'todas')
  applyFilter(matches, players, currentFilter);

  // Inicializar filtros (solo una vez)
  if (!document.querySelector('.filter-tab').hasEventListener) {
    initializeFilters(matches, players);
    // Marcar que ya se inicializaron los listeners
    document.querySelector('.filter-tab').hasEventListener = true;
  }

  // Inicializar funcionalidad para unirse a partidas (después de cada renderizado)
  initializeJoinFunctionality(matches, players);
}

/**
 * Inicializa la página listaPartidas.js
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Renderizar badge del usuario
    renderUserBadge('.user-badge');

    // Recuperar todas las partidas y datos relacionados
    const { matches, players } = await getAllData();

    // Renderizar las partidas en el DOM
    renderMatches(matches, players);

  } catch (error) {
    console.error('❌ Error en la inicialización de la página:', error);
  }
});