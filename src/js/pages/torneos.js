/**
 * Lógica para la página torneos.html
 */

console.log('Hola desde torneos.js');

import { renderUserBadge } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
});