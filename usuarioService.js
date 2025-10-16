// Reemplaza esta URL con la dirección de tu API real para usuarios
const API_URL = "http://TU_API_URL/api/usuarios";

/**
 * Registra un nuevo usuario en el sistema.
 * @param {object} data - Datos del usuario: { usuario, correo, contrasena, rol }
 */
export async function registerUser(data) {
    // En una aplicación real, el rol podría asignarse por defecto en el backend
    const response = await fetch(`${API_URL}/register`, { // Asumiendo un endpoint /register
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('No se pudo registrar el usuario.');
    }
    return response.json(); // El backend podría devolver los datos del usuario o un token
}

/**
 * Autentica a un usuario y obtiene un token de acceso.
 * @param {object} credentials - Credenciales: { usuario, contrasena }
 */
export async function loginUser(credentials) {
    const response = await fetch(`${API_URL}/login`, { // Asumiendo un endpoint /login
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) {
        throw new Error('Usuario o contraseña incorrectos.');
    }
    return response.json(); // El backend debería devolver un token
}
