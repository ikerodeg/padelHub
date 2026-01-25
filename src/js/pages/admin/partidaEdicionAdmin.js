/**
 * Lógica para la página de edición de partidas en admin (partidaEdicionAdmin.html)
 */

console.log("🚪 → 📁 partidaEdicionAdmin.js");

import { getItem, setItem } from '../../utils/storage.js';
import { showNotification } from '../../components/notification.js';

// Variables globales
let jugadores = [];
let clubes = [];
let currentMatchId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar ID en URL
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    alert('No se especificó una partida para editar.');
    window.location.href = 'partidasAdmin.html';
    return;
  }
  currentMatchId = parseInt(id);

  // 2. Cargar datos base
  await inicializarDatos();

  // 3. Poblar selects
  poblarSelectClubes();
  poblarSelectHoras();
  poblarSelectsJugadores();

  // 4. Cargar datos de la partida
  cargarDatosPartida(currentMatchId);

  // 5. Listeners botones
  document.getElementById('guardarCambiosBtn').addEventListener('click', handleGuardarCambios);
  document.getElementById('cancelarEdicionBtn').addEventListener('click', () => {
    window.location.href = 'partidasAdmin.html';
  });
});

async function inicializarDatos() {
  const allData = getItem('allDataObject');
  if (!allData) {
    alert('Error: No se encontraron datos en el sistema.');
    return;
  }
  jugadores = allData.players || [];
  clubes = allData.clubs || [];
}

// ==================== LOGICA DE SELECTS (Copiada/Adaptada de crearPartida.js) ====================

function generarOpcionesHora() {
  const opciones = [];
  for (let hora = 8; hora <= 22; hora++) {
    const horaEnPunto = hora.toString().padStart(2, '0') + ':00';
    opciones.push({ value: horaEnPunto, label: horaEnPunto });
    if (hora < 22) {
      const horaMedia = hora.toString().padStart(2, '0') + ':30';
      opciones.push({ value: horaMedia, label: horaMedia });
    }
  }
  return opciones;
}

function poblarSelectHoras() {
  const select = document.getElementById('horaPartida');
  select.innerHTML = '<option value="">Selecciona una hora</option>';
  generarOpcionesHora().forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.value;
    opt.textContent = op.label;
    select.appendChild(opt);
  });
}

function poblarSelectClubes() {
  const select = document.getElementById('clubPartida');
  select.innerHTML = '<option value="">Selecciona un club</option>';
  clubes.forEach(club => {
    const opt = document.createElement('option');
    opt.value = club.id;
    opt.textContent = club.name;
    select.appendChild(opt);
  });
}

function poblarSelectsJugadores() {
  const fields = ['reves1', 'drive1', 'reves2', 'drive2'];
  
  const updateOptions = () => {
    // Recopilar seleccionados
    const selectedIds = new Set();
    fields.forEach(id => {
      const val = document.getElementById(id).value;
      if (val) selectedIds.add(parseInt(val));
    });

    fields.forEach(id => {
      const select = document.getElementById(id);
      const currentVal = select.value ? parseInt(select.value) : null;
      
      select.innerHTML = '<option value="">Selecciona jugador</option>';
      
      jugadores.forEach(p => {
        // Mostrar si no está seleccionado en otro, o si es el seleccionado actual
        if (!selectedIds.has(p.id) || p.id === currentVal) {
           const opt = document.createElement('option');
           opt.value = p.id;
           opt.textContent = `${p.name} (${p.position})`;
           if (p.id === currentVal) opt.selected = true;
           select.appendChild(opt);
        }
      });
    });
  };

  fields.forEach(id => {
    document.getElementById(id).addEventListener('change', updateOptions);
  });
  
  // Inicial
  updateOptions();
}

// ==================== LOGICA DE CARGA Y GUARDADO ====================

function cargarDatosPartida(id) {
  const allData = getItem('allDataObject');
  const match = allData.matches.find(m => m.id === id);

  if (!match) {
    alert('Partida no encontrada.');
    window.location.href = 'partidasAdmin.html';
    return;
  }

  // Llenar formulario
  document.getElementById('numeroPartida').textContent = match.id.toString().padStart(3, '0');
  document.getElementById('fechaPartida').value = match.date;
  document.getElementById('horaPartida').value = match.time;
  document.getElementById('pistaPartida').value = match.court;
  
  // Club: match.club tiene el NOMBRE, necesitamos ID.
  const clubObj = clubes.find(c => c.name === match.club);
  if (clubObj) document.getElementById('clubPartida').value = clubObj.id;

  // Tipo (Radio)
  const radios = document.getElementsByName('tipoPartida');
  for(let r of radios) {
      if(r.value === match.type) r.checked = true;
  }

  // Jugadores
  // Asignar valores directamente, luego disparar evento change para actualizar filtros
  if (match.players.reves1) document.getElementById('reves1').value = match.players.reves1;
  if (match.players.drive1) document.getElementById('drive1').value = match.players.drive1;
  if (match.players.reves2) document.getElementById('reves2').value = match.players.reves2;
  if (match.players.drive2) document.getElementById('drive2').value = match.players.drive2;

  // Disparar update de selects de jugadores
  document.getElementById('reves1').dispatchEvent(new Event('change'));
}

async function handleGuardarCambios(e) {
  e.preventDefault();

  const form = document.getElementById('editarPartidaForm');
  if (!form.checkValidity()) {
     form.reportValidity();
     return;
  }

  const allData = getItem('allDataObject');
  const matchIndex = allData.matches.findIndex(m => m.id === currentMatchId);
  if (matchIndex === -1) return;

  const currentMatch = allData.matches[matchIndex];

  // Recoger datos
  const clubId = parseInt(document.getElementById('clubPartida').value);
  const clubName = clubes.find(c => c.id === clubId)?.name || 'Desconocido';

  const players = {
    reves1: document.getElementById('reves1').value ? parseInt(document.getElementById('reves1').value) : null,
    drive1: document.getElementById('drive1').value ? parseInt(document.getElementById('drive1').value) : null,
    reves2: document.getElementById('reves2').value ? parseInt(document.getElementById('reves2').value) : null,
    drive2: document.getElementById('drive2').value ? parseInt(document.getElementById('drive2').value) : null
  };

  // Determinar status
  // Mantenemos status "completa"/"abierta", preservando "pendiente" si ya lo tenía o si se completó
  // Si estaba "finalizada", ¿permitimos editar? Suponemos que si, pero cuidado con status.
  // Lógica simple: Si 4 jugadores -> completa. Si <4 -> abierta.
  // Si estaba finalizada, cuidado. Si el usuario edita una finalizada, ¿vuelve a pendiente?
  // Asumamos lógica estándar: Recalcular estado basado en jugadores.
  
  const numJugadores = Object.values(players).filter(id => id !== null).length;
  let newStatus = [...currentMatch.status];
  
  // Remover abierta/completa previos
  newStatus = newStatus.filter(s => s !== 'abierta' && s !== 'completa');
  
  if (numJugadores === 4) {
      newStatus.push('completa');
      // Si no estaba finalizada, quizás añadir pendiente? O dejar como estaba?
      // Si editamos una partida para completar jugadores, debería ser pendiente.
      if (!newStatus.includes('finalizada') && !newStatus.includes('pendiente')) {
          newStatus.push('pendiente');
      }
  } else {
      newStatus.push('abierta');
      // Si falta gente, no puede estar pendiente ni finalizada logicamente (aunque finalizada con <4 es raro)
      newStatus = newStatus.filter(s => s !== 'pendiente');
  }

  // Actualizar objeto
  const updatedMatch = {
    ...currentMatch,
    date: document.getElementById('fechaPartida').value,
    time: document.getElementById('horaPartida').value,
    court: document.getElementById('pistaPartida').value,
    club: clubName,
    type: document.querySelector('input[name="tipoPartida"]:checked').value,
    players: players,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  allData.matches[matchIndex] = updatedMatch;
  setItem('allDataObject', allData);

  showNotification('Partida actualizada correctamente.', 'success');
  
  setTimeout(() => {
    window.location.href = 'partidasAdmin.html';
  }, 1000);
}
