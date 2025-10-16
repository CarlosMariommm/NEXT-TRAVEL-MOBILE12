    const API_URL = 'http://localhost:8080/api/lugares/lugares/listar?page=0&size=100';
    let allPlacesData = []; // Guardamos todos los lugares aquí

    async function fetchPlaces() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            allPlacesData = data.content || [];
            renderCards(allPlacesData); // Renderiza todas las tarjetas al inicio
        } catch (error) {
            console.error('Error fetching places:', error);
            document.getElementById('popular-cards').innerHTML = '<p class="text-red-400">No se pudieron cargar los lugares.</p>';
        }
    }

    // --- 2. LÓGICA PARA RENDERIZAR LAS TARJETAS ---
    function renderCards(places) {
        const popularContainer = document.getElementById('popular-cards');
        const recommendedContainer = document.getElementById('recommended-cards');
        
        popularContainer.innerHTML = '';
        recommendedContainer.innerHTML = '';

        // Dividimos la lista: los primeros 5 para "Populares"
        const popularPlaces = places.slice(0, 5);
        // Los siguientes 5 para "Recomendados"
        const recommendedPlaces = places.slice(5, 10);

        // Renderizar tarjetas "Populares"
        popularPlaces.forEach(place => {
            const imageUrl = (place.imagenUrl && place.imagenUrl.trim() !== '') ? place.imagenUrl : 'https://placehold.co/800x600/374151/FFFFFF?text=Sin+Imagen';
            const popularCardHTML = `
                <a href="#" class="relative block flex-shrink-0 w-4/5 h-56 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img src="${imageUrl}" class="absolute inset-0 w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end text-white">
                        <div>
                            <h3 class="text-xl font-bold line-clamp-2">${place.nombreLugar}</h3>
                            <p class="text-sm opacity-80 mt-1">${place.ubicacion}</p>
                        </div>
                        <div class="text-right flex-shrink-0 ml-2">
                            <p class="text-lg font-extrabold">$149.99</p>
                            <div class="text-yellow-400 text-xs">★★★★<span class="text-gray-300">★</span></div>
                        </div>
                    </div>
                </a>`;
            popularContainer.innerHTML += popularCardHTML;
        });

        // Renderizar tarjetas "Recomendados"
        recommendedPlaces.forEach(place => {
            const imageUrl = (place.imagenUrl && place.imagenUrl.trim() !== '') ? place.imagenUrl : 'https://placehold.co/800x600/374151/FFFFFF?text=Sin+Imagen';
            const recommendedCardHTML = `
                <a href="#" class="block bg-white rounded-2xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <div class="flex items-center p-4">
                        <img src="${imageUrl}" class="w-20 h-20 rounded-xl object-cover">
                        <div class="ml-4 overflow-hidden">
                            <h3 class="font-bold text-lg line-clamp-2">${place.nombreLugar}</h3>
                            <p class="text-sm text-gray-500">${place.ubicacion}</p>
                        </div>
                    </div>
                </a>`;
            recommendedContainer.innerHTML += recommendedCardHTML;
        });
    }
    
    // --- 3. LÓGICA PARA EL FILTRO DE BÚSQUEDA ---
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredPlaces = allPlacesData.filter(place => 
            place.nombreLugar.toLowerCase().includes(query) || 
            place.ubicacion.toLowerCase().includes(query)
        );
        renderCards(filteredPlaces);
    });

    // --- 4. SCRIPT PARA EL INDICADOR DE NAVEGACIÓN ---
    document.addEventListener('DOMContentLoaded', () => {
        fetchPlaces(); // Llama a la API cuando la página cargue

        const listItems = document.querySelectorAll('.fixed-nav .list');
        const indicator = document.getElementById('nav-indicator');
        const currentPage = 'planes.html';

        function moveIndicator(element) {
            if (!indicator || !element) return;
            const position = element.offsetLeft;
            const offset = (element.offsetWidth - indicator.offsetWidth) / 2;
            indicator.style.transform = `translateX(${position + offset}px) translateY(-50%)`;
        }

        let activeItem = Array.from(listItems).find(item => item.dataset.page === currentPage);
        if(activeItem) {
            setTimeout(() => { moveIndicator(activeItem); }, 100);
        }
    });