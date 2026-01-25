/**
 * ==========================================
 * FORMULARIO JUGADOR - ADMIN
 * ==========================================
 * Gestiona el alta y edición de jugadores.
 * - Lee parámetros URL para saber si es edición (?id=X)
 * - Gestiona subida de imagen a Base64
 * - Guarda en localStorage
 */

import { initializeAppData } from '../../utils/dataLoader.js';
import { getItem, setItem } from '../../utils/storage.js';

const form = document.getElementById('playerForm');
const cancelBtn = document.getElementById('cancelBtn');
const pageTitle = document.getElementById('pageTitle');
const fileInput = document.getElementById('playerPhoto');
const previewImg = document.getElementById('imagePreview');
const photoBase64Input = document.getElementById('photoBase64');

let isEditing = false;
let players = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAppData();
    const allData = getItem('allDataObject');
    players = allData.players || [];

    // Check URL URLSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('id');

    if (playerId) {
        loadPlayerForEdit(parseInt(playerId));
    }

    setupEventListeners();
});

function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', () => window.location.href = 'jugadoresAdmin.html');
    
    // File Upload Preview
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(evt) {
                // Mostrar preview
                previewImg.src = evt.target.result;
                // Guardar base64 en input hidden
                photoBase64Input.value = evt.target.result;
            }
            
            reader.readAsDataURL(file);
        }
    });
}

function loadPlayerForEdit(id) {
    const player = players.find(p => p.id === id);
    if (!player) {
        alert('Jugador no encontrado');
        window.location.href = 'jugadoresAdmin.html';
        return;
    }

    isEditing = true;
    pageTitle.textContent = player.name;
    
    // Fill fields
    document.getElementById('playerId').value = player.id;
    document.getElementById('playerName').value = player.name;
    document.getElementById('playerAvatar').value = player.avatar;
    document.getElementById('playerPosition').value = player.position;
    document.getElementById('playerPoints').value = player.points || 0;
    document.getElementById('playerRacket').value = player.racket || '';
    document.getElementById('playerAvailability').value = player.availability || '';
    
    // Foto
    if (player.profileImg && player.profileImg.startsWith('data:image')) {
        previewImg.src = player.profileImg;
        photoBase64Input.value = player.profileImg;
    } else if (player.profileImg) {
        // Es una ruta relativa (ej: ../assets/...)
        // Como estamos en /pages/admin/, necesitamos subir dos niveles (../../)
        let imagePath = player.profileImg;
        if (imagePath.startsWith('../assets')) {
            imagePath = imagePath.replace('../assets', '../../assets');
        }
        previewImg.src = imagePath;
        // No ponemos nada en base64Input para preservar el valor original si no se cambia
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    
    // Construir objeto base
    const playerData = {
        name: formData.get('name'),
        avatar: formData.get('avatar'),
        position: formData.get('position'),
        points: parseInt(formData.get('points')) || 0,
        racket: formData.get('racket') || "",
        availability: formData.get('availability') || "",
        // La imagen se gestiona especial
        profileImg: photoBase64Input.value || null
    };
    
    if (isEditing) {
        const id = parseInt(document.getElementById('playerId').value);
        const index = players.findIndex(p => p.id === id);
        
        if (index !== -1) {
            // Preservar datos antiguos
            const oldData = players[index];
            
            // Si no se subió foto nueva (base64Input vacio) y ya tenía una, mantenerla
            if (!playerData.profileImg && oldData.profileImg) {
                playerData.profileImg = oldData.profileImg;
            }

            players[index] = { ...oldData, ...playerData, id: id };
        }
    } else {
        // Crear nuevo
        const maxId = players.reduce((max, p) => p.id > max ? p.id : max, 0);
        playerData.id = maxId + 1;
        playerData.stats = { matches: 0, won: 0, winRate: 0 };
        playerData.strengths = [];
        playerData.badges = ['primerizo'];
        
        players.push(playerData);
    }
    
    // Guardar
    const allData = getItem('allDataObject');
    allData.players = players;
    setItem('allDataObject', allData);
    
    // Limpiar cache y redirigir
    localStorage.removeItem('cachedUserData');
    window.location.href = 'jugadoresAdmin.html';
}
