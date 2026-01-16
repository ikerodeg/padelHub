/**
 * Lógica para la página ranking.html
 */

console.log('🚪 → 📁 ranking.js');

import { renderUserBadge } from '../utils/auth.js';
import { initializeAppData } from '../utils/dataLoader.js';
import { mostrarErrorDatos } from '../utils/errores.js';

/**
 * Devuelve las iniciales del nombre (fallback si no hay avatar)
 */
function getInitials(name = '') {
  if (!name) return '--';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase() || first.toUpperCase() || '--';
}

/**
 * Crea el nodo de un item de ranking
 */
function createRankingItem(player, position) {
  const li = document.createElement('li');
  li.className = 'ranking-item';
  li.dataset.rank = position;

  const points = Number.isFinite(player.points) ? player.points : 0;
  
  // Calcular Win Rate dinámicamente
  const matches = Number.isFinite(player?.stats?.matches) ? player.stats.matches : 0;
  const won = Number.isFinite(player?.stats?.won) ? player.stats.won : 0;
  
  const winRate = matches > 0 ? Math.round((won / matches) * 100) : 0;

  li.innerHTML = `
    <span class="rank-position">${position}</span>
    <div class="rank-user">
      <span class="rank-name">${player.name || 'Jugador sin nombre'}</span>
    </div>
    <div class="rank-win-rate">${winRate}%</div>
    <div class="rank-metrics">
      <span class="rank-points">${points} pts</span>
      <span class="rank-matches">${matches} jugados</span>
    </div>
    <div class="rank-trend">
      <span class="trend-icon trend-equal">=</span>
    </div>
  `;

  return li;
}

/**
 * Renderiza el ranking en el DOM
 */
function renderRanking(players) {
  const list = document.querySelector('.ranking-list');
  if (!list) return;

  list.innerHTML = '';

  if (!players || players.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'ranking-item';
    empty.innerHTML = `
      <span class="rank-position">—</span>
      <div class="rank-user">
        <span class="rank-name">No hay jugadores disponibles</span>
      </div>
      <div class="rank-win-rate">--</div>
      <div class="rank-metrics">
        <span class="rank-points">--</span>
        <span class="rank-matches">--</span>
      </div>
      <div class="rank-trend">
        <span class="trend-icon trend-equal">=</span>
      </div>
    `;
    list.appendChild(empty);
    return;
  }

  // Ordenar por puntos descendente (fallback 0)
  const sorted = [...players].sort((a, b) => {
    const pointsA = Number.isFinite(a.points) ? a.points : 0;
    const pointsB = Number.isFinite(b.points) ? b.points : 0;
    return pointsB - pointsA;
  });

  sorted.forEach((player, index) => {
    list.appendChild(createRankingItem(player, index + 1));
  });
}

/**
 * Inicialización de la página de ranking
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');

  try {
    const { players } = await initializeAppData();
    renderRanking(players);
  } catch (error) {
    console.error('❌ Error al cargar ranking:', error);
    mostrarErrorDatos('Error al cargar ranking', 'No se pudieron cargar los jugadores.');
  }
});