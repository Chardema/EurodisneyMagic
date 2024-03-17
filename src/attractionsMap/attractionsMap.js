import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import styles from  './attractionsMap.module.scss';
// Importez simplify si vous utilisez une fonction de simplification des points
// import { simplify } from 'simplify-js';

const AttractionsMap = ({ attractions, getWaitTimeColor }) => {
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [route, setRoute] = useState(null);
    const [userLocation, setUserLocation] = useState([48.872, 2.775]); // Coordonnées par défaut de Paris
    const [errorMessage, setErrorMessage] = useState('');
    const [routeDuration, setRouteDuration] = useState(null);

    useEffect(() => {
        let watchId;
        if ("geolocation" in navigator) {
            // Commence à écouter les changements de position
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    // Si une attraction est sélectionnée, recalculez l'itinéraire vers elle
                    if (selectedAttraction) {
                        calculateRoute([latitude, longitude], selectedAttraction.coordinates);
                    }
                },
                (error) => {
                    console.error("Erreur lors de l'accès à la localisation :", error);
                },
                {
                    enableHighAccuracy: true, // Utilisez la localisation haute précision si disponible
                    maximumAge: 0, // Accepte seulement les données de localisation fraîches
                    timeout: 5000, // Temps d'attente maximum pour obtenir la localisation
                }
            );
        } else {
            console.log("La géolocalisation n'est pas prise en charge par ce navigateur.");
        }

        // Nettoyage lors du démontage du composant
        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [selectedAttraction]); // Ajoutez `selectedAttraction` comme dépendance si vous voulez recalculer l'itinéraire lorsque l'attraction sélectionnée change


    const handleMarkerClick = (attraction) => {
        setSelectedAttraction(attraction);
        if (userLocation && attraction.coordinates) {
            calculateRoute(userLocation, attraction.coordinates);
        }
    };
    const handleRequestRoute = (destinationCoordinates) => {
        if (userLocation && destinationCoordinates) {
            calculateRoute(userLocation, destinationCoordinates);
        } else {
            alert("Localisation de l'utilisateur non disponible. Veuillez réessayer.");
        }
    };


    const calculateRoute = async (startCoordinates, destinationCoordinates) => {
        try {
            const apiKey = '5b3ce3597851110001cf62483f9fb5d6194f46139e925f786fde38a0';
            const response = await axios.get(`https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${startCoordinates[1]},${startCoordinates[0]}&end=${destinationCoordinates[1]},${destinationCoordinates[0]}`);
            if (response.data.features && response.data.features.length > 0) {
                const coordinates = response.data.features[0].geometry.coordinates;
                const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
                setRoute({geometry: {coordinates: latLngs}});

                // Mettez à jour la durée de l'itinéraire ici
                const durationSeconds = response.data.features[0].properties.segments.reduce((total, segment) => total + segment.duration, 0);
                const durationMinutes = Math.round(durationSeconds / 60); // Convertissez en minutes
                setRouteDuration(durationMinutes);

                setErrorMessage('');
            } else {
                setErrorMessage("Aucun itinéraire trouvé.");
                setRoute(null);
                setRouteDuration(null);
            }
        } catch (error) {
            console.error('Erreur lors du calcul de l’itinéraire :', error);
            setErrorMessage("Erreur lors du calcul de l'itinéraire.");
            setRoute(null);
            setRouteDuration(null);
        }
    };


    return (
        <MapContainer center={[48.872, 2.775]} zoom={15} style={{ height: '80vh', width: '100vw' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {attractions.map((attraction) => (
                attraction.coordinates && Array.isArray(attraction.coordinates) && attraction.coordinates.length === 2 ? (
                    <Marker
                        key={attraction.id}
                        position={attraction.coordinates}
                        icon={L.divIcon({
                            className: 'custom-marker-icon',
                            html: `
        <div style="padding: 15px 15px; display: flex; justify-content: center; background-color: rgba(255, 255, 255, 0.9); border-radius: 5px; text-align: center;">
            ${attraction.waitTime !== null ? `${attraction.waitTime} min` : 'Indispo'}
        </div>
    `
                        })}

                    >
                        <Popup>
                            <div>
                                {attraction.name}
                                <br />
                                {selectedAttraction && selectedAttraction.id === attraction.id && routeDuration && (
                                    <div>
                                        Durée à pied : {routeDuration} min
                                    </div>
                                )}
                                <button className="go-button" onClick={() => handleRequestRoute(attraction.coordinates)}>Go</button>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}

            {route && route.geometry && Array.isArray(route.geometry.coordinates) && (
                <Polyline
                    key={Date.now()} // Utilisez une valeur unique ici pour forcer le re-rendu
                    positions={route.geometry.coordinates}
                    color="blue"
                    weight={5}
                    opacity={0.7}
                />
            )}
        </MapContainer>
    );
};

export default AttractionsMap;
