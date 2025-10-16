document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // SERVICIO DE DATOS (Se conecta a tu API)
    // ===================================================================
    class DescubrirService {
        constructor() {
            this.baseUrl = 'http://localhost:8080/api';
            this.endpoints = {
                lugares: '/lugares/lugares/listar'
            };
        }

        async fetchAllTouristData() {
            try {
                const url = `${this.baseUrl}${this.endpoints.lugares}?page=0&size=100`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                const data = await response.json();
                // Procesamos los datos para que coincidan con lo que necesita la tarjeta
                return data.content.map(place => ({
                    id: place.idLugar,
                    name: place.nombreLugar || 'Lugar sin nombre',
                    description: place.descripcion || 'Sin descripción disponible',
                    image: (!place.imagenUrl || place.imagenUrl.trim() === '') 
                        ? 'https://placehold.co/800x1000/cccccc/ffffff?text=Sin+imagen'
                        : place.imagenUrl,
                    tags: place.tipo ? place.tipo.split(',') : ['General'] // Asumimos que los tags vienen del tipo
                }));
            } catch (error) {
                console.error('Error al obtener los datos de los lugares:', error);
                return []; // Devolvemos un array vacío si hay un error
            }
        }
    }

    // ===================================================================
    // CONTROLADOR DE LA VISTA (Maneja las tarjetas y la interacción)
    // ===================================================================
    class DescubrirController {
        constructor() {
            this.service = new DescubrirService();
            this.cardStack = document.getElementById('card-stack');
            this.nopeButton = document.getElementById('nope-button');
            this.likeButton = document.getElementById('like-button');
            
            // Elementos para mostrar cuando no hay más tarjetas
            this.noMoreCardsMessage = document.getElementById('no-more-cards'); 
            this.actionButtons = document.getElementById('action-buttons');

            this.allPlaces = [];
            this.currentCard = null;
            this.isDragging = false;
            this.startX = 0;
            this.currentX = 0;
            this.screenWidth = window.innerWidth;
        }

        async init() {
            this.allPlaces = await this.service.fetchAllTouristData();
            if (this.allPlaces.length > 0) {
                this.loadCards();
                this.setupEventListeners();
            } else {
                this.showNoMoreCardsMessage();
            }
        }

        /**
         * Crea el HTML de una tarjeta individual.
         */
        createCard(place) {
            const card = document.createElement('div');
            card.className = 'tour-card absolute w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden';
            // Guardamos todos los datos del lugar en el dataset para usarlos después
            card.dataset.place = JSON.stringify(place);
            card.innerHTML = `
                <div class="absolute inset-0">
                    <img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/800x1000/cccccc/ffffff?text=Imagen+no+disponible';">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>
                <div class="absolute bottom-0 left-0 p-6 text-white w-full">
                    <h2 class="text-3xl font-bold">${place.name}</h2>
                    <p class="mt-2 text-gray-200 text-base line-clamp-2">${place.description}</p>
                    <div class="flex flex-wrap gap-2 mt-4">
                        ${place.tags.map(tag => `<span class="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
                <div class="status-indicator like">Like</div>
                <div class="status-indicator nope">Nope</div>
            `;
            return card;
        }

        /**
         * Carga las tarjetas iniciales en el DOM.
         */
        loadCards() {
            // Invertimos el array para que el primer lugar sea la primera tarjeta en mostrarse
            this.allPlaces.reverse().forEach(place => {
                const card = this.createCard(place);
                this.cardStack.appendChild(card);
            });
            this.setupTopCard();
        }

        /**
         * Configura la tarjeta superior para que sea interactiva.
         */
        setupTopCard() {
            const cards = document.querySelectorAll('.tour-card:not(.removed)');
            if (cards.length === 0) {
                this.showNoMoreCardsMessage();
                return;
            }
            this.currentCard = cards[cards.length - 1];
            
            // Añadimos los listeners para el arrastre
            this.currentCard.addEventListener('mousedown', (e) => this.startDrag(e));
            this.currentCard.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
        }
        
        showNoMoreCardsMessage() {
            if (this.noMoreCardsMessage) this.noMoreCardsMessage.classList.remove('hidden');
            if (this.actionButtons) this.actionButtons.classList.add('hidden');
        }

        // --- Lógica de Arrastre (Drag & Drop) ---
        
        startDrag(e) {
            if (!this.currentCard) return;
            this.isDragging = true;
            this.currentCard.style.transition = 'none'; // Quitamos la transición para un arrastre fluido
            this.startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            
            // Listeners para mover y soltar
            document.addEventListener('mousemove', (e) => this.onDrag(e));
            document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: true });
            document.addEventListener('mouseup', () => this.endDrag());
            document.addEventListener('touchend', () => this.endDrag());
        }

        onDrag(e) {
            if (!this.isDragging || !this.currentCard) return;
            this.currentX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            const deltaX = this.currentX - this.startX;
            const rotation = deltaX * 0.1;
            this.currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
            
            // Muestra los indicadores "Like" o "Nope"
            const likeIndicator = this.currentCard.querySelector('.like');
            const nopeIndicator = this.currentCard.querySelector('.nope');
            const opacity = Math.min(Math.abs(deltaX) / (this.screenWidth / 4), 1);
            if (deltaX > 0) {
                likeIndicator.style.opacity = opacity;
                nopeIndicator.style.opacity = 0;
            } else {
                nopeIndicator.style.opacity = opacity;
                likeIndicator.style.opacity = 0;
            }
        }

        endDrag() {
            if (!this.isDragging || !this.currentCard) return;
            this.isDragging = false;
            
            // Quitamos los listeners para evitar que sigan activos
            document.removeEventListener('mousemove', (e) => this.onDrag(e));
            document.removeEventListener('touchmove', (e) => this.onDrag(e));

            const deltaX = this.currentX - this.startX;
            const decisionThreshold = this.screenWidth / 4;

            if (Math.abs(deltaX) > decisionThreshold) {
                const direction = deltaX > 0 ? 1 : -1;
                this.swipeCard(direction);
            } else {
                // Si no se deslizó lo suficiente, la tarjeta vuelve a su sitio
                this.currentCard.style.transition = 'transform 0.3s ease';
                this.currentCard.style.transform = '';
                this.currentCard.querySelector('.like').style.opacity = 0;
                this.currentCard.querySelector('.nope').style.opacity = 0;
            }
            this.startX = 0;
            this.currentX = 0;
        }

        /**
         * Anima el deslizamiento final de la tarjeta y la elimina.
         */
        swipeCard(direction) {
            if (!this.currentCard) return;
            
            // Si la dirección es 1 (like), guardamos en favoritos
            if (direction === 1) {
                const placeData = JSON.parse(this.currentCard.dataset.place);
                this.handleLike(placeData);
            }

            const endX = this.screenWidth * 1.2 * direction;
            const rotation = 45 * direction;
            this.currentCard.style.transition = 'transform 0.4s ease-out';
            this.currentCard.style.transform = `translateX(${endX}px) rotate(${rotation}deg)`;
            this.currentCard.classList.add('removed');

            setTimeout(() => {
                this.currentCard.remove();
                this.setupTopCard(); // Prepara la siguiente tarjeta
            }, 400);
        }

        /**
         * Guarda un lugar en localStorage como favorito.
         */
        handleLike(placeData) {
            if (!placeData || !placeData.id) return;

            const placeId = placeData.id;
            let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];

            if (!favorites.includes(placeId)) {
                favorites.push(placeId);
                localStorage.setItem('userFavorites', JSON.stringify(favorites));
                console.log(`Guardado en favoritos: ${placeData.name} (ID: ${placeId})`);
            }
        }

        /**
         * Configura los botones de Like y Nope.
         */
        setupEventListeners() {
            this.likeButton.addEventListener('click', () => this.swipeCard(1));
            this.nopeButton.addEventListener('click', () => this.swipeCard(-1));
        }
    }

    // Iniciar el controlador
    const controller = new DescubrirController();
    controller.init();


    // --- LÓGICA PARA LA BARRA DE NAVEGACIÓN (SE MANTIENE IGUAL) ---
    const list = document.querySelectorAll('.navigation .list');
    const indicator = document.querySelector('.indicator');

    function activeLink() {
        list.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        moveIndicator(this);
    }

    function moveIndicator(element) {
        const index = Array.from(list).indexOf(element);
        if (indicator) {
            indicator.style.transform = `translateX(calc(${index * 75}px))`;
        }
    }

    list.forEach(item => item.addEventListener('click', activeLink));

    const initialActive = document.querySelector('.navigation .list.active');
    if (initialActive) {
        moveIndicator(initialActive);
    }
});