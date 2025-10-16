// Reemplaza esta URL con la dirección de tu API real cuando la tengas
const API_URL = "http://TU_API_URL/api/lugares"; 

/**
 * Obtiene la lista de todos los lugares turísticos.
 */
export async function getLugaresTuristicos() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('No se pudieron obtener los lugares.');
    return response.json();
}

/**
 * Obtiene los detalles de un único lugar turístico por su ID.
 * @param {number} id - El ID del lugar a obtener.
 */
export async function getLugarTuristicoById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('No se pudo encontrar el lugar turístico.');
    return response.json();
}

/**
 * Crea un nuevo lugar turístico.
 * @param {object} data - Los datos del lugar a crear.
 */
export async function createLugarTuristico(data) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo crear el lugar.');
}

/**
 * Actualiza un lugar turístico existente.
 * @param {number} id - El ID del lugar a actualizar.
 * @param {object} data - Los nuevos datos del lugar.
 */
export async function updateLugarTuristico(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('No se pudo actualizar el lugar.');
}

/**
 * Elimina un lugar turístico.
 * @param {number} id - El ID del lugar a eliminar.
 */
export async function deleteLugarTuristico(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) throw new Error('No se pudo eliminar el lugar.');
}
