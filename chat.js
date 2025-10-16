const API_URL = "http://TU_API_URL/api/mensajes";

/**
 * Obtiene todos los mensajes de un chat específico.
 * @param {number} idChat - El ID del chat del que se quieren obtener los mensajes.
 */
export async function getMensajes(idChat) {
    const response = await fetch(`${API_URL}/chat/${idChat}`);
    if (!response.ok) throw new Error('No se pudieron cargar los mensajes.');
    return response.json();
}

/**
 * Envía un nuevo mensaje a la base de datos.
 * @param {object} data - Los datos del mensaje.
 */
export async function sendMensaje(data) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo enviar el mensaje.');
    return response.json();
}

/**
 * Actualiza el contenido de un mensaje existente.
 * @param {number} idMensaje
 * @param {string} nuevoContenido
 */
export async function updateMensaje(idMensaje, nuevoContenido) {
    const response = await fetch(`${API_URL}/${idMensaje}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: nuevoContenido }) // Solo enviamos el contenido
    });
    if (!response.ok) throw new Error('No se pudo actualizar el mensaje.');
}

/**
 * Elimina un mensaje de la base de datos.
 * @param {number} idMensaje - El ID del mensaje a eliminar.
 */
export async function deleteMensaje(idMensaje) {
    const response = await fetch(`${API_URL}/${idMensaje}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error('No se pudo eliminar el mensaje.');
}


