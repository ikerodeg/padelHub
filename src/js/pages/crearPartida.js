/**
 * Lógica para la página crear-partida.html
 */

console.log('Hola desde crearPartida.js');

import { renderUserBadge } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
  
  // Inicializar toggle del formulario
  initFormToggle();
});

function initFormToggle() {
  const toggleBtn = document.getElementById('toggleFormBtn');
  const formSection = document.getElementById('crearPartidaSection');
  const toggleSection = document.querySelector('.form-toggle-section');
  const cancelBtn = document.getElementById('cancelarPartidaBtn');

  // Abrir formulario
  if (toggleBtn && formSection && toggleSection) {
    toggleBtn.addEventListener('click', () => {
      // Mostrar la sección del formulario
      formSection.hidden = false;
      formSection.removeAttribute('aria-hidden');

      // Ocultar la sección del botón inicial
      toggleSection.style.display = 'none';
    });
  }

  // Cancelar (Opcional, pero recomendado para volver al estado inicial)
  if (cancelBtn && formSection && toggleSection) {
    cancelBtn.addEventListener('click', () => {
      // Ocultar el formulario
      formSection.hidden = true;
      formSection.setAttribute('aria-hidden', 'true');

      // Mostrar de nuevo el botón inicial
      toggleSection.style.display = 'block'; // Asumiendo que era block o flex por defecto
      toggleSection.style.display = ''; // Limpiar inline style para recuperar CSS original
    });
  }
}
