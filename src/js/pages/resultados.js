/**
 * Lógica para la página de resultados
 */

console.log('Hola desde resultados.js');
import { renderUserBadge } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar badge del usuario
  renderUserBadge('.user-badge');
  initFilters();
  initWinnerSelection();
});

/* =========================================
   FILTROS (TABS)
   ========================================= */
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const container = document.getElementById('resultadosContainer');
  const allCards = document.querySelectorAll('.resultado-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Activar tab visualmente
      tabs.forEach(t => t.classList.remove('active', 'aria-selected="true"'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // 2. Filtrar
      const filter = tab.getAttribute('data-filter');
      
      allCards.forEach(card => {
        if (filter === 'todas') {
          card.style.display = 'block';
        } else {
          if (card.dataset.estado === filter) { // 'pendientes' o 'finalizadas' (mapeado desde el HTML)
             card.style.display = 'block';
          } else {
             card.style.display = 'none';
          }
        }
      });
    });
  });
}

/* =========================================
   SELECCIÓN DE GANADOR
   ========================================= */
function initWinnerSelection() {
  const pendingCards = document.querySelectorAll('.resultado-card[data-estado="pendientes"]');

  pendingCards.forEach(card => {
    const couples = card.querySelectorAll('.couple-card');
    const confirmBtn = card.querySelector('.btn-confirm-result');

    couples.forEach(couple => {
      couple.addEventListener('click', () => {
        // Si ya estaba seleccionada, deseleccionar
        if (couple.classList.contains('selected-winner')) {
          couples.forEach(c => {
            c.classList.remove('selected-winner', 'loser');
          });
          confirmBtn.classList.remove('visible');
          return; // Salir
        }

        // Reset previo
        couples.forEach(c => {
          c.classList.remove('selected-winner', 'loser');
        });

        // Marcar ganadora
        couple.classList.add('selected-winner');

        // Marcar perdedora a la otra(s)
        couples.forEach(c => {
          if (c !== couple) c.classList.add('loser');
        });

        // Mostrar botón guardar
        confirmBtn.classList.add('visible');
      });
    });

    // Acción del botón guardar
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        // Animación simple de "Guardado"
        confirmBtn.innerHTML = '¡Guardado!';
        confirmBtn.style.backgroundColor = 'var(--color-blue-400)';
        
        setTimeout(() => {
          // Mover visualmente a finalizadas (simulado)
          card.style.opacity = '0';
          setTimeout(() => {
            card.dataset.estado = 'finalizadas';
            // Aquí en un sistema real se haría la petición API
            // Por ahora, simulamos recarga o movimiento
            location.reload(); 
          }, 500);
        }, 800);
      });
    }
  });
}
