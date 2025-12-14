/**
 * Lógica para la página perfil.html
 * Carga datos de usuario (mock) basados en ID
 */

import { renderUserBadge } from '../utils/auth.js';

const MOCK_DB = {
  // Ale Galán
  "1": {
    name: "Ale",
    surname: "Galán",
    avatar: "AG",
    photoUrl: "../assets/img/players/ale-galan.png",
    position: "Revés",
    racketImg: "../assets/img/players/pala-galan.png",
    racketName: "Adidas Metalbone 3.2",
    stats: {
      matches: 25,
      won: 22,
      lost: 3,
      winRate: 88
    },
    strengths: ["Bajada de pared", "Remate x3", "Volea de revés"],
    badges: [
      { id: "first-game", icon: "🎾", title: "Debutante", desc: "Primera partida jugada" },
      { id: "first-win", icon: "🏆", title: "Primera Victoria", desc: "Primera partida ganada" },
      { id: "streak-3", icon: "🔥", title: "On Fire", desc: "Racha de 3 victorias" },
      { id: "x3", icon: "🚀", title: "Sacada x3", desc: "Primer remate por 3" },
      { id: "rulo", icon: "🌀", title: "Rulo Master", desc: "Primer punto de rulo a la reja" }
    ]
  },
  // Default fallback
  "default": {
    name: "Jugador",
    surname: "PadelSamu",
    avatar: "JP",
    position: "Drive",
    racketImg: "",
    racketName: "Pala Genérica",
    stats: {
      matches: 0,
      won: 0,
      lost: 0,
      winRate: 0
    },
    strengths: ["Constancia"],
    badges: []
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderUserBadge('.user-badge');
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id') || "1"; // Default to Ale Galan (id=1)

  loadUserProfile(userId);
});

function loadUserProfile(id) {
  const user = MOCK_DB[id] || MOCK_DB["default"];

  // Header Info
  document.getElementById('profileName').textContent = `${user.name} ${user.surname}`;
  
  // Imagen Jugador
  const imgEl = document.getElementById('profileImage');
  if (user.photoUrl && imgEl) {
     imgEl.src = user.photoUrl;
  } else if (imgEl) {
     // Fallback placeholder logic could go here
     imgEl.style.display = 'none';
  }

  // Posición
  const posBadge = document.getElementById('profilePosition');
  posBadge.textContent = user.position;
  // Apply specific colors (text color handled by CSS classes if needed, 
  // currently inline styles in CSS for badge-drive/reves helper classes)
  // Let's use the helper classes for color variables if we want dynamic backgrounds
  // But for the new design we might just want to set the text color
  if (user.position === 'Revés') {
     posBadge.style.color = 'var(--color-amber-400)';
     posBadge.style.borderColor = 'var(--color-amber-400)';
  } else {
     posBadge.style.color = 'var(--color-blue-400)';
     posBadge.style.borderColor = 'var(--color-blue-400)';
  }

  // Racket
  document.getElementById('racketName').textContent = user.racketName;
  const racketImg = document.getElementById('racketImg');
  if (user.racketImg && racketImg) {
    racketImg.src = user.racketImg;
  }

  // Stats
  document.getElementById('statMatches').textContent = user.stats.matches;
  document.getElementById('statWon').textContent = user.stats.won;
  document.getElementById('statWinRate').textContent = `${user.stats.winRate}%`;

  // Strengths
  const strengthsList = document.getElementById('strengthsList');
  strengthsList.innerHTML = '';
  user.strengths.forEach(str => {
    const li = document.createElement('li');
    li.className = 'strength-item';
    li.textContent = str;
    strengthsList.appendChild(li);
  });

  // Badges
  const badgesGrid = document.getElementById('badgesGrid');
  badgesGrid.innerHTML = '';
  
  if (user.badges.length === 0) {
    badgesGrid.innerHTML = '<p class="no-data">Sin insignias aún</p>';
  } else {
    user.badges.forEach(badge => {
      const badgeEl = document.createElement('div');
      badgeEl.className = 'badge-item';
      badgeEl.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-info">
          <span class="badge-title">${badge.title}</span>
          <span class="badge-desc">${badge.desc}</span>
        </div>
      `;
      badgesGrid.appendChild(badgeEl);
    });
  }
}
