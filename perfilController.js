import { getProfileData, updateProfile, logout } from '../services/authService.js';
import { getReservasByCliente } from '../Services/reservaService.js';

document.addEventListener("DOMContentLoaded", () => {
    // En una app real, obtendrías el DUI del usuario logueado
    const userDUI = '12345678-9'; // DUI de ejemplo

    // Referencias a elementos del DOM 
    const profilePicture = document.getElementById('profile-picture');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePoints = document.getElementById('profile-points');
    const profileForm = document.getElementById('profile-form');
    const firstNameInput = document.getElementById('profile-firstname-input');
    const lastNameInput = document.getElementById('profile-lastname-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const editBtn = document.getElementById('edit-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const editButtonsContainer = document.getElementById('profile-edit-buttons');
    const logoutBtn = document.getElementById('logout-btn');
    const reservationsList = document.getElementById('reservations-list');
    const favoritesList = document.getElementById('favorites-list');

    let originalProfileData = {};

    //1. --- Carga de Datos ---
    async function loadAllData() {
        loadProfile();
        loadReservations();
        loadFavorites();
    }

    async function loadProfile() {
        try {
            const userData = await getProfileData(userDUI);
            originalProfileData = userData;

            profilePicture.src = userData.fotoPerfil || 'img/placeholder-user.png';
            profileName.textContent = `${userData.nombre} ${userData.apellido}`;
            profileEmail.textContent = userData.correo;
            profilePoints.textContent = userData.puntosAcumulados || 0;
            firstNameInput.value = userData.nombre;
            lastNameInput.value = userData.apellido;
            phoneInput.value = userData.telefono;
        } catch (error) {
            handleAuthError(error, "cargar tus datos");
        }
    }
    
    async function loadReservations() {
        try {
            const reservas = await getReservasByCliente(userDUI);
            reservationsList.innerHTML = "";
            if (reservas.length === 0) {
                reservationsList.innerHTML = '<p class="text-muted text-center">No tienes reservas.</p>';
                return;
            }
            reservas.forEach(reserva => {
                const item = document.createElement('a');
                item.href = `details.html?id=${reserva.idReserva}`;
                item.className = 'list-group-item list-group-item-action';
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${reserva.nombreRuta}</h6>
                        <small>${reserva.fechaViaje}</small>
                    </div>
                    <small class="text-muted">Estado: ${reserva.estado}</small>
                `;
                reservationsList.appendChild(item);
            });
        } catch (error) {
            reservationsList.innerHTML = '<p class="text-danger text-center">No se pudieron cargar las reservas.</p>';
        }
    }

    async function loadFavorites() {
        favoritesList.innerHTML = '<p class="text-muted text-center">Aún no tienes favoritos.</p>';
    }

    //2.  --- Lógica de Edición de Perfil ---
    editBtn.addEventListener('click', () => {
        toggleEditMode(true);
    });

    cancelBtn.addEventListener('click', () => {
        firstNameInput.value = originalProfileData.nombre;
        lastNameInput.value = originalProfileData.apellido;
        phoneInput.value = originalProfileData.telefono;
        toggleEditMode(false);
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedData = {
            nombre: firstNameInput.value,
            apellido: lastNameInput.value,
            telefono: phoneInput.value,
        };

        try {
            await updateProfile(userDUI, updatedData);
            Swal.fire('¡Guardado!', 'Tu perfil ha sido actualizado.', 'success');
            originalProfileData = {...originalProfileData, ...updatedData};
            profileName.textContent = `${updatedData.nombre} ${updatedData.apellido}`;
            toggleEditMode(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar tu perfil.', 'error');
        }
    });

    function toggleEditMode(enable) {
        firstNameInput.disabled = !enable;
        lastNameInput.disabled = !enable;
        phoneInput.disabled = !enable;
        editButtonsContainer.classList.toggle('d-none', !enable);
        editBtn.classList.toggle('d-none', enable);
    }

    //3. --- Lógica de Cerrar Sesión ---
    logoutBtn.addEventListener('click', async () => {
        try {
            await logout();
            Swal.fire({
                icon: 'success',
                title: 'Has cerrado sesión',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = 'index.html';
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo cerrar la sesión.', 'error');
        }
    });
    
    function handleAuthError(error, action) {
        console.error(`Error al ${action}:`, error);
        Swal.fire('Error de Autenticación', `No se pudo ${action}. Serás redirigido al inicio de sesión.`, 'error')
        .then(() => {
            window.location.href = 'index.html';
        });
    }

    loadAllData();
});
