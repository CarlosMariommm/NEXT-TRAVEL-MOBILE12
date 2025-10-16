const AUTH_API_URL = "http://TU_API_URL/api/auth";
const CLIENTE_API_URL = "http://TU_API_URL/api/clientes";

/**
 * Obtiene los datos del perfil del cliente actualmente logueado.
 * @param {string} dui - El DUI del cliente.
 */
export async function getProfileData(dui) {
    // Simulación
    return {
        nombre: "Paul",
        apellido: "Cañas",
        correo: "paulcanas0123@email.com",
        telefono: "1234-5678",
        fotoPerfil: "img/profile-pic-example.jpg",
        puntosAcumulados: 58
    };

}

/**
 * Actualiza los datos del perfil de un cliente.
 * @param {string} dui - El DUI del cliente a actualizar.
 * @param {object} data - Los nuevos datos.
 */
export async function updateProfile(dui, data) {

    console.log("Actualizando perfil para:", dui, "con datos:", data);
    return { success: true };
}

export async function logout() {
    localStorage.removeItem('userToken');
    console.log("Sesión cerrada.");
}