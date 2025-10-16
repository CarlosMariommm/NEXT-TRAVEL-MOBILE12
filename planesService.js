// --- CAMBIO IMPORTANTE ---
// Reemplaza 'TU_IP_LOCAL' con la dirección IP de tu computadora (ej. 192.168.1.5)
const API_URL = 'http://TU_IP_LOCAL:8080/api/lugares/lugares';

/**
 * Obtiene los lugares turísticos de forma paginada desde la API.
 */
export const getPlanes = async (page = 0, size = 10, sort = 'nombreLugar,asc') => {
    const url = `${API_URL}/listar?page=${page}&size=${size}&sort=${sort}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error al obtener los planes');
    }
    return await response.json();
};