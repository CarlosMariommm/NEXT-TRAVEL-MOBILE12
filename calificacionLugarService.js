// --- CAMBIO IMPORTANTE ---
// Reemplaza 'TU_IP_LOCAL' con la dirección IP de tu computadora (ej. 192.168.1.5)
const API_URL = 'http://TU_IP_LOCAL:8080/api/calificaciones/calificaciones';

/**
 * Obtiene la calificación promedio para un lugar específico.
 * @param {string} nombreLugar - El nombre del lugar a buscar.
 */
export const getCalificacionPromedioPorLugar = async (nombreLugar) => {
    // Construye la URL para buscar calificaciones por nombre de lugar
    const url = `${API_URL}/buscar/lugar/${encodeURIComponent(nombreLugar)}?size=100`;

    try {
        const response = await fetch(url);
        // Si la respuesta no es exitosa, no se puede calcular el promedio
        if (!response.ok) {
            return 'N/A';
        }
        const data = await response.json();
        const calificaciones = data.content;

        // Si no hay calificaciones, devuelve 'N/A'
        if (!calificaciones || calificaciones.length === 0) {
            return 'N/A';
        }

        // Suma todas las puntuaciones
        const suma = calificaciones.reduce((acc, curr) => acc + curr.puntuacion, 0);
        // Calcula el promedio
        const promedio = suma / calificaciones.length;
        
        // Devuelve el promedio formateado a un decimal
        return promedio.toFixed(1);

    } catch (error) {
        // Si hay un error de red, loguéalo y devuelve 'N/A'
        console.error(`Error al obtener calificaciones para ${nombreLugar}:`, error);
        return 'N/A';
    }
};

