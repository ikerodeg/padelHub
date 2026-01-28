/**
 * Logica para la página de login
 */

import { initializeAppData } from '../utils/dataLoader.js';
import { login } from '../utils/auth.js';

console.log("🚪 → 📁 login.js");

// Passwords de simulación
const PASSWORDS = {
    ADMIN: 'admin1234',
    PLAYER: 'padel2026'
};

let allPlayers = [];
let selectedPlayer = null;

document.addEventListener('DOMContentLoaded', async () => {
    const playerSelectionView = document.getElementById('player-selection-view');
    const passwordView = document.getElementById('password-view');
    const playerDropdown = document.getElementById('player-dropdown');
    
    // Elementos de la vista de password
    const selectedUserName = document.getElementById('selected-user-name');
    const selectedUserAvatar = document.getElementById('selected-user-avatar');
    const passwordInput = document.getElementById('login-password');
    const passwordError = document.getElementById('password-error');
    const confirmBtn = document.getElementById('confirm-password-btn');
    const backBtn = document.getElementById('back-to-players-btn');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');

    try {
        // 1. Cargar datos
        const data = await initializeAppData();
        allPlayers = data.players;

        if (!allPlayers || allPlayers.length === 0) {
            playerDropdown.innerHTML = '<option value="">No hay jugadores</option>';
            return;
        }

        // 2. Ordenar alfabéticamente por nombre
        allPlayers.sort((a, b) => a.name.localeCompare(b.name));

        // 3. Poblar dropdown con TODOS los jugadores (Samu Coach incluido)
        poblarDropdown(allPlayers, playerDropdown);

        // 4. TRANSICIÓN AUTOMÁTICA AL SELECCIONAR
        playerDropdown.addEventListener('change', () => {
            const playerId = parseInt(playerDropdown.value);
            if (!playerId) return;
            
            const player = allPlayers.find(p => p.id === playerId);
            if (player) {
                // Pequeño retardo para que el usuario vea la selección antes de la animación
                setTimeout(() => {
                    showPasswordView(player);
                }, 150);
            }
        });

        // 5. Lógica de Password
        confirmBtn.addEventListener('click', () => handleLoginAttempt());

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLoginAttempt();
        });

        backBtn.addEventListener('click', () => {
            passwordView.style.display = 'none';
            playerSelectionView.style.display = 'block';
            playerDropdown.value = ''; // Resetear dropdown
            passwordInput.value = '';
            passwordError.style.display = 'none';
        });

        // 6. Toggle Password (Ojo)
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.classList.toggle('active');
            
            if (isPassword) {
                togglePasswordBtn.style.color = 'var(--color-lime-500)';
            } else {
                togglePasswordBtn.style.color = '';
            }
        });

    } catch (error) {
        console.error('Error al cargar login:', error);
        playerDropdown.innerHTML = '<option value="">Error al cargar datos</option>';
    }

    /**
     * Muestra la vista de password para el jugador seleccionado
     */
    function showPasswordView(player) {
        selectedPlayer = player;
        selectedUserName.textContent = player.name;
        selectedUserAvatar.textContent = player.avatar;
        
        // Animación de entrada (CSS fadeIn)
        playerSelectionView.style.display = 'none';
        passwordView.style.display = 'block';
        passwordInput.focus();
    }

    /**
     * Intenta realizar el login
     */
    function handleLoginAttempt() {
        const password = passwordInput.value;
        const expectedPassword = selectedPlayer.id === 1 ? PASSWORDS.ADMIN : PASSWORDS.PLAYER;

        if (password === expectedPassword) {
            login(selectedPlayer.id, selectedPlayer.id === 1);
        } else {
            console.warn('❌ Password incorrecto');
            passwordError.style.display = 'block';
            passwordInput.classList.add('error-shake');
            setTimeout(() => passwordInput.classList.remove('error-shake'), 500);
        }
    }
});

/**
 * Llena el dropdown con la lista de jugadores
 */
function poblarDropdown(players, dropdown) {
    dropdown.innerHTML = '<option value="" disabled selected>Selecciona tu nombre...</option>';
    
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = player.name;
        dropdown.appendChild(option);
    });
}
