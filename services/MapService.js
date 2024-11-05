const axios = require('axios');

class MapService {
    constructor() {
        this.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
    }

    async geocodeAddress(direccion) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/geocode/json`,
                {
                    params: {
                        address: direccion,
                        key: this.googleMapsKey
                    }
                }
            );

            if (response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                return {
                    lat: location.lat,
                    lng: location.lng,
                    direccionFormateada: response.data.results[0].formatted_address
                };
            }
            return null;
        } catch (error) {
            console.error('Error en geocoding:', error);
            throw new Error('Error al obtener coordenadas');
        }
    }

    async getPlacesNearby(lat, lng, tipo = 'government') {
        try {
            const response = await axios.get(
                `${this.baseUrl}/place/nearbysearch/json`,
                {
                    params: {
                        location: `${lat},${lng}`,
                        radius: 5000,
                        type: tipo,
                        key: this.googleMapsKey
                    }
                }
            );

            return response.data.results.map(place => ({
                nombre: place.name,
                direccion: place.vicinity,
                ubicacion: place.geometry.location,
                rating: place.rating,
                tipos: place.types
            }));
        } catch (error) {
            console.error('Error en búsqueda de lugares:', error);
            throw new Error('Error al buscar lugares cercanos');
        }
    }

    async calculateRoute(origen, destino) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/directions/json`,
                {
                    params: {
                        origin: origen,
                        destination: destino,
                        mode: 'driving',
                        key: this.googleMapsKey
                    }
                }
            );

            if (response.data.routes.length > 0) {
                const route = response.data.routes[0];
                return {
                    distancia: route.legs[0].distance.text,
                    duracion: route.legs[0].duration.text,
                    pasos: route.legs[0].steps.map(step => ({
                        instruccion: step.html_instructions,
                        distancia: step.distance.text
                    })),
                    polyline: route.overview_polyline.points
                };
            }
            return null;
        } catch (error) {
            console.error('Error al calcular ruta:', error);
            throw new Error('Error al calcular la ruta');
        }
    }
} 