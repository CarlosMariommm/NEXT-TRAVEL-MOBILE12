document.addEventListener('DOMContentLoaded', () => {
    const listItems = document.querySelectorAll('.navigation .list');
    const indicator = document.querySelector('.navigation .indicator');
    const currentPage = window.location.pathname.split('/').pop();

    function moveIndicator(element) {
        if (!indicator || !element) return;
        
        // La posición se calcula como el índice del elemento por su ancho (70px)
        const index = Array.from(listItems).indexOf(element);
        indicator.style.transform = `translateX(calc(${index * 70}px))`;
    }

    // Marca el item activo basado en la URL actual
    let activeItem = null;
    listItems.forEach(item => {
        item.classList.remove('active'); // Limpia la clase 'active' por si acaso
        if (item.dataset.page === currentPage) {
            item.classList.add('active');
            activeItem = item;
        }
    });

    // Mueve el indicador a la posición inicial al cargar la página
    if (activeItem) {
        // Usamos un pequeño delay para asegurar que el DOM esté completamente renderizado
        setTimeout(() => moveIndicator(activeItem), 100);
    }

    // Añade los event listeners para el clic
    listItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const link = item.querySelector('a').href;
            if (!item.classList.contains('active')) {
                e.preventDefault(); // Previene la redirección inmediata
                
                // Mueve el indicador al nuevo elemento
                moveIndicator(item);

                // Actualiza la clase 'active'
                listItems.forEach(li => li.classList.remove('active'));
                item.classList.add('active');
                
                // Espera a que termine la animación antes de cambiar de página
                setTimeout(() => {
                    window.location.href = link;
                }, 500); // 500ms coincide con la transición del CSS
            }
        });
    });
});