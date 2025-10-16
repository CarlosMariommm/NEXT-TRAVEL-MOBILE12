import { createReserva } from '../Services/reservasService.js'; // <- CORRECCIÓN 1

document.addEventListener('DOMContentLoaded', () => {
    // --- Carga de datos inicial ---
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    let lugarData = null;

    if (dataParam) {
        try {
            lugarData = JSON.parse(decodeURIComponent(dataParam));
            document.getElementById('detail-image').src = lugarData.imagenUrl || 'https://placehold.co/400x320/cccccc/ffffff?text=No+Image';
            document.getElementById('detail-image').alt = `Imagen de ${lugarData.nombreLugar}`;
            document.getElementById('detail-title').textContent = lugarData.nombreLugar;
            document.getElementById('detail-location').textContent = lugarData.ubicacion;
            document.getElementById('detail-description').textContent = lugarData.descripcion || 'No hay descripción disponible.';
        } catch (error) {
            console.error('Error al parsear los datos del lugar:', error);
            document.getElementById('detail-title').textContent = 'Error al cargar';
        }
    } else {
         document.getElementById('detail-title').textContent = 'Destino no encontrado';
    }

    // --- Lógica del Modal ---
    const bookingModal = document.getElementById('booking-modal');
    const bookNowBtn = document.getElementById('book-now-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const bookingForm = document.getElementById('booking-form');

    const showModal = () => {
        bookingModal.classList.remove('hidden');
        setTimeout(() => bookingModal.classList.remove('opacity-0'), 10);
        initializeFormValidation();
    };

    const hideModal = () => {
        bookingModal.classList.add('opacity-0');
        setTimeout(() => bookingModal.classList.add('hidden'), 300);
    };

    bookNowBtn.addEventListener('click', showModal);
    closeModalBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    
    // --- Lógica de Validación ---
    const initializeFormValidation = () => {
        const duiInput = document.getElementById('duiCliente');
        const personasInput = document.getElementById('cantidadPersonas');
        const addressInput = document.getElementById('pickupAddress');
        const horaInput = document.getElementById('horaRecogida');

        // (Aquí puedes volver a agregar tu lógica de validación si lo deseas)

        bookingForm.onsubmit = async (e) => {
            e.preventDefault();
            const isValid = true; 

            if (isValid) {
                const reserva = {
                    duiCliente: duiInput.value,
                    cantidadPersonas: parseInt(personasInput.value),
                    pickupAddress: addressInput.value, // <- CORRECCIÓN 2
                    horaRecogida: horaInput.value,
                    idLugar: lugarData ? lugarData.idLugar : null
                };

                try {
                    await createReserva(reserva);
                    hideModal();
                    Swal.fire({
                        title: '¡Reserva Confirmada!',
                        text: `Tu viaje a ${lugarData.nombreLugar} ha sido agendado.`,
                        icon: 'success',
                        confirmButtonText: '¡Genial!'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error en la Reserva',
                        text: error.message,
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                }
            }
        };
    };
});