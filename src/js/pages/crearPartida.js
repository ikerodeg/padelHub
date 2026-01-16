/**
 * ==========================================
 * CREAR PARTIDA - Lógica de la página para crear partidas
 * ==========================================
 * Archivo: src/js/pages/crearPartida.js
 */
console.log("🚪 → 📁 crearPartida.js");

// ==================== IMPORTS ====================
import { getItem, setItem } from '../utils/storage.js';
import { mostrarErrorDatos } from '../utils/errores.js';
import { renderUserBadge } from '../utils/auth.js';
import { showNotification } from '../components/notification.js';
import { setStatus, hasStatus } from '../utils/statusHelper.js';

// ==================== VARIABLES GLOBALES ====================
let jugadores = [];
let clubes = [];
let numeroPartidaTemporal = null; // Número mostrado pero no confirmado
let editingMatchId = null; // ID de la partida si estamos editando

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {

  try {
    // PASO 1: Recuperar datos del cache y crear objetos jugadores/clubes
    await inicializarDatosCache();

    // Renderizar badge del usuario con sesión activa del index.html
    renderUserBadge('.user-badge');

    // Poblar selects con datos del cache
    poblarSelectClubes();
    poblarSelectHoras();
    poblarSelectsJugadores();

    // Implementar toggle del formulario
    inicializarToggleFormulario();

    // Inicializar confirmación de partida
    inicializarConfirmacionPartida();

    // Comprobar si hay solicitud de edición en la URL
    checkEditMode();

  } catch (error) {
    console.error('❌ Error en el PASO 1:', error.message);
    mostrarErrorDatos(
      'Error al cargar datos',
      `No se pudieron recuperar los datos necesarios. ${error.message}`
    );
  }
});

/**
 * Comprueba si la URL contiene parámetros para editar una partida existente
 */
function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    editingMatchId = parseInt(editId, 10);
    console.log('✏️ Modo edición detectado para partida #' + editingMatchId);
    // Pequeño delay para asegurar que los selects estén listos
    setTimeout(() => loadMatchData(editingMatchId), 100);
  }
}

/**
 * Carga los datos de una partida existente en el formulario
 * @param {number} id - ID de la partida a cargar
 */
async function loadMatchData(id) {
  const allData = getItem('allDataObject');
  const match = allData.matches.find(m => m.id === id);
  
  if (!match) {
    console.error('❌ Partida no encontrada para editar');
    showNotification('No se encontró la partida solicitada.', 'error');
    return;
  }

  console.log('📂 Cargando datos de partida:', match);

  // Abrir formulario
  const toggleBtn = document.getElementById('toggleFormBtn');
  const formSection = document.getElementById('crearPartidaSection');
  const toggleSection = document.querySelector('.form-toggle-section');
  
  if (toggleSection) toggleSection.style.display = 'none';
  if (formSection) {
    formSection.hidden = false;
    formSection.removeAttribute('aria-hidden');
  }
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');

  // Precargar número (readonly)
  const numElem = document.getElementById('numeroPartida');
  if (numElem) numElem.textContent = match.id.toString().padStart(3, '0');

  // Precargar inputs de texto/fecha
  const form = document.getElementById('crearPartidaForm');
  if (form) {
    if (form.fechaPartida) form.fechaPartida.value = match.date;
    if (form.horaPartida) form.horaPartida.value = match.time;
    // Seleccionar el club buscando por nombre si el ID no coincide directo (o por ID si tenemos mapped)
    // El objeto match tiene 'club': 'Nombre Club'. Necesito el ID.
    // Busco en el array global 'clubes'
    const clubObj = clubes.find(c => c.name === match.club);
    if (clubObj && form.clubPartida) form.clubPartida.value = clubObj.id;
    
    if (form.pistaPartida) form.pistaPartida.value = match.court;
    
    // Tipo de partida
    if (form.tipoPartida) {
       // Radio buttons
       const radios = form.elements['tipoPartida'];
       if (radios) radios.value = match.type || 'unisex';
    }

    // Jugadores - Asumiendo que el select tiene los values cargados
    // Dispath change event para actualizar filtros si es necesario, pero setear valor directo debería funcionar
    if (form.reves1 && match.players.reves1) form.reves1.value = match.players.reves1;
    if (form.drive1 && match.players.drive1) form.drive1.value = match.players.drive1;
    if (form.reves2 && match.players.reves2) form.reves2.value = match.players.reves2;
    if (form.drive2 && match.players.drive2) form.drive2.value = match.players.drive2;
  }

  // Modificar UI para reflejar edición
  const pageTitle = document.querySelector('.page-title');
  if (pageTitle) pageTitle.textContent = `Editar Partida #${match.id.toString().padStart(3, '0')}`;
  
  const confirmBtn = document.getElementById('confirmarPartidaBtn');
  if (confirmBtn) {
    confirmBtn.textContent = 'GUARDAR CAMBIOS';
    confirmBtn.classList.remove('btn-success');
    confirmBtn.classList.add('btn-primary'); // Cambiar color si se desea
  }
  
  console.log('✅ Formulario precargado con datos de partida #' + id);
}

// ==================== RECUPERACIÓN DE DATOS ====================

/**
 * PASO 1: Recupera todos los datos guardados en el cache
 * Crea los objetos globales 'jugadores' y 'clubes' como especificado
 */
async function inicializarDatosCache() {
  console.log('📦 Recuperando datos del cache...');

  try {
    // Obtener el objeto unificado del cache
    const datosCache = getItem('allDataObject');

    if (!datosCache) {
      throw new Error('No se encontraron datos en cache. Regrese a la página principal.');
    }

    // Extraer los arrays de datos
    const { players: playersData, clubs: clubsData } = datosCache;

    // Validar que los datos existan y sean arrays válidos
    if (!Array.isArray(playersData) || playersData.length === 0) {
      throw new Error('No se encontraron datos de jugadores válidos');
    }

    if (!Array.isArray(clubsData) || clubsData.length === 0) {
      throw new Error('No se encontraron datos de clubes válidos');
    }

    // Crear los objetos globales
    jugadores = playersData;
    clubes = clubsData;

    console.log(`✅ Objeto 'jugadores' creado con ${jugadores.length} registros`);
    console.log(`✅ Objeto 'clubes' creado con ${clubes.length} registros`);
    console.log('✅ Todos los datos recuperados del cache exitosamente');

  } catch (error) {
    console.error('❌ Error al recuperar datos del cache:', error.message);
    throw error;
  }
}

// ==================== SISTEMA DE HORARIOS ====================

/**
 * Genera opciones de hora para el select de horarios de partida
 * Horarios disponibles: 08:00 a 22:00 en intervalos de 30 minutos
 * @returns {Array<{value: string, label: string}>} Array de opciones de hora
 */
function generarOpcionesHora() {
  const opciones = [];
  const horaInicio = 8; // 08:00
  const horaFin = 22;   // 22:00

  for (let hora = horaInicio; hora <= horaFin; hora++) {
    // Primera opción: hora en punto (ej: 08:00)
    const horaEnPunto = hora.toString().padStart(2, '0') + ':00';
    opciones.push({
      value: horaEnPunto,
      label: `${horaEnPunto}`
    });

    // Segunda opción: media hora (ej: 08:30), excepto para la última hora
    if (hora < horaFin) {
      const horaMedia = hora.toString().padStart(2, '0') + ':30';
      opciones.push({
        value: horaMedia,
        label: `${horaMedia}`
      });
    }
  }

  return opciones;
}

/**
 * Llena el select de clubes con los datos del cache
 */
function poblarSelectClubes() {
  console.log('🏓 Poblando select de clubes...');

  const selectClub = document.getElementById('clubPartida');
  if (!selectClub) {
    console.warn('⚠️ Select de club no encontrado');
    return;
  }

  try {
    // Limpiar opciones existentes excepto la primera
    while (selectClub.children.length > 1) {
      selectClub.removeChild(selectClub.lastChild);
    }

    // Crear opciones para cada club
    clubes.forEach(club => {
      const option = document.createElement('option');
      option.value = club.id;
      option.textContent = club.name;
      option.dataset.clubId = club.id;

      selectClub.appendChild(option);
    });

    console.log(`✅ ${clubes.length} clubes añadidos al select`);

  } catch (error) {
    console.error('❌ Error al poblar select de clubes:', error.message);
  }
}

/**
 * Llena el select de horas con las opciones disponibles
 */
function poblarSelectHoras() {
  console.log('🕐 Poblando select de horas...');

  const selectHora = document.getElementById('horaPartida');
  if (!selectHora) {
    console.warn('⚠️ Select de hora no encontrado');
    return;
  }

  try {
    // Limpiar opciones existentes excepto la primera
    while (selectHora.children.length > 1) {
      selectHora.removeChild(selectHora.lastChild);
    }

    // Generar y agregar opciones de hora
    const opcionesHora = generarOpcionesHora();
    opcionesHora.forEach(opcion => {
      const optionElement = document.createElement('option');
      optionElement.value = opcion.value;
      optionElement.textContent = opcion.label;
      selectHora.appendChild(optionElement);
    });

    console.log(`✅ ${opcionesHora.length} opciones de hora añadidas al select`);

  } catch (error) {
    console.error('❌ Error al poblar select de horas:', error.message);
  }
}

/**
 * Llena todos los selects de jugadores con los datos del cache
 * Maneja la lógica para evitar duplicados entre selects
 */
function poblarSelectsJugadores() {
  console.log('👥 Poblando selects de jugadores...');

  const selectsJugadores = [
    { id: 'reves1', element: null },
    { id: 'drive1', element: null },
    { id: 'reves2', element: null },
    { id: 'drive2', element: null }
  ];

  // Obtener referencias a los elementos
  selectsJugadores.forEach(select => {
    select.element = document.getElementById(select.id);
  });

  // Verificar que todos los selects existen
  const selectsInvalidos = selectsJugadores.filter(s => !s.element);
  if (selectsInvalidos.length > 0) {
    console.warn('⚠️ Algunos selects de jugadores no encontrados:', selectsInvalidos.map(s => s.id));
    return;
  }

  try {
    // Función para actualizar opciones disponibles
    const actualizarOpcionesDisponibles = () => {
      // Obtener IDs de jugadores ya seleccionados
      const seleccionados = new Set();
      selectsJugadores.forEach(({ element }) => {
        const valor = element.value;
        if (valor && valor !== '') {
          seleccionados.add(parseInt(valor));
        }
      });

      // Actualizar cada select
      selectsJugadores.forEach(({ element, id }) => {
        const valorActual = element.value;

        // Limpiar opciones existentes
        element.innerHTML = '<option value="">Selecciona jugador</option>';

        // Crear opciones para cada jugador disponible
        jugadores.forEach(jugador => {
          // Si ya está seleccionado en otro campo, no mostrar
          if (seleccionados.has(jugador.id) && jugador.id !== parseInt(valorActual)) {
            return;
          }

          const option = document.createElement('option');
          option.value = jugador.id;
          option.textContent = `${jugador.name} (${jugador.position})`;
          option.dataset.jugadorId = jugador.id;
          option.dataset.position = jugador.position;

          // Si era la selección previa, mantenerla seleccionada
          if (jugador.id === parseInt(valorActual)) {
            option.selected = true;
          }

          element.appendChild(option);
        });
      });
    };

    // Inicializar opciones por primera vez
    actualizarOpcionesDisponibles();

    // Agregar event listeners para actualizar cuando cambie cualquier select
    selectsJugadores.forEach(({ element }) => {
      element.addEventListener('change', actualizarOpcionesDisponibles);
    });

    console.log(`✅ Selects de jugadores poblados con ${jugadores.length} opciones disponibles`);

  } catch (error) {
    console.error('❌ Error al poblar selects de jugadores:', error.message);
  }
}

// ==================== SISTEMA DE NUMERACIÓN ====================

/**
 * Obtiene el número de la siguiente partida desde localStorage
 * Si no existe contador, devuelve 1
 * @returns {number} Número de la siguiente partida
 */
function obtenerSiguienteNumeroPartida() {
  const contadorActual = getItem('contadorPartidas') || 0;
  return contadorActual + 1;
}

/**
 * Incrementa el contador de partidas en localStorage
 * @returns {number} Nuevo número de partida
 */
function incrementarContadorPartidas() {
  const contadorActual = getItem('contadorPartidas') || 0;
  const nuevoContador = contadorActual + 1;

  setItem('contadorPartidas', nuevoContador);
  console.log(`🔢 Contador de partidas incrementado a: ${nuevoContador}`);

  return nuevoContador;
}

/**
 * Muestra el número de partida en el elemento correspondiente del DOM
 * @param {number} numeroPartida - Número de partida a mostrar
 */
function mostrarNumeroPartida(numeroPartida) {
  const numeroPartidaElement = document.getElementById('numeroPartida');

  if (numeroPartidaElement) {
    // Formatear con 3 dígitos (001, 002, etc.)
    const numeroFormateado = numeroPartida.toString().padStart(3, '0');
    numeroPartidaElement.textContent = numeroFormateado;
    console.log(`📋 Número de partida mostrado: #${numeroFormateado}`);
  } else {
    console.warn('⚠️ Elemento numeroPartida no encontrado en el DOM');
  }
}

// ==================== TOGGLE DEL FORMULARIO ====================

/**
 * Inicializa el sistema de toggle del formulario
 * Permite mostrar/ocultar el formulario de crear partida
 */
function inicializarToggleFormulario() {
  console.log('🔄 Inicializando toggle del formulario...');

  // Captura de elementos del DOM
  const toggleBtn = document.getElementById('toggleFormBtn');
  const formSection = document.getElementById('crearPartidaSection');
  const toggleSection = document.querySelector('.form-toggle-section');
  const cancelBtn = document.getElementById('cancelarPartidaBtn');

  // Validar que los elementos existan
  if (!toggleBtn || !formSection || !toggleSection) {
    console.warn('⚠️ Elementos del toggle del formulario no encontrados');
    return;
  }

  // Evento para mostrar el formulario (CREAR PARTIDA)
  toggleBtn.addEventListener('click', () => {
    console.log('📝 Mostrando formulario de crear partida');

    // Obtener el siguiente número disponible (sin incrementar aún)
    numeroPartidaTemporal = obtenerSiguienteNumeroPartida();

    // Mostrar el número de partida temporal en el formulario
    mostrarNumeroPartida(numeroPartidaTemporal);

    // Ocultar sección del botón
    toggleSection.style.display = 'none';

    // Mostrar sección del formulario
    formSection.hidden = false;
    formSection.removeAttribute('aria-hidden');

    // Actualizar atributos de accesibilidad
    toggleBtn.setAttribute('aria-expanded', 'true');

    // Enfocar el primer campo del formulario para mejor UX
    setTimeout(() => {
      const firstInput = formSection.querySelector('input:not([type="radio"]), select');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);

    console.log(`✅ Formulario mostrado con número temporal: ${numeroPartidaTemporal}`);
  });

  // Evento para ocultar el formulario (CANCELAR)
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      console.log('❌ Cancelando creación de partida');

      // Mostrar sección del botón
      toggleSection.style.display = 'block';
      toggleSection.style.display = ''; // Limpiar inline style para usar CSS original

      // Ocultar sección del formulario
      formSection.hidden = true;
      formSection.setAttribute('aria-hidden', 'true');

      // Resetear formulario y limpiar estado
      resetearFormulario();

      console.log('✅ Formulario ocultado correctamente');
    });
  }

    console.log('✅ Toggle del formulario inicializado');
  }

// ==================== CONFIRMACIÓN DE PARTIDA ====================

/**
 * Inicializa los event listeners para confirmar la creación de partida
 */
function inicializarConfirmacionPartida() {
  console.log('✅ Inicializando confirmación de partida...');

  const confirmBtn = document.getElementById('confirmarPartidaBtn');
  const form = document.getElementById('crearPartidaForm');

  if (!confirmBtn || !form) {
    console.warn('⚠️ Elementos de confirmación no encontrados');
    return;
  }

  // Evento para confirmar creación de partida
  confirmBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir submit por defecto

    // Validar formulario antes de confirmar
    if (!validarFormulario(form)) {
      console.warn('⚠️ Formulario no válido, no se puede confirmar');
      return;
    }

    // Confirmar la partida (incrementar contador y guardar)
    confirmarPartida();

    // Determinar estado para el mensaje
    const formData = obtenerDatosFormulario();
    const estadoPartida = determinarEstadoPartida(formData.players);
    const mensajeEstado = estadoPartida.includes('completa') ? 'completa' : 'abierta (faltan jugadores)';

    console.log(`🎾 Partida ${mensajeEstado} confirmada y creada en el sistema`);

    // Mostrar notificación de éxito
    const successMessage = `¡Nueva partida creada! Partida ${mensajeEstado}.`;
    showNotification(successMessage, 'success');

    // Resetear formulario y volver al estado inicial
    resetearFormulario();

    // Redirigir a la landing page
    /*console.log('🏠 Redirigiendo a landing page...');
    window.location.href = '../index.html';*/
  });
}

/**
 * Confirma la creación o edición de la partida
 * y guardando los cambios en localStorage
 */
function confirmarPartida() {
  console.log('🎾 Confirmando acción de partida...');

  try {
    // Obtener datos del formulario
    const formData = obtenerDatosFormulario();

    // Determinar estado de la partida
    const status = determinarEstadoPartida(formData.players);

    // Crear objeto de partida (nuevo o actualizado)
    const partida = crearObjetoPartida(formData, status);

    // Guardar partida en localStorage
    guardarPartida(partida);

    // Incrementa contador SOLO si es nueva partida
    if (editingMatchId === null) {
      incrementarContadorPartidas();
    }

    const mensajeEstado = status.includes('completa') ? 'completa' : 'abierta';
    
    if (editingMatchId !== null) {
        console.log(`✅ Partida #${partida.id} actualizada exitosamente`);
        showNotification('Cambios guardados correctamente. Redirigiendo...', 'success');
        
        // Redirigir a la lista tras editar
        setTimeout(() => {
            window.location.href = 'lista-partidas.html';
        }, 1500);
        
    } else {
        console.log(`✅ Partida #${partida.id} creada exitosamente`);
        showNotification(`¡Nueva partida creada! Partida ${mensajeEstado}.`, 'success');
        // Resetear formulario para seguir creando
        resetearFormulario();
    }
    
    // Limpiar variables temporales
    numeroPartidaTemporal = null;
    editingMatchId = null;

  } catch (error) {
    console.error('❌ Error al confirmar partida:', error.message);
    throw error;
  }
}

/**
 * Obtiene los datos del formulario
 * @returns {Object} Datos del formulario
 */
function obtenerDatosFormulario() {
  const form = document.getElementById('crearPartidaForm');

  // Obtener valores del formulario
  const fecha = form.fechaPartida.value;
  const hora = form.horaPartida.value;
  const clubId = parseInt(form.clubPartida.value);
  const pista = form.pistaPartida.value;
  const tipo = form.tipoPartida.value;

  // Obtener club por ID
  const clubSeleccionado = clubes.find(club => club.id === clubId);
  const nombreClub = clubSeleccionado ? clubSeleccionado.name : 'Desconocido';

  // Obtener jugadores seleccionados
  const players = {
    reves1: form.reves1.value ? parseInt(form.reves1.value) : null,
    drive1: form.drive1.value ? parseInt(form.drive1.value) : null,
    reves2: form.reves2.value ? parseInt(form.reves2.value) : null,
    drive2: form.drive2.value ? parseInt(form.drive2.value) : null
  };

  return {
    fecha,
    hora,
    clubId,
    nombreClub,
    pista,
    tipo,
    players
  };
}

/**
 * Determina si la partida está completa o abierta
 * @param {Object} players - Objeto con los jugadores seleccionados
 * @returns {Array<string>} Array con estados: ["completa", "pendiente"] o ["abierta"]
 */
function determinarEstadoPartida(players) {
  // Contar jugadores no nulos
  const jugadoresSeleccionados = Object.values(players).filter(player => player !== null);

  // Si tiene 4 jugadores, está completa y pendiente de resultado
  // Si no, está abierta (faltan jugadores)
  return jugadoresSeleccionados.length === 4 ? ['completa', 'pendiente'] : ['abierta'];
}

/**
 * Crea el objeto de partida con todos los datos necesarios
 * Soporta creación y edición (mergeando datos originales)
 * @param {Object} formData - Datos del formulario
 * @param {Array<string>} status - Estados de la partida
 * @returns {Object} Objeto de partida completo
 */
function crearObjetoPartida(formData, status) {
  let basePartida = {};

  if (editingMatchId !== null) {
    // Si estamos editando, recuperamos la partida original para mantener metadatos
    const allData = getItem('allDataObject');
    const original = allData.matches.find(m => m.id === editingMatchId);
    if (original) {
        basePartida = original;
        console.log('🔄 Utilizando datos base de partida existente');
    }
  } else {
    // Datos base para NUEVA partida
    const userData = getItem('cachedUserData');
    const createdBy = userData ? userData.id : 1;
    
    basePartida = {
        id: numeroPartidaTemporal,
        createdBy: createdBy,
        createdAt: new Date().toISOString()
    };
  }

  // Retornar objeto mergeado (base + cambios del form)
  return {
    ...basePartida,
    date: formData.fecha,
    time: formData.hora,
    club: formData.nombreClub,
    court: formData.pista,
    type: formData.tipo,
    players: formData.players,
    status: status,
    // updatedBy se podría añadir aquí si quisiéramos traquear quién editó
    updatedAt: new Date().toISOString()
  };
}

/**
 * Guarda la partida en localStorage
 * @param {Object} partida - Objeto de partida a guardar
 */
function guardarPartida(partida) {
  console.log('💾 Guardando partida en localStorage...');

  try {
    // Obtener datos existentes del cache
    const datosCache = getItem('allDataObject') || {};

    // Crear copia del array de matches para evitar modificar el original
    const matches = Array.isArray(datosCache.matches) ? [...datosCache.matches] : [];

    // Buscar si la partida ya existe
    const index = matches.findIndex(m => m.id === partida.id);

    if (index !== -1) {
        // ACTUALIZAR: Reemplazar partida existente
        matches[index] = partida;
        console.log(`🔄 Partida #${partida.id} actualizada en la posición ${index}`);
    } else {
        // CREAR: Agregar nueva partida
        matches.push(partida);
        console.log(`✨ Nueva partida #${partida.id} añadida al final`);
    }

    // Crear nuevo objeto con la partida añadida/actualizada
    const nuevosDatos = {
      ...datosCache,
      matches: matches
    };

    // Guardar en localStorage
    setItem('allDataObject', nuevosDatos);

    console.log(`✅ Datos guardados exitosamente (Total: ${matches.length} partidas)`);

  } catch (error) {
    console.error('❌ Error al guardar partida:', error.message);
    throw error;
  }
}

/**
 * Valida que el formulario tenga los campos básicos requeridos
 * Los jugadores son opcionales - se pueden crear partidas "abiertas"
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {boolean} true si es válido
 */
function validarFormulario(form) {
  // Verificar campos básicos requeridos (excluyendo selects de jugadores)
  const camposRequeridos = form.querySelectorAll('input[required], select[required]:not(#reves1):not(#drive1):not(#reves2):not(#drive2)');
  let esValido = true;

  camposRequeridos.forEach(campo => {
    if (!campo.value || campo.value.trim() === '') {
      campo.classList.add('error');
      esValido = false;
    } else {
      campo.classList.remove('error');
    }
  });

  // Los jugadores son OPCIONALES - se pueden crear partidas "abiertas"
  // No hay validación mínima de jugadores requerida

  console.log('✅ Validación completada - campos básicos OK');
  return esValido;
}

/**
 * Resetea el formulario y vuelve al estado inicial
 */
function resetearFormulario() {
  const form = document.getElementById('crearPartidaForm');
  const toggleSection = document.querySelector('.form-toggle-section');
  const formSection = document.getElementById('crearPartidaSection');
  const toggleBtn = document.getElementById('toggleFormBtn');

  // Resetear formulario
  if (form) {
    form.reset();
  }

  // Limpiar número temporal
  numeroPartidaTemporal = null;

  // Ocultar formulario y mostrar botón
  if (formSection) {
    formSection.hidden = true;
    formSection.setAttribute('aria-hidden', 'true');
  }

  if (toggleSection) {
    toggleSection.style.display = 'block';
    toggleSection.style.display = ''; // Limpiar inline style
  }

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }

  // Resetear display del número
  const numeroPartidaElement = document.getElementById('numeroPartida');
  if (numeroPartidaElement) {
    numeroPartidaElement.textContent = '---';
  }

  console.log('🔄 Formulario reseteado al estado inicial');
}
