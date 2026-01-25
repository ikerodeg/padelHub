/**
 * Lógica para la página de administración de partidas (partidasAdmin.html)
 */

console.log("🚪 → 📁 partidasAdmin.js");

import { renderUserBadge, initializeUserSession } from '../../utils/auth.js';
import { initializeAppData } from '../../utils/dataLoader.js';
import { getItem, setItem } from '../../utils/storage.js';
import { showNotification } from '../../components/notification.js';
import { hasStatus } from '../../utils/statusHelper.js';

// Iconos SVG (reutilizados)
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

/**
 * Genera el HTML de los botones de administración (Editar / Eliminar)
 * Reutilizado de listaPartidas.js pero adaptado para ser insertado
 */
function generateAdminButtons(formattedId) {
  const editLabel = `Editar partida ${formattedId}`;
  const deleteLabel = `Eliminar partida ${formattedId}`;

  // Nota: data-admin-only aquí siempre será visible por CSS ya que estamos en una página de admin
  return `<div class="partida-actions" data-admin-only>
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
 * Encuentra un jugador por ID
 */
function findPlayerById(players, playerId) {
  return players.find(p => p.id === playerId) || null;
}

/**
 * Genera el HTML de una card de partida (Estilo Resultados)
 */
function generateMatchCardHTML(match, players) {
  const formattedId = match.id.toString().padStart(3, '0');
  
  // Determinar estado principal para visualización
  let estadoClase = '';
  let estadoTexto = '';
  
  if (hasStatus(match, 'abierta')) {
    estadoClase = 'abierta';
    estadoTexto = 'Abierta';
  } else if (hasStatus(match, 'completa')) {
    estadoClase = 'completa';
    estadoTexto = 'Completa';
  } else {
    // Fallback
    estadoClase = match.status[0];
    estadoTexto = match.status[0];
  }

  // Obtener jugadores o placeholders
  const getPlayerName = (id) => {
    if (!id) return '<span style="opacity: 0.5; font-style: italic;">(Vacío)</span>';
    const p = findPlayerById(players, id);
    return p ? p.name : 'Desconocido';
  };

  const reves1 = getPlayerName(match.players.reves1);
  const drive1 = getPlayerName(match.players.drive1);
  const reves2 = getPlayerName(match.players.reves2);
  const drive2 = getPlayerName(match.players.drive2);

  return `
    <article class="resultado-card" data-estado="${estadoClase}" data-partida-id="${match.id}">
      <div class="resultado-header">
        <div class="partida-number">
          <span class="number-label">Partida</span>
          <span class="number-value">#${formattedId}</span>
        </div>
        
        ${generateAdminButtons(formattedId)}

        <span class="partida-status">${estadoTexto}</span>
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
        <div class="couple-card">
          <span class="player-name">${reves1}</span>
          <span class="player-name">${drive1}</span>
        </div>

        <!-- VS Badge -->
        <div class="vs-badge">VS</div>

        <!-- Pareja 2 -->
        <div class="couple-card">
          <span class="player-name">${reves2}</span>
          <span class="player-name">${drive2}</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renderiza las partidas en el contenedor
 */
function renderMatches(matches, players) {
  const container = document.getElementById('partidasAdminContainer');
  if (!container) return;

  container.innerHTML = '';

  // Filtrar partidas: ABIERTA o COMPLETA
  const filteredMatches = matches.filter(m => 
    hasStatus(m, 'abierta') || hasStatus(m, 'completa')
  );

  // Ordenar: Por número de partida (ID) ascendente
  filteredMatches.sort((a, b) => a.id - b.id);

  if (filteredMatches.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay partidas abiertas o completas para gestionar.</p>';
    return;
  }

  filteredMatches.forEach(match => {
    const html = generateMatchCardHTML(match, players);
    container.insertAdjacentHTML('beforeend', html);
  });

  // Inicializar listeners de botones
  initializeActionListeners(matches);
}

/**
 * Elimina una partida
 */
async function deleteMatch(matchId) {
  if (!confirm(`¿Estás seguro de que quieres eliminar la partida #${matchId}?`)) return;

  try {
    const allData = getItem('allDataObject');
    if (!allData) return;

    allData.matches = allData.matches.filter(m => m.id !== matchId);
    setItem('allDataObject', allData);
    
    showNotification('Partida eliminada correctamente', 'success');

    // Recargar
    const { matches, players } = await initializeAppData();
    renderMatches(matches, players);

  } catch (error) {
    console.error('Error eliminando partida:', error);
    showNotification('Error al eliminar la partida', 'error');
  }
}

/**
 * Inicializa listeners para editar y eliminar
 */
function initializeActionListeners() {
  // Editar
  document.querySelectorAll('.btn-admin[data-action="editar"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.resultado-card');
      const id = card.getAttribute('data-partida-id');
      window.location.href = `partidaEdicionAdmin.html?mode=edit&id=${id}`;
    });
  });

  // Eliminar
  document.querySelectorAll('.btn-admin[data-action="eliminar"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.resultado-card');
      const id = parseInt(card.getAttribute('data-partida-id'));
      deleteMatch(id);
    });
  });
}

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar sesión (Badge)
  initializeUserSession('.user-badge');

  try {
    const { matches, players } = await initializeAppData();
    renderMatches(matches, players);
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
});
