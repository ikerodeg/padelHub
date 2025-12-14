/**
 * Lógica para la página lista-partidas.html
 */

console.log('Hola desde listaPartidas.js');

import { renderUserBadge } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
});