/**
 * Lógica para la página lista-jugadores.html
 */

console.log('Hola desde listaJugadores.js');

import { renderUserBadge } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
});