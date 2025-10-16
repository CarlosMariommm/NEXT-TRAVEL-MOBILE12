const filterSelect = document.querySelector('#filter-select');
const containerFilters = document.querySelectorAll('.container-filter');

// Comprueba si el selector de filtro existe en la página antes de añadir el evento
if (filterSelect) {
    filterSelect.addEventListener('change', e => {
        const selectedValue = e.target.value;

        containerFilters.forEach(containerFilter =>
            containerFilter.classList.remove('active')
        );

        if (selectedValue === 'all') {
            containerFilters.forEach(containerFilter =>
                containerFilter.classList.add('active')
            );
        }

        const matchingFilter = document.querySelector(
            `.container-filter[data-filter="${selectedValue}"]`
        );

        if (matchingFilter) {
            matchingFilter.classList.add('active');
        }
    });
}
