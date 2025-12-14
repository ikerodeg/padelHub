/**
 * Lógica para la página ranking.html
 */

console.log('Hola desde ranking.js');

import { renderUserBadge } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
});