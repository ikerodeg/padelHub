/**
 * ==========================================
 * ERRORES - Sistema de manejo de errores de UI
 * ==========================================
 * Archivo: src/js/utils/errores.js
 * Funcionalidad: Manejo centralizado de errores sin modales (mobile-friendly)
 */
console.log("🚪 → 📁 errores.js");

/**
 * Muestra error crítico que requiere recarga de página
 * Oculta el main y muestra contenido de error inline
 * @param {string} titulo - Título del error
 * @param {string} mensaje - Mensaje detallado del error
 * @param {string} textoBoton - Texto del botón de acción (default: "Reintentar")
 * @param {Function} onAction - Función a ejecutar al hacer click (default: recargar página)
 */
export function mostrarErrorCritico(titulo, mensaje, textoBoton = "Reintentar", onAction = null) {
  console.log('💥 Mostrando error crítico:', titulo);

  // Función por defecto: recargar página
  const accionDefault = () => location.reload();
  const accion = onAction || accionDefault;

  // Ocultar contenido principal
  ocultarContenidoPrincipal();

  // Crear y mostrar contenido de error
  const errorHTML = crearContenidoError(titulo, mensaje, textoBoton, accion);
  mostrarContenidoError(errorHTML);
}

/**
 * Muestra error de datos que requiere volver al inicio
 * @param {string} titulo - Título del error
 * @param {string} mensaje - Mensaje detallado del error
 * @param {string} textoBoton - Texto del botón (default: "Volver al inicio")
 * @param {Function} onAction - Función a ejecutar (default: ir a index.html)
 */
export function mostrarErrorDatos(titulo, mensaje, textoBoton = "← Volver al inicio", onAction = null) {
  console.log('📊 Mostrando error de datos:', titulo);

  // Función por defecto: volver al inicio
  const accionDefault = () => location.href = '../index.html';
  const accion = onAction || accionDefault;

  // Ocultar contenido principal
  ocultarContenidoPrincipal();

  // Crear y mostrar contenido de error
  const errorHTML = crearContenidoError(titulo, mensaje, textoBoton, accion);
  mostrarContenidoError(errorHTML);
}

/**
 * Muestra error de validación (menos crítico, no oculta main)
 * @param {string} mensaje - Mensaje del error de validación
 * @param {string} selectorContenedor - Selector donde mostrar el error (default: '.page-header')
 */
export function mostrarErrorValidacion(mensaje, selectorContenedor = '.page-header') {
  console.log('⚠️ Mostrando error de validación:', mensaje);

  // Buscar contenedor donde mostrar el error
  const contenedor = document.querySelector(selectorContenedor);
  if (!contenedor) {
    console.warn(`⚠️ Contenedor ${selectorContenedor} no encontrado para error de validación`);
    return;
  }

  // Crear elemento de error de validación
  const errorElement = document.createElement('div');
  errorElement.className = 'error-validation';
  errorElement.setAttribute('role', 'alert');
  errorElement.innerHTML = `
    <div class="error-validation-content">
      <span class="error-validation-icon">⚠️</span>
      <span class="error-validation-message">${mensaje}</span>
    </div>
  `;

  // Aplicar estilos básicos
  Object.assign(errorElement.style, {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#dc2626'
  });

  const icon = errorElement.querySelector('.error-validation-icon');
  Object.assign(icon.style, {
    fontSize: '16px',
    flexShrink: '0'
  });

  // Insertar al inicio del contenedor
  contenedor.insertBefore(errorElement, contenedor.firstChild);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (errorElement.parentNode) {
      errorElement.remove();
    }
  }, 5000);
}

/**
 * Oculta el contenido principal de la página
 */
function ocultarContenidoPrincipal() {
  const main = document.querySelector('main');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  if (main) {
    main.style.display = 'none';
  }
  if (header) {
    header.style.display = 'none';
  }
  if (footer) {
    footer.style.display = 'none';
  }
}

/**
 * Crea el HTML del contenido de error
 * @param {string} titulo - Título del error
 * @param {string} mensaje - Mensaje del error
 * @param {string} textoBoton - Texto del botón
 * @param {Function} onAction - Función del botón
 * @returns {string} HTML del contenido de error
 */
function crearContenidoError(titulo, mensaje, textoBoton, onAction) {
  return `
    <div class="error-page">
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">${titulo}</h1>
        <p class="error-message">${mensaje}</p>
        <button class="error-button" onclick="(${onAction.toString()})()">
          ${textoBoton}
        </button>
      </div>
    </div>
  `;
}

/**
 * Muestra el contenido de error en el body
 * @param {string} html - HTML del contenido de error
 */
function mostrarContenidoError(html) {
  // Crear contenedor
  const errorContainer = document.createElement('div');
  errorContainer.innerHTML = html;

  // Aplicar estilos al contenedor principal
  const errorPage = errorContainer.querySelector('.error-page');
  Object.assign(errorPage.style, {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    padding: '20px'
  });

  // Estilos del contenedor de error
  const errorContainerDiv = errorContainer.querySelector('.error-container');
  Object.assign(errorContainerDiv.style, {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid #333',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  });

  // Estilos del icono
  const errorIcon = errorContainer.querySelector('.error-icon');
  Object.assign(errorIcon.style, {
    fontSize: '4rem',
    marginBottom: '16px'
  });

  // Estilos del título
  const errorTitle = errorContainer.querySelector('.error-title');
  Object.assign(errorTitle.style, {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0 0 12px 0',
    lineHeight: '1.2'
  });

  // Estilos del mensaje
  const errorMessage = errorContainer.querySelector('.error-message');
  Object.assign(errorMessage.style, {
    color: '#cccccc',
    fontSize: '1rem',
    lineHeight: '1.5',
    margin: '0 0 24px 0'
  });

  // Estilos del botón
  const errorButton = errorContainer.querySelector('.error-button');
  Object.assign(errorButton.style, {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    width: '100%',
    maxWidth: '200px'
  });

  // Hover effect
  errorButton.addEventListener('mouseenter', () => {
    errorButton.style.backgroundColor = '#1d4ed8';
  });
  errorButton.addEventListener('mouseleave', () => {
    errorButton.style.backgroundColor = '#2563eb';
  });

  // Añadir al body
  document.body.appendChild(errorContainer);
}

/**
 * Limpia cualquier contenido de error mostrado
 */
export function limpiarErrores() {
  // Remover contenedores de error
  const errorContainers = document.querySelectorAll('.error-page');
  errorContainers.forEach(container => container.remove());

  // Remover errores de validación
  const validationErrors = document.querySelectorAll('.error-validation');
  validationErrors.forEach(error => error.remove());

  // Mostrar contenido principal nuevamente
  const main = document.querySelector('main');
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  if (main) main.style.display = '';
  if (header) header.style.display = '';
  if (footer) footer.style.display = '';
}
