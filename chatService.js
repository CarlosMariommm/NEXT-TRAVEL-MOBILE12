
const API_URL = "http://TU_API_URL/api/mensajes";

/**
 * Obtiene todos los mensajes de un chat específico desde el servidor.
 * @param {number} idChat - El ID del chat del que se quieren obtener los mensajes.
 * @returns {Promise<Array>} - Una promesa que se resuelve con un array de objetos de mensaje.
 */
export async function getMensajes(idChat) {
    // GET a la API 
    const response = await fetch(`${API_URL}/chat/${idChat}`);
    
    if (!response.ok) throw new Error('No se pudieron cargar los mensajes.');
    return response.json();
}

/**
 * Envía un nuevo mensaje a la base de datos a través de la API.
 * @param {object} data - Un objeto con los datos del mensaje a crear (ej. { idChat, contenido, ... }).
 * @returns {Promise<object>} - Una promesa que se resuelve con el objeto del mensaje recién creado.
 */
export async function sendMensaje(data) {
    // POST a la API 
    const response = await fetch(API_URL, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
    });
    if (!response.ok) throw new Error('No se pudo enviar el mensaje.');
    return response.json();
}

/**
 * Actualiza el contenido de un mensaje existente en la base de datos.
 * @param {number} idMensaje - El ID del mensaje que se va a actualizar.
 * @param {string} nuevoContenido - El nuevo texto del mensaje.
 */
export async function updateMensaje(idMensaje, nuevoContenido) {
    // PUT a la URL
    const response = await fetch(`${API_URL}/${idMensaje}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: nuevoContenido })
    });
    if (!response.ok) throw new Error('No se pudo actualizar el mensaje.');
}

/**
 * Elimina un mensaje de la base de datos.
 * @param {number} idMensaje - El ID del mensaje que se va a eliminar.
 */
export async function deleteMensaje(idMensaje) {
    // DELETE a la URL
    const response = await fetch(`${API_URL}/${idMensaje}`, {
        method: "DELETE" 
    });
    if (!response.ok) throw new Error('No se pudo eliminar el mensaje.');
}
