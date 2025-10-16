// URL base para los endpoints de la API
const RESERVA_API_URL = 'http://localhost:8080/api/reservas/reservas';

/**
 * Crea una nueva reserva. Es utilizado por la página de detalles de la app móvil.
 * @param {object} reservaData - Los datos de la reserva a crear.
 * @returns {Promise<any>} La respuesta del servidor.
 */
export const createReserva = async (reservaData) => {
    let response;
    try {
        response = await fetch(RESERVA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservaData),
        });
    } catch (networkError) {
        console.error('Error de Red:', networkError);
        throw new Error('Error de conexión. No se pudo contactar al servidor.');
    }

    // Si la respuesta no es exitosa (fuera del rango 200-299)
    if (!response.ok) {
        let errorData;
        try {
            // Intenta leer el cuerpo del error como JSON (que es lo que envía tu API)
            errorData = await response.json();
            console.error('Respuesta de error del servidor:', errorData);
        } catch (e) {
            // Si el cuerpo del error no es JSON, crea un error genérico
            errorData = { message: `Error del servidor: ${response.status} ${response.statusText}` };
        }
        // Lanza un error con el mensaje específico del backend
        throw new Error(errorData.message || 'Ocurrió un error inesperado al procesar la reserva.');
    }

    // Si la respuesta es exitosa, la procesa como JSON
    try {
        return await response.json();
    } catch (e) {
        console.error('Error al parsear la respuesta de éxito como JSON:', e);
        throw new Error('La respuesta del servidor no tuvo el formato esperado.');
    }
};

