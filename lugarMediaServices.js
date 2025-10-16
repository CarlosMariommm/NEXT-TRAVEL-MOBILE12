// --- CAMBIO IMPORTANTE ---
// Reemplaza 'TU_IP_LOCAL' con la dirección IP de tu computadora (ej. 192.168.1.5)
const API_URL = 'http://localhost:8080/api/lugarmedia/media';
const DEFAULT_IMAGE = 'https://placehold.co/600x400/cccccc/ffffff?text=Imagen+no+disponible';

/**
 * Obtiene la URL de la imagen principal para un lugar específico.
 * @param {string} nombreLugar - El nombre del lugar a buscar.
 */
export const getImagenPrincipalPorLugar = async (nombreLugar) => {
    const url = `${API_URL}/buscar/${encodeURIComponent(nombreLugar)}?size=1`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`No se encontró imagen para ${nombreLugar}, usando imagen por defecto.`);
            return DEFAULT_IMAGE;
        }
        const data = await response.json();
        if (data.content && data.content.length > 0) {
            return data.content[0].url;
        }
        return DEFAULT_IMAGE;
    } catch (error) {
        console.error(`Error al obtener imagen para ${nombreLugar}:`, error);
        return DEFAULT_IMAGE;
    }
};
