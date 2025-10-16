document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita que el formulario se envíe
    
    // Simulación de datos de usuario después de un login exitoso
    const userProfile = {
        nombreUsuario: 'laura_p',
        nombreCompleto: 'Laura Pérez',
        correo: 'laura.p@example.com',
        puntos_actuales: 1500,
        rol: 'USER',
        foto_url: 'https://placehold.co/128x128/7B61FF/FFFFFF?text=LP'
    };

    // Guardar en localStorage para simular la sesión
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Redirigir a la página de descubrir
    window.location.href = "descubrir.html";
});