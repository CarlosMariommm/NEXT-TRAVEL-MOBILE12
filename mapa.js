class MapService {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
    }
    async fetchAllTouristData() {
        try {
            const url = `${this.baseUrl}/lugares/lugares/listar?page=0&size=100`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.content || [];
        } catch (error) {
            console.error('Error fetching tourist data:', error);
            return [];
        }
    }
}

// --- 2. CONFIGURACIÓN E INICIALIZACIÓN DEL MAPA ---
let map;
let markers = [];
let allPlacesData = [];
const service = new MapService();
const mapStyleDark = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#ffffff"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c3e50"},{"lightness":-20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"},{"lightness":17}]}];

// Función principal que se llama desde el HTML
async function initMap() {
    const elSalvadorCenter = { lat: 13.6929, lng: -89.2182 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: elSalvadorCenter,
        zoom: 9,
        styles: mapStyleDark,
        disableDefaultUI: true
    });

    const placesFromOurApi = await service.fetchAllTouristData();
    if (placesFromOurApi.length === 0) {
        console.warn("No se recibieron datos de lugares turísticos.");
        return;
    }

    allPlacesData = await fetchGooglePopularityData(placesFromOurApi);
    allPlacesData.sort((a, b) => b.popularityScore - a.popularityScore);

    renderCards(allPlacesData);
    await renderMarkers(allPlacesData);

    if (allPlacesData.length > 0) {
        setActivePlace(allPlacesData[0].idLugar);
    }
}

// --- 3. LÓGICA DE POPULARIDAD, RENDERIZADO E INTERACCIÓN ---

async function fetchGooglePopularityData(places) {
    const placesService = new google.maps.places.PlacesService(map);
    const enrichedPlaces = [];

    for (const place of places) {
        const addressQuery = `${place.nombreLugar}, El Salvador`;
        const request = {
            query: addressQuery,
            fields: ['name', 'geometry', 'rating', 'user_ratings_total'],
        };

        try {
            const { results } = await new Promise((resolve, reject) => {
                placesService.findPlaceFromQuery(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
                        resolve({ results });
                    } else {
                        reject(new Error(status));
                    }
                });
            });

            const googleData = results[0];
            const rating = googleData.rating || 0;
            const totalRatings = googleData.user_ratings_total || 0;
            const popularityScore = rating * Math.log10(totalRatings + 1);

            enrichedPlaces.push({
                ...place,
                geometry: googleData.geometry,
                rating: rating,
                totalRatings: totalRatings,
                popularityScore: popularityScore
            });

        } catch (error) {
            console.warn(`No se pudo obtener datos de Google para "${addressQuery}": ${error.message}`);
            enrichedPlaces.push({ ...place, popularityScore: 0 });
        }
    }
    return enrichedPlaces;
}

function renderCards(places) {
    const cardsList = document.getElementById('cards-list');
    if (!cardsList) return;

    cardsList.innerHTML = '';
    places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'tour-card snap-center flex-shrink-0 w-64 bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer';
        card.dataset.id = place.idLugar;

        const imageUrl = (place.imagenUrl && place.imagenUrl.trim() !== '') ? place.imagenUrl : 'https://placehold.co/800x600/374151/FFFFFF?text=Sin+Imagen';

        card.innerHTML = `
            <img src="${imageUrl}" class="w-full h-32 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-lg truncate text-white">${place.nombreLugar}</h3>
                <p class="text-sm text-gray-400 flex items-center mt-1">
                    <i class='bx bxs-map-pin mr-1'></i>
                    ${place.ubicacion}
                </p>
            </div>`;

        card.addEventListener('click', () => setActivePlace(place.idLugar));
        cardsList.appendChild(card);
    });
}

async function renderMarkers(places) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    for (const place of places) {
        if (place.geometry && place.geometry.location) {
            const markerElement = document.createElement('img');
            markerElement.className = 'custom-marker';
            markerElement.src = (place.imagenUrl && place.imagenUrl.trim() !== '') ?
                place.imagenUrl :
                'https://placehold.co/100x100/374151/FFFFFF?text=NT';

            const marker = new AdvancedMarkerElement({
                position: place.geometry.location,
                map: map,
                title: place.nombreLugar,
                content: markerElement
            });

            marker.placeId = place.idLugar;
            marker.addListener("click", () => setActivePlace(place.idLugar));
            markers.push(marker);
        }
    }
}

function setActivePlace(placeId) {
    if (!placeId) return;

    const marker = markers.find(m => m.placeId === placeId);
    if (marker) {
        map.panTo(marker.position);
        map.setZoom(14);
    }

    const card = document.querySelector(`.tour-card[data-id='${placeId}']`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    highlightActiveElements(placeId);
}

function highlightActiveElements(placeId) {
    document.querySelectorAll('.tour-card').forEach(c => {
        c.classList.toggle('active', c.dataset.id == placeId);
    });

    markers.forEach(m => {
        const markerElement = m.content;
        const isActive = m.placeId === placeId;
        markerElement.classList.toggle('highlight', isActive);
        m.zIndex = isActive ? 1000 : 1;
    });
}