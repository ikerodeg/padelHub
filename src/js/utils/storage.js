/**
 * LocalStorage Wrapper
 * Proporciona funciones para gestionar localStorage con manejo de errores
 */

/**
 * Guarda un valor en localStorage
 * @param {string} key - La clave bajo la cual se guardará el valor (ej: 'players', 'currentUser')
 * @param {*} value - El valor a almacenar (puede ser cualquier tipo: objeto, array, string, etc.)
 * @returns {boolean} - Devuelve true si se guardó correctamente, false si hubo algún error
 */

export function setItem(key, value) {
  try {
    const serializedValue = JSON.stringify(value);      // Convertir el valor a string JSON
    localStorage.setItem(key, serializedValue);         // Guardar en localStorage
    console.log(`✅ Item "${key}":`, value, `guardado en localStorage`);    // Mostrar el valor guardado
    return true;                                        // Si llegamos aquí, todo fue bien
    
  } catch (error) {
    // Caso especial: localStorage está lleno (límite ~5-10MB)
    if (error.name === 'QuotaExceededError') {
      console.error('❌ LocalStorage quota exceeded:', error);
      console.error('💡 Tip: Limpia datos antiguos con localStorage.clear()');
    } else {
      // Cualquier otro error (ej: JSON.stringify falla con valores circulares)
      console.error('❌ Error saving to localStorage:', error);
    }
    
    return false;
  }
}

/**
 * Obtiene un valor de localStorage
 * @param {string} key - La clave del valor a recuperar (ej: 'players', 'currentUser')
 * @returns {*|null} - El valor parseado desde JSON, o null si no existe o hay error
 */

export function getItem(key) {
  try {
    const serializedValue = localStorage.getItem(key);  // Obtener el string desde localStorage
    
    // Si no existe la clave, devolver null
    if (serializedValue === null) {
      return null;
    }

    // Parsear el valor
    const value = JSON.parse(serializedValue);

    // Mostrar el valor obtenido
    console.log(`✅ Item "${key}":`, value, `obtenido de localStorage`);
    
    // Devolver el valor
    return value;
    
  } catch (error) {
    // Error al parsear JSON (datos corruptos)
    console.error(`❌ Error reading from localStorage (key: "${key}"):`, error);
    console.error('💡 Tip: Los datos pueden estar corruptos. Considera limpiar esta clave.');
    
    return null;
  }
}
