document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener los datos del usuario desde localStorage
    const usuarioString = localStorage.getItem('usuario');
    
    if (usuarioString) {
        const usuario = JSON.parse(usuarioString);

        // 2. Actualizar la interfaz de usuario (UI) con los datos reales
        const nombreUsuarioEl = document.getElementById('nombre-usuario');
        const correoUsuarioEl = document.getElementById('correo-usuario');
        const fotoPerfilEl = document.getElementById('foto-perfil');

        if (nombreUsuarioEl) {
            nombreUsuarioEl.textContent = usuario.nombre; // Usa el nombre real
        }
        if (correoUsuarioEl) {
            correoUsuarioEl.textContent = usuario.correo; // Usa el correo real
        }
        
        // 3. (Opcional) Manejar la foto de perfil si la tienes en los datos del usuario
        // if (fotoPerfilEl && usuario.foto_url) {
        //     fotoPerfilEl.src = usuario.foto_url;
        // }
    } else {
        // Si no hay datos de usuario, quizás redirigir al login
        console.warn('No se encontraron datos de usuario en localStorage.');
        window.location.href = 'index.html';
    }

    // 4. Funcionalidad de Cerrar Sesión
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            // Llama a la función de logout de tu backend
            try {
                const response = await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                if(response.ok) {
                    // Limpia el almacenamiento local y redirige al login
                    localStorage.removeItem('usuario');
                    localStorage.removeItem('authToken');
                    window.location.href = 'index.html';
                } else {
                    console.error('Error al cerrar sesión en el backend.');
                }
            } catch (error) {
                console.error('Error de conexión al cerrar sesión:', error);
            }
        });
    }
});