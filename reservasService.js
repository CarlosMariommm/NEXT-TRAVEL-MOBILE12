// La URL correcta del endpoint para crear una reserva en tu backend
const BOOKING_API_URL = 'http://localhost:8080/api/reservas/reservasC';

/**
 * Envía los datos de una nueva reserva al servidor.
 * @param {object} bookingData - Los datos del formulario de reserva.
 * @returns {Promise<any>} La respuesta del servidor.
 */
export const createBooking = async (bookingData) => {
    try {
        const response = await fetch(BOOKING_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData),
        });

        // Si la respuesta del servidor no es exitosa (ej: error 400, 500)
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No se pudo procesar la reserva.');
        }

        // Si todo sale bien, devuelve la respuesta del servidor
        return await response.json();

    } catch (error) {
        console.error('Error de conexión o al enviar la reserva:', error);
        // Lanza el error para que el controlador pueda atraparlo y mostrarlo al usuario
        throw new Error('No se pudo contactar al servidor. Revisa tu conexión.');
    }
};