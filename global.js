// * HEADER
const btnBars = document.querySelector('.btn-bars');
const menuResponsive = document.querySelector('.menu-responsive');
const btnClose = document.querySelector('.btn-close');

// Comprueba si el botón de la barra de menú existe antes de añadir el evento
if (btnBars) {
    btnBars.addEventListener('click', () => {
        if (menuResponsive) {
            menuResponsive.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        }
    });
}

// Comprueba si el botón de cerrar existe antes de añadir el evento
if (btnClose) {
    btnClose.addEventListener('click', () => {
        if (menuResponsive) {
            menuResponsive.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}

