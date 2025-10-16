document.addEventListener('DOMContentLoaded', () => {

    class DescubrirService {
        constructor() {
            this.baseUrl = 'http://localhost:8080/api';
            this.endpoints = { lugares: '/lugares/lugares/listar' };
        }
        async fetchAllTouristData() {
            try {
                const url = `${this.baseUrl}${this.endpoints.lugares}?page=0&size=100`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                const data = await response.json();
                return data.content.map(place => ({
                    id: place.idLugar, name: place.nombreLugar || 'Lugar sin nombre',
                    description: place.descripcion || 'Sin descripción disponible',
                    image: (!place.imagenUrl || place.imagenUrl.trim() === '') ? 'https://placehold.co/800x1000/cccccc/ffffff?text=Sin+imagen' : place.imagenUrl,
                    tags: place.tipo ? place.tipo.split(',') : ['General']
                }));
            } catch (error) {
                console.error('Error al obtener los datos de los lugares:', error);
                return []; // En caso de error, devuelve una lista vacía para no bloquear la UI.
            }
        }
    }

    class DescubrirController {
        constructor() {
            this.service = new DescubrirService();
            this.cardStack = document.getElementById('card-stack');
            this.nopeButton = document.getElementById('nope-button');
            this.likeButton = document.getElementById('like-button');
            this.noMoreCardsMessage = document.getElementById('no-more-cards');
            this.actionButtons = document.getElementById('action-buttons');
            this.skeletonLoader = document.getElementById('skeleton-loader');
            this.cardContainer = document.getElementById('card-container');

            // Lógica corregida para el modo oscuro
            this.isDarkMode = document.documentElement.classList.contains('dark');
            const lightColors = ['#F0F2F5', '#EBF4FA', '#F0F5EE', '#FDF8E8', '#F8F2FA'];
            const darkColors = ['#1A1A1A', '#1C252E', '#1E2B24', '#2B291D', '#2A1F2E'];
            this.backgroundColors = this.isDarkMode ? darkColors : lightColors;
            
            this.colorIndex = 0; this.allPlaces = []; this.originalPlaces = [];
            this.currentCard = null; this.isDragging = false; this.startX = 0;
            this.currentX = 0; this.screenWidth = window.innerWidth;
        }

        async init() {
            console.log("Iniciando controlador...");
            this.skeletonLoader.classList.remove('hidden');
            this.cardContainer.classList.add('hidden');
            this.actionButtons.classList.add('hidden');

            try {
                this.allPlaces = await this.service.fetchAllTouristData();
                this.originalPlaces = [...this.allPlaces];
                console.log("Datos recibidos:", this.allPlaces);

                if (this.allPlaces.length > 0) {
                    console.log("Mostrando tarjetas...");
                    this.cardContainer.classList.remove('hidden');
                    this.actionButtons.classList.remove('hidden');
                    this.loadCards();
                    this.setupEventListeners();
                    this.setupFilterButtons();
                } else {
                    console.log("No se encontraron lugares.");
                    this.showNoMoreCardsMessage();
                }
            } catch (error) {
                console.error("Fallo crítico en la inicialización:", error);
                this.showNoMoreCardsMessage("Error al cargar los destinos.");
            } finally {
                // **GARANTIZA** que el esqueleto siempre se oculte
                this.skeletonLoader.classList.add('hidden');
            }
        }
        
        setupFilterButtons() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => {
                        btn.classList.remove('bg-blue-600', 'text-white');
                        btn.classList.add('bg-gray-200', 'dark:bg-gray-700');
                    });
                    button.classList.add('bg-blue-600', 'text-white');
                    this.applyFilter(button.dataset.filter);
                });
            });
        }

        applyFilter(filter) {
            this.allPlaces = (filter === 'all') ? [...this.originalPlaces] : this.originalPlaces.filter(place => place.tags.includes(filter));
            this.loadCards();
        }

        createCard(place) {
            const card = document.createElement('div');
            card.className = 'tour-card absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden';
            card.dataset.place = JSON.stringify(place);
            card.innerHTML = `<div class="absolute inset-0"><img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div></div>
                <div class="absolute bottom-0 left-0 p-6 text-white w-full"><h2 class="text-3xl font-bold">${place.name}</h2>
                <p class="mt-2 text-gray-200 text-base line-clamp-2">${place.description}</p>
                <div class="flex flex-wrap gap-2 mt-4">${place.tags.map(tag => `<span class="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">${tag.trim()}</span>`).join('')}</div></div>`;
            return card;
        }

        loadCards() {
            this.cardStack.innerHTML = '';
            if (this.allPlaces.length === 0) {
                this.showNoMoreCardsMessage('No hay lugares para esta categoría.');
            } else {
                this.noMoreCardsMessage.classList.add('hidden');
                this.actionButtons.classList.remove('hidden');
                this.allPlaces.slice().reverse().forEach(place => this.cardStack.appendChild(this.createCard(place)));
                this.setupTopCard();
            }
        }

        setupTopCard() {
            const cards = this.cardStack.querySelectorAll('.tour-card:not(.removed)');
            if (cards.length === 0) {
                this.showNoMoreCardsMessage();
                document.body.style.backgroundColor = this.isDarkMode ? '#121212' : '#F3F4F6';
                return;
            }
            document.body.style.backgroundColor = this.backgroundColors[this.colorIndex % this.backgroundColors.length];
            this.colorIndex++;
            this.currentCard = cards[cards.length - 1];
            this.currentCard.addEventListener('mousedown', e => this.startDrag(e));
            this.currentCard.addEventListener('touchstart', e => this.startDrag(e), { passive: true });
        }
        
        showNoMoreCardsMessage(message = '¡Has visto todo por ahora!') {
            if (this.noMoreCardsMessage) {
                this.noMoreCardsMessage.querySelector('p').textContent = message;
                this.noMoreCardsMessage.classList.remove('hidden');
            }
            if (this.actionButtons) this.actionButtons.classList.add('hidden');
        }

        startDrag(e) {
            if (!this.currentCard) return; this.isDragging = true; this.currentCard.style.transition = 'none';
            this.startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            const onDrag = e => this.onDrag(e); const endDrag = () => this.endDrag(onDrag, endDrag);
            document.addEventListener('mousemove', onDrag); document.addEventListener('touchmove', onDrag, { passive: true });
            document.addEventListener('mouseup', endDrag); document.addEventListener('touchend', endDrag);
        }

        onDrag(e) {
            if (!this.isDragging) return; this.currentX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            const deltaX = this.currentX - this.startX;
            this.currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
        }

        endDrag(onDrag, endDrag) {
            if (!this.isDragging) return; this.isDragging = false;
            document.removeEventListener('mousemove', onDrag); document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', endDrag); document.removeEventListener('touchend', endDrag);
            const deltaX = this.currentX - this.startX;
            if (Math.abs(deltaX) > this.screenWidth / 4) { this.swipeCard(deltaX > 0 ? 1 : -1); } 
            else { this.currentCard.style.transition = 'transform 0.3s ease'; this.currentCard.style.transform = ''; }
        }

        swipeCard(direction) {
            if (!this.currentCard) return;
            if (direction === 1) { this.handleLike(JSON.parse(this.currentCard.dataset.place)); }
            const endX = this.screenWidth * 1.2 * direction;
            this.currentCard.style.transition = 'transform 0.4s ease-out';
            this.currentCard.style.transform = `translateX(${endX}px) rotate(${45 * direction}deg)`;
            this.currentCard.classList.add('removed');
            setTimeout(() => { this.currentCard.remove(); this.setupTopCard(); }, 400);
        }

        handleLike(placeData) {
            if (!placeData || !placeData.id) return; const placeId = placeData.id;
            let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
            if (!favorites.includes(placeId)) {
                favorites.push(placeId); localStorage.setItem('userFavorites', JSON.stringify(favorites));
                console.log(`Guardado en favoritos: ${placeData.name} (ID: ${placeId})`);
            }
        }

        setupEventListeners() {
            this.nopeButton.addEventListener('click', () => this.swipeCard(-1));
            this.likeButton.addEventListener('click', () => {
                this.likeButton.classList.add('like-button-pulse');
                this.swipeCard(1);
                setTimeout(() => this.likeButton.classList.remove('like-button-pulse'), 500);
            });
        }
    }

    new DescubrirController().init();

});