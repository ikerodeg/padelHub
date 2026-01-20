/**
 * Lógica para la página perfil.html
 * Carga datos del jugador desde localStorage basándose en el ID de la URL
 */

console.log('👤 → perfil.js');

import { renderUserBadge } from '../utils/auth.js';
import { initializeAppData } from '../utils/dataLoader.js';

// Definición de insignias (badges) con iconos y descripciones
const BADGE_DEFINITIONS = {
  // Experiencia
  primerizo: { icon: "🎾", title: "Primerizo", desc: "Bienvenido al padel" },
  veterano: { icon: "🏛️", title: "Veterano", desc: "Más de 50 partidas jugadas" },
  centurion: { icon: "💯", title: "Centurión", desc: "100 partidas disputadas" },
  constante: { icon: "📅", title: "Constante", desc: "Juega regularmente" },
  
  // Rachas
  racha_3: { icon: "🔥", title: "On Fire", desc: "Racha de 3 victorias" },
  racha_5: { icon: "🔥🔥", title: "Imparable", desc: "Racha de 5 victorias" },
  racha_10: { icon: "💥", title: "Leyenda Viva", desc: "Racha de 10 victorias" },
  invicto: { icon: "🛡️", title: "Invicto", desc: "Sin derrotas en la temporada" },
  comeback: { icon: "↩️", title: "Remontada", desc: "Ganó perdiendo 0-5" },
  
  // Trofeos y logros
  mvp_mes: { icon: "⭐", title: "MVP del Mes", desc: "Mejor jugador del mes" },
  duo_dinamico: { icon: "🤝", title: "Dúo Dinámico", desc: "Mejor pareja del mes" },
  gladiador: { icon: "⚔️", title: "Gladiador", desc: "Ganó un tie-break épico" },
  lucky_7: { icon: "🍀", title: "Lucky 7", desc: "Ganó 7 puntos seguidos" },
  
  // Técnica
  x3: { icon: "🚀", title: "x3", desc: "Primer saque por 3" },
  x4: { icon: "💫", title: "x4", desc: "Saque imparable por 4" },
  vibora_mortal: { icon: "🐍", title: "Víbora Mortal", desc: "Especialista en víboras" },
  bandeja_oro: { icon: "🥇", title: "Bandeja de Oro", desc: "Maestro de la bandeja" },
  globo_perfecto: { icon: "🎈", title: "Globo Perfecto", desc: "Globos imposibles" },
  red_master: { icon: "🕸️", title: "Red Master", desc: "Domina los puntos en red" },
  pared: { icon: "🧱", title: "La Pared", desc: "Defensa impenetrable" },
  
  // Sociales
  organizador: { icon: "📋", title: "Organizador", desc: "Organiza partidas frecuentemente" },
  social: { icon: "🎉", title: "Social", desc: "Quedadas post-partido" },
  charlatan: { icon: "💬", title: "Charlatán", desc: "El alma del grupo" },
  
  // Horarios
  madrugador: { icon: "🌅", title: "Madrugador", desc: "Juega antes de las 9am" },
  nocturno: { icon: "🌙", title: "Nocturno", desc: "Partidas nocturnas" },
  fin_de_semana: { icon: "📆", title: "Fin de Semana", desc: "Solo juega fines de semana" },
  maratoniano: { icon: "🏃", title: "Maratoniano", desc: "Juega +3h seguidas" },
  
  // Divertidos
  paquete_premium: { icon: "📦", title: "Paquete Premium", desc: "En proceso de mejora" },
  doble_falta: { icon: "❌", title: "Doble Falta", desc: "Especialista en dobles faltas" },
  red_iman: { icon: "🧲", title: "Red Imán", desc: "La red le atrae" },
  el_roto: { icon: "🩹", title: "El Roto", desc: "Siempre con alguna lesión" },
  quejica: { icon: "😤", title: "Quejica", desc: "Todo es falta" },
  tardon: { icon: "⏰", title: "Tardón", desc: "Siempre llega tarde" },
  sin_bolas: { icon: "🎾❌", title: "Sin Bolas", desc: "Nunca trae bolas" }
};

document.addEventListener('DOMContentLoaded', async () => {
  renderUserBadge('.user-badge');
  
  // Obtener ID del jugador de la URL
  const params = new URLSearchParams(window.location.search);
  const playerId = parseInt(params.get('id'), 10);
  
  if (!playerId) {
    console.error('❌ No se especificó ID de jugador');
    showError('Jugador no encontrado');
    return;
  }
  
  await loadPlayerProfile(playerId);
});

/**
 * Carga el perfil del jugador desde localStorage
 * @param {number} playerId - ID del jugador
 */
async function loadPlayerProfile(playerId) {
  try {
    // Obtener datos de localStorage
    const appData = await initializeAppData();
    
    if (!appData || !appData.players) {
      console.error('❌ No se encontraron datos');
      showError('Error al cargar datos');
      return;
    }
    
    // Buscar jugador por ID
    const player = appData.players.find(p => p.id === playerId);
    
    if (!player) {
      console.error(`❌ Jugador con ID ${playerId} no encontrado`);
      showError('Jugador no encontrado');
      return;
    }
    
    console.log(`✅ Cargando perfil de: ${player.name}`);
    renderProfile(player);
    
    // Renderizar partidas próximas
    const upcomingMatches = getPlayerUpcomingMatches(playerId, appData.matches || []);
    renderUpcomingMatches(upcomingMatches, appData.players || [], playerId);
    
  } catch (error) {
    console.error('❌ Error al cargar perfil:', error);
    showError('Error al cargar perfil');
  }
}

/**
 * Obtiene las partidas próximas del jugador
 * @param {number} playerId - ID del jugador
 * @param {Array} matches - Array de todas las partidas
 * @returns {Array} Partidas filtradas y ordenadas
 */
function getPlayerUpcomingMatches(playerId, matches) {
  if (!matches || matches.length === 0) return [];

  return matches
    .filter(match => {
      // Solo partidas completas (listas para jugar)
      const isComplete = match.status?.includes('completa');
      
      // El jugador está en la partida (revisar en players object)
      const playerValues = match.players ? Object.values(match.players) : [];
      const isPlayerInMatch = playerValues.includes(playerId);
      
      return isComplete && isPlayerInMatch;
    })
    .sort((a, b) => {
      // Ordenar por fecha ascendente (más cercanas primero)
      const dateA = new Date(a.date || a.fecha);
      const dateB = new Date(b.date || b.fecha);
      return dateA - dateB;
    });
}

/**
 * Renderiza las partidas próximas en el DOM
 * @param {Array} matches - Partidas del jugador
 * @param {Array} players - Array de todos los jugadores
 * @param {number} currentPlayerId - ID del jugador actual
 */
function renderUpcomingMatches(matches, players, currentPlayerId) {
  const container = document.getElementById('upcomingMatchesContainer');
  const noMatchesMsg = document.getElementById('noMatchesMessage');
  
  if (!container) return;

  container.innerHTML = '';

  if (matches.length === 0) {
    container.style.display = 'none';
    noMatchesMsg.style.display = 'block';
    return;
  }

  container.style.display = 'flex';
  noMatchesMsg.style.display = 'none';

  matches.forEach(match => {
    const matchDate = new Date(match.date || match.fecha);
    const day = matchDate.getDate();
    const month = matchDate.toLocaleDateString('es-ES', { month: 'short' });

    // Obtener nombres de compañeros (excluyendo al jugador actual)
    // match.players es {reves1: id, drive1: id, reves2: id, drive2: id}
    const playerIds = match.players ? Object.values(match.players).filter(id => id !== null && id !== currentPlayerId) : [];
    
    const teammates = playerIds
      .map(playerId => {
        const player = players.find(p => p.id === playerId);
        return player ? player.name : 'Desconocido';
      })
      .join(', ') || 'Sin compañeros';

    const cardHTML = `
      <article class="upcoming-match-card" data-match-id="${match.id}" style="cursor: pointer;">
        <div class="match-date-badge">
          <span class="match-date-day">${day}</span>
          <span class="match-date-month">${month}</span>
        </div>
        <div class="match-details">
          <div class="match-time">⏰ ${match.time || match.hora}</div>
          <div class="match-location">📍 ${match.club} - ${match.court || match.pista}</div>
          <div class="match-teammates">🤝 ${teammates}</div>
        </div>
      </article>
    `;

    container.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Añadir event listeners a las cards para navegación
  const matchCards = container.querySelectorAll('.upcoming-match-card');
  matchCards.forEach(card => {
    card.addEventListener('click', () => {
      const matchId = card.getAttribute('data-match-id');
      window.location.href = `../pages/resultados.html?matchId=${matchId}`;
    });
  });

  console.log(`✅ ${matches.length} partidas próximas renderizadas`);
}


/**
 * Renderiza el perfil del jugador en el DOM
 * @param {Object} player - Datos del jugador
 */
function renderProfile(player) {
  // Nombre
  document.getElementById('profileName').textContent = player.name;
  
  // Posición
  const posBadge = document.getElementById('profilePosition');
  const positionText = player.position === 'drive' ? 'Drive' : 'Revés';
  posBadge.textContent = positionText;
  
  // Colores según posición
  if (player.position === 'reves') {
    posBadge.style.color = 'var(--color-amber-400)';
    posBadge.style.borderColor = 'var(--color-amber-400)';
  } else {
    posBadge.style.color = 'var(--color-blue-400)';
    posBadge.style.borderColor = 'var(--color-blue-400)';
  }
  
  // Imagen del jugador
  const imgEl = document.getElementById('profileImage');
  if (imgEl) {
    if (player.profileImg) {
      // Si el jugador tiene imagen, cargarla
      imgEl.src = player.profileImg;
      imgEl.style.display = 'block';
      console.log(`📸 Imagen de perfil cargada: ${player.profileImg}`);
    } else {
      // Si no tiene imagen, ocultar el contenedor
      imgEl.style.display = 'none';
      console.log('📸 Sin imagen de perfil para este jugador');
    }
  }
  
  // Pala
  document.getElementById('racketName').textContent = player.racket || 'No especificada';
  
  // Estadísticas
  const stats = player.stats || { matches: 0, won: 0, winRate: 0 };
  document.getElementById('statMatches').textContent = stats.matches;
  document.getElementById('statWon').textContent = stats.won;
  
  // Calcular win rate si no está definido
  let winRate = stats.winRate;
  if (stats.matches > 0 && winRate === 0) {
    winRate = Math.round((stats.won / stats.matches) * 100);
  }
  document.getElementById('statWinRate').textContent = `${winRate}%`;
  
  // Puntos fuertes
  const strengthsList = document.getElementById('strengthsList');
  strengthsList.innerHTML = '';
  
  if (player.strengths && player.strengths.length > 0) {
    player.strengths.forEach(str => {
      const li = document.createElement('li');
      li.className = 'strength-item';
      li.textContent = str;
      strengthsList.appendChild(li);
    });
  } else {
    strengthsList.innerHTML = '<li class="strength-item">Sin datos</li>';
  }
  
  // Insignias
  const badgesGrid = document.getElementById('badgesGrid');
  badgesGrid.innerHTML = '';
  
  if (player.badges && player.badges.length > 0) {
    player.badges.forEach(badgeId => {
      const badgeInfo = BADGE_DEFINITIONS[badgeId];
      
      if (badgeInfo) {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'badge-item';
        badgeEl.innerHTML = `
          <div class="badge-icon">${badgeInfo.icon}</div>
          <div class="badge-info">
            <span class="badge-title">${badgeInfo.title}</span>
            <span class="badge-desc">${badgeInfo.desc}</span>
          </div>
        `;
        badgesGrid.appendChild(badgeEl);
      }
    });
  } else {
    badgesGrid.innerHTML = '<p class="no-data">Sin insignias aún</p>';
  }
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje a mostrar
 */
function showError(message) {
  document.getElementById('profileName').textContent = message;
  document.getElementById('profilePosition').textContent = '';
}
