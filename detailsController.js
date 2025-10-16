import { createReserva } from '../Services/reservaService.js';

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById("date");
    const peopleInput = document.getElementById("people");
    const bookBtn = document.getElementById("bookBtn");

    // --- Restricción de Fecha ---
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }

    // --- Lógica para el botón "Reservar" ---
    if (bookBtn) {
        bookBtn.addEventListener("click", async function () {
            const selectedDate = dateInput.value;
            const numberOfPeople = parseInt(peopleInput.value, 10);

            // 1. Validar los datos del formulario
            if (!selectedDate) {
                Swal.fire({ icon: 'error', title: '¡Falta la fecha!', text: 'Por favor, selecciona una fecha para tu viaje.' });
                return;
            }
            if (isNaN(numberOfPeople) || numberOfPeople < 1) {
                Swal.fire({ icon: 'error', title: 'Número de personas inválido', text: 'Por favor, ingresa al menos una persona.' });
                return;
            }

            // 2. Preparar los datos para enviar a la base de datos
            // NOTA: El idRuta y duiEmpleado deben obtenerse dinámicamente.
            // Por ahora, usamos valores de ejemplo.
            const reservaData = {
                idRuta: 1, // Ejemplo: Deberías obtener esto de la URL o de un data-attribute
                duiEmpleado: '12345678-9', // Ejemplo: Deberías obtener esto del usuario que ha iniciado sesión
                fechaReserva: new Date().toISOString().split('T')[0], // La fecha de hoy
                fechaViaje: selectedDate,
                estado: 'Pendiente',
                cantidadPasajeros: numberOfPeople,
                descripcion: 'Reserva desde la app móvil'
            };

            try {
                // 3. Llamar al servicio para guardar la reserva
                await createReserva(reservaData);

                // 4. Mostrar mensaje de éxito
                Swal.fire({
                    icon: 'success',
                    title: '¡Reserva exitosa!',
                    text: `Tu reserva para ${numberOfPeople} persona(s) el ${selectedDate} ha sido confirmada.`,
                });
            } catch (error) {
                console.error("Error al crear la reserva:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error en la reserva',
                    text: 'No pudimos procesar tu reserva en este momento. Por favor, inténtalo más tarde.',
                });
            }
        });
    }
});
