document.addEventListener('DOMContentLoaded', () => {
    const listItems = document.querySelectorAll('.fixed-nav .list');
    const indicator = document.getElementById('nav-indicator');
    const currentPage = window.location.pathname.split('/').pop();

    function moveIndicator(element) {
        if (!element) return;
        const position = element.offsetLeft;
        const offset = (element.offsetWidth - indicator.offsetWidth) / 2;
        indicator.style.transform = `translateX(${position + offset}px) translateY(-50%)`;
    }

    let activeItem = null;
    listItems.forEach(item => {
        if (item.dataset.page === currentPage) {
            item.classList.add('active');
            activeItem = item;
        }
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const link = item.querySelector('a').href;
            if (item.classList.contains('active')) return;

            listItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            moveIndicator(item);

            setTimeout(() => { window.location.href = link; }, 400);
        });
    });

    // Move indicator to the active item on page load
    if (activeItem) {
        moveIndicator(activeItem);
    }
});