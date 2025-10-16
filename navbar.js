// Contenido para js/navbar.js

document.addEventListener('DOMContentLoaded', () => {
    // Encuentra el nombre del archivo de la página actual (ej. "planes.html")
    const currentPage = window.location.pathname.split('/').pop();
    if (!currentPage) return;

    const listItems = document.querySelectorAll('.fixed-nav .list');
    const indicator = document.getElementById('nav-indicator');

    function moveIndicator(element) {
        if (!indicator || !element) return;
        const position = element.offsetLeft;
        const offset = (element.offsetWidth - indicator.offsetWidth) / 2;
        indicator.style.transform = `translateX(${position + offset}px) translateY(-50%)`;
    }

    // Desactiva todos los 'active' y luego activa el correcto
    listItems.forEach(li => li.classList.remove('active'));
    
    let activeItem = Array.from(listItems).find(item => item.dataset.page === currentPage);
    
    if (activeItem) {
        activeItem.classList.add('active');
        // Usamos un pequeño retraso para asegurar que el navegador haya calculado las posiciones
        setTimeout(() => {
            moveIndicator(activeItem);
        }, 100);
    }
});