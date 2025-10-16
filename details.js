import { createReserva } from '../Service/detailService.js';

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
        // CORRECCIÓN: Inicializar la validación solo cuando el modal es visible
        initializeFormValidation();
    };

    const hideModal = () => {
        bookingModal.classList.add('opacity-0');
        setTimeout(() => bookingModal.classList.add('hidden'), 300);
    };

    bookNowBtn.addEventListener('click', showModal);
    closeModalBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    
    // --- Lógica de Validación (movida a su propia función) ---
    const initializeFormValidation = () => {
        // Se obtienen las referencias a los elementos solo cuando son necesarios
        const duiInput = document.getElementById('duiCliente');
        const personasInput = document.getElementById('cantidadPersonas');
        const addressInput = document.getElementById('pickupAddress');
        const horaInput = document.getElementById('horaRecogida');

        const duiError = document.getElementById('dui-error');
        const personasError = document.getElementById('personas-error');
        const addressError = document.getElementById('address-error');
        const horaError = document.getElementById('hora-error');

        // Si alguno de estos no existe, no continuamos para evitar errores
        if (!duiInput || !personasInput || !addressInput || !horaInput) return;

        const showError = (input, messageElement, message) => {
            input.classList.add('input-error');
            messageElement.textContent = message;
            messageElement.classList.remove('hidden');
        };

        const clearError = (input, messageElement) => {
            input.classList.remove('input-error');
            messageElement.classList.add('hidden');
        };

        const validateDui = () => {
            const duiRegex = /^\d{8}-\d$/;
            if (!duiInput.value.trim()) {
                showError(duiInput, duiError, 'El DUI es obligatorio.');
                return false;
            } else if (!duiRegex.test(duiInput.value)) {
                showError(duiInput, duiError, 'Formato de DUI inválido. Use 00000000-0.');
                return false;
            }
            clearError(duiInput, duiError);
            return true;
        };
        
        const validatePersonas = () => {
            if (!personasInput.value || parseInt(personasInput.value) < 1) {
                showError(personasInput, personasError, 'Debe ser al menos 1 persona.');
                return false;
            }
            clearError(personasInput, personasError);
            return true;
        };

        const validateAddress = () => {
            if (!addressInput.value.trim()) {
                showError(addressInput, addressError, 'La dirección es obligatoria.');
                return false;
            }
            clearError(addressInput, addressError);
            return true;
        };

        const validateHora = () => {
            if (!horaInput.value) {
                showError(horaInput, horaError, 'La fecha y hora son obligatorias.');
                return false;
            }
            clearError(horaInput, horaError);
            return true;
        };
        
        // Asignar listeners de validación en tiempo real
        duiInput.oninput = validateDui;
        personasInput.oninput = validatePersonas;
        addressInput.oninput = validateAddress;
        horaInput.onchange = validateHora;
        
        // Asignar el evento submit una sola vez para evitar duplicados
        bookingForm.onsubmit = async (e) => {
            e.preventDefault();
            const isValid = validateDui() && validatePersonas() && validateAddress() && validateHora();

            if (isValid) {
                const reserva = {
                    duiCliente: duiInput.value,
                    cantidadPersonas: parseInt(personasInput.value),
                    pickupAddress: addressInput.value,
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

