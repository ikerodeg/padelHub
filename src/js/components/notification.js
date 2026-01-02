/**
 * ==========================================
 * NOTIFICATION COMPONENT - Sistema de notificaciones
 * ==========================================
 * Archivo: src/js/components/notification.js
 */

/**
 * Muestra una notificación temporal en pantalla
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'info')
 */
export function showNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Estilos básicos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000;
    font-family: inherit;
    font-size: 14px;
    max-width: 300px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
  `;

  // Agregar al DOM
  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  // Remover automáticamente después de 3 segundos
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
