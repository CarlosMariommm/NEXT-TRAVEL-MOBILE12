class DescubrirService {
            constructor() {
                this.baseUrl = 'http://localhost:8080/api';
                this.endpoints = {
                    lugares: '/lugares/lugares/listar',
                    preferencias: '/usuarios/preferencias'
                };
            }

            async fetchAllTouristData() {
                try {
                    const url = `${this.baseUrl}${this.endpoints.lugares}?page=0&size=100`;
                    console.log('Fetching all places from:', url);
                    
                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
                    }

                    const data = await response.json();
                    const places = data.content || [];
                    console.log('Data received from API:', places);
                    return this.processPlacesData(places);

                } catch (error) {
                    console.error('Error fetching all tourist data:', error);
                    return this.getMockData();
                }
            }
            
            processPlacesData(places) {
                if (!places || !Array.isArray(places)) {
                    return [];
                }
                return places.map(place => ({
                    id: place.idLugar,
                    nombreLugar: place.nombreLugar || 'Lugar sin nombre',
                    descripcion: place.descripcion || 'Sin descripción disponible',
                    imagenUrl: this.validateImageUrl(place.imagenUrl), 
                    tipo: place.tipo || 'Aventura',
                }));
            }

            validateImageUrl(imageUrl) {
                if (!imageUrl || imageUrl.trim() === '') {
                    return 'https://placehold.co/800x1000/cccccc/ffffff?text=Sin+imagen';
                }
                return imageUrl;
            }

            async saveUserPreference(placeId, action) {
                console.log(`Preferencia guardada (simulado): ${action} para lugar ${placeId}`);
                return true;
            }

            getMockData() {
                console.warn("API falló. Usando datos de simulación.");
                return [
                    { id: 1, nombreLugar: "Lago de Coatepeque", descripcion: "Un hermoso lago de origen volcánico con aguas cristalinas.", tipo: "Lago", imagenUrl: "https://placehold.co/800x1000/3498db/ffffff?text=Coatepeque" },
                    { id: 2, nombreLugar: "Playa El Tunco", descripcion: "Famosa por sus olas perfectas para el surf y su vibrante vida nocturna.", tipo: "Playa", imagenUrl: "https://placehold.co/800x1000/e67e22/ffffff?text=El+Tunco" },
                    { id: 3, nombreLugar: "Ruta de las Flores", descripcion: "Recorrido pintoresco a través de pueblos coloniales y cafetales.", tipo: "Ruta", imagenUrl: "https://placehold.co/800x1000/2ecc71/ffffff?text=Ruta+Flores" },
                    { id: 4, nombreLugar: "Parque El Boquerón", descripcion: "Ubicado en la cima del volcán, ofrece una vista impresionante del cráter.", tipo: "Volcán", imagenUrl: "https://placehold.co/800x1000/9b59b6/ffffff?text=El+Boquerón" },
                    { id: 5, nombreLugar: "Suchitoto", descripcion: "Encantador pueblo con calles empedradas y arquitectura colonial.", tipo: "Pueblo", imagenUrl: "https://placehold.co/800x1000/f1c40f/ffffff?text=Suchitoto" }
                ];
            }
        }