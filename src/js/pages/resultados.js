/**
 * ==========================================
 * RESULTADOS - Lógica de la página de resultados
 * ==========================================
 * Archivo: src/js/pages/resultados.js
 */

console.log('🚪 → 📁 resultados.js');

// ==================== IMPORTS ====================
import { renderUserBadge } from '../utils/auth.js';
import { initializeAppData } from '../utils/dataLoader.js';
import { getItem, setItem } from '../utils/storage.js';
import { showNotification } from '../components/notification.js';
import { hasStatus, setStatus, removeStatus } from '../utils/statusHelper.js';

// ==================== CONSTANTES ====================
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

// Estado del filtro actual
let currentFilter = 'todas';

// ==================== CARGA DE DATOS ====================

/**
 * Recupera todas las partidas y jugadores desde la cache
 */
async function getAllData() {
  try {
    console.log('🔄 Cargando datos desde cache...');
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
 */
function findPlayerById(players, playerId) {
  return players.find(player => player.id === playerId) || null;
}

// ==================== RENDERIZADO DE PARTIDAS ====================

/**
 * Genera el HTML para una partida PENDIENTE (esperando resultado)
 */
function generatePendingMatchHTML(match, players) {
  const formattedId = match.id.toString().padStart(3, '0');
  
  // Obtener jugadores de cada pareja
  const pareja1Reves = findPlayerById(players, match.players.reves1);
  const pareja1Drive = findPlayerById(players, match.players.drive1);
  const pareja2Reves = findPlayerById(players, match.players.reves2);
  const pareja2Drive = findPlayerById(players, match.players.drive2);

  return `
    <article class="resultado-card" data-estado="pendiente" data-partida-id="${match.id}">
      <div class="resultado-header">
        <div class="partida-number">
          <span class="number-label">Partida</span>
          <span class="number-value">#${formattedId}</span>
        </div>
        <span class="partida-status" data-estado="pendiente">Pendiente</span>
      </div>

      <div class="resultado-info-row">
        <div>
          ${ICONS.calendar}
          <span>${new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        <div>
          ${ICONS.clock}
          <span>${match.time}</span>
        </div>
        <div>
          ${ICONS.location}
          <span>${match.club}</span>
        </div>
        <div>
          ${ICONS.court}
          <span>${match.court}</span>
        </div>
      </div>

      <h3>
        Selecciona la pareja ganadora
      </h3>

      <div class="resultado-matchup">
        <!-- Pareja 1 -->
        <div class="couple-card" role="button" data-pareja="pareja1" aria-label="Seleccionar pareja 1 como ganadora">
          <span class="player-name">${pareja1Reves?.name || 'Desconocido'}</span>
          <span class="player-name">${pareja1Drive?.name || 'Desconocido'}</span>
        </div>

        <!-- VS Badge -->
        <div class="vs-badge">VS</div>

        <!-- Pareja 2 -->
        <div class="couple-card" role="button" data-pareja="pareja2" aria-label="Seleccionar pareja 2 como ganadora">
          <span class="player-name">${pareja2Reves?.name || 'Desconocido'}</span>
          <span class="player-name">${pareja2Drive?.name || 'Desconocido'}</span>
        </div>
      </div>

      <div class="resultado-actions">
        <button class="btn btn-success btn-confirm-result" data-match-id="${match.id}">Confirmar Resultado</button>
      </div>
    </article>
  `;
}

/**
 * Genera el HTML para una partida FINALIZADA (con ganador)
 */
function generateFinalizedMatchHTML(match, players) {
  const formattedId = match.id.toString().padStart(3, '0');
  
  // Obtener jugadores de cada pareja
  const pareja1Reves = findPlayerById(players, match.players.reves1);
  const pareja1Drive = findPlayerById(players, match.players.drive1);
  const pareja2Reves = findPlayerById(players, match.players.reves2);
  const pareja2Drive = findPlayerById(players, match.players.drive2);

  // Determinar ganador y perdedor
  const pareja1Class = match.winner === 'pareja1' ? 'selected-winner' : 'loser';
  const pareja2Class = match.winner === 'pareja2' ? 'selected-winner' : 'loser';

  return `
    <article class="resultado-card" data-estado="finalizada" data-partida-id="${match.id}">
      <div class="resultado-header">
        <div class="partida-number">
          <span class="number-label">Partida</span>
          <span class="number-value">#${formattedId}</span>
        </div>
        <span class="partida-status" data-estado="finalizada">Finalizada</span>
      </div>

      <div class="resultado-info-row">
        <div>
          ${ICONS.calendar}
          <span>${new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        <div>
          ${ICONS.clock}
          <span>${match.time}</span>
        </div>
        <div>
          ${ICONS.location}
          <span>${match.club}</span>
        </div>
        <div>
          ${ICONS.court}
          <span>${match.court}</span>
        </div>
      </div>

      <div class="resultado-matchup">
        <!-- Pareja 1 -->
        <div class="couple-card ${pareja1Class}">
          <span class="player-name">${pareja1Reves?.name || 'Desconocido'}</span>
          <span class="player-name">${pareja1Drive?.name || 'Desconocido'}</span>
        </div>

        <!-- VS Badge -->
        <div class="vs-badge">VS</div>

        <!-- Pareja 2 -->
        <div class="couple-card ${pareja2Class}">
          <span class="player-name">${pareja2Reves?.name || 'Desconocido'}</span>
          <span class="player-name">${pareja2Drive?.name || 'Desconocido'}</span>
        </div>
      </div>
    </article>
  `;
}

// ==================== FILTROS ====================

/**
 * Actualiza los contadores de los filtros
 */
function updateFilterCounts(matches) {
  console.log('🔢 Actualizando contadores de filtros...');

  const pendientesCount = matches.filter(match => hasStatus(match, 'pendiente') && !hasStatus(match, 'finalizada')).length;
  const finalizadasCount = matches.filter(match => hasStatus(match, 'finalizada')).length;
  const totalCount = pendientesCount + finalizadasCount;

  const todasBadge = document.querySelector('.filter-badge[data-count="todas"]');
  const pendientesBadge = document.querySelector('.filter-badge[data-count="pendientes"]');
  const finalizadasBadge = document.querySelector('.filter-badge[data-count="finalizadas"]');

  if (todasBadge) todasBadge.textContent = totalCount;
  if (pendientesBadge) pendientesBadge.textContent = pendientesCount;
  if (finalizadasBadge) finalizadasBadge.textContent = finalizadasCount;

  console.log(`📊 Contadores actualizados - Totales: ${totalCount}, Pendientes: ${pendientesCount}, Finalizadas: ${finalizadasCount}`);
}

/**
 * Aplica el filtro seleccionado
 */
function applyFilter(matches, players, filter) {
  console.log(`🔍 Aplicando filtro: ${filter}`);

  const container = document.getElementById('resultadosContainer');
  if (!container) {
    console.error('❌ No se encontró el contenedor #resultadosContainer');
    return;
  }

  // Aplicar filtro específico
  let filteredMatches;
  switch (filter) {
    case 'pendientes':
      filteredMatches = matches.filter(match => hasStatus(match, 'pendiente') && !hasStatus(match, 'finalizada'));
      break;
    case 'finalizadas':
      filteredMatches = matches.filter(match => hasStatus(match, 'finalizada'));
      break;
    case 'todas':
    default:
      filteredMatches = matches.filter(match => hasStatus(match, 'pendiente') || hasStatus(match, 'finalizada'));
      break;
  }

  // Ordenar por fecha descendente (más recientes primero)
  filteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`📊 Filtro "${filter}": ${filteredMatches.length} partidas`);

  // Limpiar el contenedor
  container.innerHTML = '';

  // Renderizar las partidas filtradas
  filteredMatches.forEach(match => {
    let matchHTML = '';

    if (hasStatus(match, 'finalizada')) {
      matchHTML = generateFinalizedMatchHTML(match, players);
    } else if (hasStatus(match, 'pendiente')) {
      matchHTML = generatePendingMatchHTML(match, players);
    } else {
      console.warn(`⚠️ Estado de partida desconocido: ${match.status} para partida ${match.id}`);
      return;
    }

    container.insertAdjacentHTML('beforeend', matchHTML);
  });

  // Inicializar event listeners para nuevas cards
  initializeWinnerSelection();

  console.log(`✅ ${filteredMatches.length} partidas renderizadas con filtro "${filter}"`);
}

/**
 * Actualiza la UI de los filtros
 */
function updateFilterUI(activeFilter) {
  const filterButtons = document.querySelectorAll('.filter-tab');

  filterButtons.forEach(button => {
    const filterType = button.getAttribute('data-filter');
    const isActive = filterType === activeFilter;

    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive.toString());
  });
}

/**
 * Maneja el click en un botón de filtro
 */
function handleFilterClick(event, matches, players) {
  const button = event.currentTarget;
  const filterType = button.getAttribute('data-filter');

  if (!filterType || filterType === currentFilter) return;

  currentFilter = filterType;
  updateFilterUI(currentFilter);
  applyFilter(matches, players, currentFilter);
}

/**
 * Inicializa los event listeners para los filtros
 */
function initializeFilters(matches, players) {
  console.log('🎛️ Inicializando filtros...');

  const filterButtons = document.querySelectorAll('.filter-tab');

  filterButtons.forEach(button => {
    button.addEventListener('click', (event) => handleFilterClick(event, matches, players));
  });

  console.log('✅ Filtros inicializados');
}

// ==================== SELECCIÓN DE GANADOR ====================

/**
 * Inicializa la funcionalidad de selección de ganador
 */
function initializeWinnerSelection() {
  const pendingCards = document.querySelectorAll('.resultado-card[data-estado="pendiente"]');

  pendingCards.forEach(card => {
    const couples = card.querySelectorAll('.couple-card');
    const confirmBtn = card.querySelector('.btn-confirm-result');

    couples.forEach(couple => {
      // Remover event listeners previos (si existen)
      const newCouple = couple.cloneNode(true);
      couple.parentNode.replaceChild(newCouple, couple);

      newCouple.addEventListener('click', () => {
        const allCouples = card.querySelectorAll('.couple-card');

        // Si ya estaba seleccionada, deseleccionar
        if (newCouple.classList.contains('selected-winner')) {
          allCouples.forEach(c => c.classList.remove('selected-winner', 'loser'));
          confirmBtn.classList.remove('visible');
          return;
        }

        // Reset previo
        allCouples.forEach(c => c.classList.remove('selected-winner', 'loser'));

        // Marcar ganadora
        newCouple.classList.add('selected-winner');

        // Marcar perdedora a la otra
        allCouples.forEach(c => {
          if (c !== newCouple) c.classList.add('loser');
        });

        // Mostrar botón confirmar
        confirmBtn.classList.add('visible');
      });
    });

    // Event listener para confirmar resultado
    if (confirmBtn && !confirmBtn.dataset.listenerAdded) {
      confirmBtn.dataset.listenerAdded = 'true';
      
      confirmBtn.addEventListener('click', async () => {
        const matchId = parseInt(confirmBtn.getAttribute('data-match-id'));
        const selectedWinner = card.querySelector('.couple-card.selected-winner');

        if (!selectedWinner) {
          showNotification('Por favor, selecciona una pareja ganadora', 'error');
          return;
        }

        const winnerPareja = selectedWinner.getAttribute('data-pareja');
        await confirmMatchResult(matchId, winnerPareja, card, confirmBtn);
      });
    }
  });
}

/**
 * Confirma el resultado de una partida
 */
async function confirmMatchResult(matchId, winnerPareja, card, confirmBtn) {
  console.log(`✅ Confirmando resultado de partida #${matchId} - Ganador: ${winnerPareja}`);

  try {
    // Obtener datos actuales
    const allData = getItem('allDataObject');
    if (!allData) {
      throw new Error('No se encontraron datos en localStorage');
    }

    // Encontrar la partida
    const matchIndex = allData.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) {
      throw new Error(`No se encontró la partida #${matchId}`);
    }

    const match = allData.matches[matchIndex];

    // Actualizar estado: eliminar 'completa' y 'pendiente', añadir 'finalizada'
    setStatus(match, ['finalizada']);
    
    // Guardar pareja ganadora
    match.winner = winnerPareja;

    // --- DISTRIBUCIÓN DE PUNTOS ---
    const isPareja1Winner = winnerPareja === 'pareja1';
    
    const winners = isPareja1Winner 
      ? [match.players.drive1, match.players.reves1] 
      : [match.players.drive2, match.players.reves2];
      
    const losers = isPareja1Winner 
      ? [match.players.drive2, match.players.reves2] 
      : [match.players.drive1, match.players.reves1];

    console.log(`🏆 Ganadores: ${winners.join(', ')} (+3 pts) | 😢 Perdedores: ${losers.join(', ')} (+1 pt)`);

    // Actualizar puntos en el array de jugadores
    allData.players.forEach(player => {
      // Verificar si el jugador participó en la partida
      if (winners.includes(player.id) || losers.includes(player.id)) {
        // Incrementar contador de partidas jugadas
        player.stats = player.stats || {};
        player.stats.matches = (player.stats.matches || 0) + 1;
        console.log(`📊 Jugador ${player.name}: Partidas ${player.stats.matches - 1} -> ${player.stats.matches}`);
      }

      // Ganadores suman 3 puntos
      if (winners.includes(player.id)) {
        const oldPoints = player.points || 0;
        player.points = oldPoints + 3;
        player.stats.won = (player.stats.won || 0) + 1; // Opcional: Incrementar victorias también si se desea
        console.log(`📈 Jugador ${player.name}: Puntos ${oldPoints} -> ${player.points}`);
      }
      
      // Perdedores suman 1 punto
      if (losers.includes(player.id)) {
        const oldPoints = player.points || 0;
        player.points = oldPoints + 1;
        console.log(`📉 Jugador ${player.name}: Puntos ${oldPoints} -> ${player.points}`);
      }
    });

    // Guardar en localStorage
    setItem('allDataObject', allData);

    // Animación de confirmación
    confirmBtn.innerHTML = '¡Guardado!';
    confirmBtn.style.backgroundColor = 'var(--color-blue-400)';

    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';

      setTimeout(async () => {
        showNotification(`¡Resultado confirmado para partida #${matchId}!`, 'success');
        
        // Recargar datos y re-renderizar
        const { matches, players } = await getAllData();
        renderMatches(matches, players);
      }, 500);
    }, 800);

  } catch (error) {
    console.error('❌ Error al confirmar resultado:', error);
    showNotification('Error al guardar el resultado', 'error');
  }
}

// ==================== RENDERIZADO PRINCIPAL ====================

/**
 * Renderiza todas las partidas en el DOM
 */
function renderMatches(matches, players) {
  console.log('🎨 Renderizando partidas en el DOM...');

  updateFilterCounts(matches);
  applyFilter(matches, players, currentFilter);

  // Inicializar filtros (solo una vez)
  if (!document.querySelector('.filter-tab').hasEventListener) {
    initializeFilters(matches, players);
    document.querySelector('.filter-tab').hasEventListener = true;
  }
}

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializa la página resultados.js
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🔄 Inicializando página de resultados...');

    // Renderizar badge del usuario
    renderUserBadge('.user-badge');

    // Recuperar todas las partidas y datos relacionados
    const { matches, players } = await getAllData();

    // Renderizar las partidas en el DOM
    renderMatches(matches, players);

    console.log('✅ Página de resultados inicializada correctamente');
  } catch (error) {
    console.error('❌ Error en la inicialización de la página:', error);
  }
});
