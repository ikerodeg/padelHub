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
    
  } catch (error) {
    console.error('❌ Error al cargar perfil:', error);
    showError('Error al cargar perfil');
  }
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
  
  // Imagen del jugador (ocultar si no existe)
  const imgEl = document.getElementById('profileImage');
  if (imgEl) {
    // Por ahora no hay fotos en el JSON, ocultar
    imgEl.style.display = 'none';
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
