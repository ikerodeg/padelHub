/**
 * ==========================================
 * GESTIÓN DE JUGADORES - ADMIN
 * ==========================================
 * Logica para listar y eliminar jugadores.
 * La creación/edición se delega a jugadorPerfilAdmin.html
 */

import { initializeAppData } from '../../utils/dataLoader.js';
import { getItem, setItem } from '../../utils/storage.js';

// Elementos del DOM
const grid = document.getElementById('playersGrid');

// Estado
let players = [];

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
});

/**
 * Carga los jugadores desde localStorage
 */
async function loadPlayers() {
    // Asegurar que los datos existen
    await initializeAppData();
    
    const allData = getItem('allDataObject');
    players = allData && allData.players ? allData.players : [];
    
    // Ordenar alfabéticamente
    players.sort((a, b) => a.name.localeCompare(b.name));
    
    renderPlayers();
}

/**
 * Renderiza la lista de jugadores en el Grid
 */
function renderPlayers() {
    grid.innerHTML = '';
    
    if (players.length === 0) {
        grid.innerHTML = '<p class="loading-text">No hay jugadores registrados.</p>';
        return;
    }
    
    players.forEach(player => {
        const card = document.createElement('article');
        card.className = 'player-card';
        
        // Determinar avatar (Emoji o Imagen)
        let avatarContent = player.avatar || getInitials(player.name);
        
        let avatarHTML;
        if (player.profileImg && player.profileImg.startsWith('data:image')) {
             avatarHTML = `<img src="${player.profileImg}" alt="${player.name}" onerror="this.parentElement.innerHTML='${player.avatar}'">`;
        } else if (player.profileImg && !player.profileImg.startsWith('http') && !player.profileImg.startsWith('data')) {
             // Handle relative paths from old json
             avatarHTML = `<img src="../../${player.profileImg.replace('../', '')}" alt="${player.name}" onerror="this.parentElement.innerHTML='${player.avatar}'">`;
        } else if (player.profileImg) {
             avatarHTML = `<img src="${player.profileImg}" alt="${player.name}" onerror="this.parentElement.innerHTML='${player.avatar}'">`;
        } else {
             avatarHTML = avatarContent;
        }

        // Disponibilidad (truncada si es larga)
        const availability = player.availability 
            ? `<div class="detail-row"><span class="detail-label">Disp:</span> <span>${player.availability}</span></div>` 
            : '';

        card.innerHTML = `
            <div class="player-header">
                <div class="player-avatar">${avatarHTML}</div>
                <div class="player-info">
                    <h3 class="player-name">${player.name}</h3>
                    <span class="player-pos badge ${player.position === 'drive' ? 'badge-blue' : 'badge-green'}">${player.position}</span>
                </div>
            </div>
            
            <div class="player-details">
                ${player.racket ? `<div class="detail-row"><span class="detail-label">Pala:</span> <span>${player.racket}</span></div>` : ''}
                <div class="detail-row"><span class="detail-label">Pts:</span> <span>${player.points || 0}</span></div>
                ${availability}
            </div>
            
            <div class="player-actions">
                <button class="action-btn edit-btn" data-id="${player.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    Editar
                </button>
                <button class="action-btn delete-btn" data-id="${player.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Borrar
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    attachCardListeners();
}

/**
 * Añade listeners a los botones de las tarjetas
 */
function attachCardListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            // REDIRECCIÓN A PÁGINA DE EDICIÓN
            window.location.href = `jugadorPerfilAdmin.html?id=${id}`;
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deletePlayer(id);
        });
    });
}

/**
 * Elimina un jugador
 */
async function deletePlayer(id) {
    const player = players.find(p => p.id === id);
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${player.name}?`)) return;
    
    players = players.filter(p => p.id !== id);
    saveToLocalStorage();
    renderPlayers();
    console.log('🗑️ Jugador eliminado:', id);
}

/**
 * Guarda el array actual de players en localStorage
 */
function saveToLocalStorage() {
    const allData = getItem('allDataObject');
    allData.players = players;
    setItem('allDataObject', allData);
    
    // Limpiar cache de usuario por si acaso editamos al usuario actual
    localStorage.removeItem('cachedUserData');
}

/**
 * Helper para obtener iniciales
 */
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
