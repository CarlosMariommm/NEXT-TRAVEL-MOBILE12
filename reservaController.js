import { createBooking } from '../Services/reservasService.js';

// Se ejecuta cuando el contenido de la página está listo
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. OBTENER Y MOSTRAR DATOS DEL LUGAR ---
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    let lugarData = null;

    if (dataParam) {
        try {
            lugarData = JSON.parse(decodeURIComponent(dataParam));
            document.getElementById('detail-image').src = lugarData.imagenUrl || 'https://placehold.co/400x320/cccccc/ffffff?text=Sin+Imagen';
            document.getElementById('detail-title').textContent = lugarData.nombreLugar;
            document.getElementById('detail-location').textContent = lugarData.ubicacion;
            document.getElementById('detail-description').textContent = lugarData.descripcion || 'No hay descripción disponible.';
        } catch (error) {
            console.error('Error al obtener los datos del lugar:', error);
            document.getElementById('detail-title').textContent = 'Error al cargar datos';
        }
    } else {
        document.getElementById('detail-title').textContent = 'Destino no encontrado';
    }

    // --- 2. MANEJO DEL MODAL DE RESERVA ---
    const bookingModal = document.getElementById('booking-modal');
    const bookNowBtn = document.getElementById('book-now-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    const showModal = () => bookingModal.classList.remove('hidden');
    const hideModal = () => bookingModal.classList.add('hidden');

    bookNowBtn.addEventListener('click', showModal);
    closeModalBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    // --- 3. LÓGICA DEL FORMULARIO DE RESERVA ---
    const bookingForm = document.getElementById('booking-form');

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Construir el objeto de datos para enviar al backend
        const reservaData = {
            duiCliente: document.getElementById('duiCliente').value,
            cantidadPersonas: parseInt(document.getElementById('cantidadPersonas').value),
            pickupAddress: document.getElementById('pickupAddress').value,
            horaRecogida: document.getElementById('horaRecogida').value,
            idLugar: lugarData ? lugarData.idLugar : null
        };

        // Validar que los datos no estén vacíos
        if (!reservaData.duiCliente || !reservaData.cantidadPersonas || !reservaData.pickupAddress || !reservaData.horaRecogida || !reservaData.idLugar) {
            Swal.fire('Campos incompletos', 'Por favor, llena todos los campos del formulario.', 'warning');
            return;
        }

        try {
            // Llamar a la función del servicio para enviar los datos
            const response = await createBooking(reservaData);
            hideModal(); // Ocultar el formulario
            
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Reserva Confirmada!',
                text: `Tu viaje a ${lugarData.nombreLugar} ha sido agendado. ID de reserva: ${response.idReserva}`,
                icon: 'success',
                confirmButtonText: '¡Excelente!'
            }).then(() => {
                window.location.href = 'planes.html'; // Redirigir a otra página
            });

        } catch (error) {
            // Mostrar mensaje de error si algo sale mal
            console.error("Error al crear la reserva:", error);
            Swal.fire({
                title: 'Error en la Reserva',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    });
});