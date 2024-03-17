import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import {useEffect} from "react";
import L from 'leaflet';


const AttractionsMap = ({ attractions, getWaitTimeColor }) => {
    const [selectedAttraction, setSelectedAttraction] = useState(null);
    const [route, setRoute] = useState(null);
    const [userLocation, setUserLocation] = useState([48.872, 2.775]); // Coordonnées par défaut de Paris


    const handleMarkerClick = (attraction) => {
        setSelectedAttraction(attraction);
        if (userLocation && attraction.coordinates) {
            calculateRoute(userLocation, attraction.coordinates);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                },
                (error) => {
                    console.error("Erreur lors de l'accès à la localisation :", error);
                    // Gérez l'erreur de localisation ici, par exemple en définissant une localisation par défaut
                }
            );
        } else {
            console.log("La géolocalisation n'est pas prise en charge par ce navigateur.");
            // Vous pouvez définir ici une localisation par défaut si nécessaire
        }
    }, []);

    const handleRequestRoute = (destinationCoordinates) => {
        if (userLocation) {
            calculateRoute(userLocation, destinationCoordinates);
        } else {
            alert("Localisation de l'utilisateur non disponible. Veuillez réessayer.");
        }
    };

    const calculateRoute = async (startCoordinates, destinationCoordinates) => {
        try {
            const apiKey = '5b3ce3597851110001cf62483f9fb5d6194f46139e925f786fde38a0'; // Remplacez par votre clé API OpenRouteService
            const response = await axios.get(`https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf62483f9fb5d6194f46139e925f786fde38a0&start=2.775,48.872&end=2.7742255292556184,48.870362312110764`);
            const routeData = response.data;
            setRoute(routeData.routes[0]);
        } catch (error) {
            console.error('Erreur lors du calcul de l’itinéraire :', error);
        }
    };

    return (
        <MapContainer center={[48.872, 2.775]} zoom={15} style={{ height: '80vh', width: '100vw' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {attractions.map((attraction) => (
                attraction.coordinates && Array.isArray(attraction.coordinates) && attraction.coordinates.length === 2 ? (
                    <Marker key={attraction.id} position={attraction.coordinates} eventHandlers={{ click: () => handleMarkerClick(attraction) }}>
                        <Popup>{attraction.name}</Popup>
                    </Marker>
                ) : null
            ))}
            {attractions.map((attraction) => (
                attraction.coordinates && Array.isArray(attraction.coordinates) && attraction.coordinates.length === 2 ? (
                    <Marker
                        key={attraction.id}
                        position={attraction.coordinates}
                        icon={L.divIcon({
                            className: 'custom-icon', // Assurez-vous que cette classe est définie dans votre CSS
                            html: getWaitTimeColor(attraction.waitTime), // Utilisez votre fonction existante pour obtenir le HTML avec le temps d'attente
                        })}
                        eventHandlers={{ click: () => handleMarkerClick(attraction) }}>
                        <Popup>
                            <div>
                                {attraction.name}
                                <br />
                                <button onClick={(e) => {
                                    L.DomEvent.stopPropagation(e);
                                    handleRequestRoute(attraction.coordinates);
                                }}>
                                    Je m'y rends
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
            {route && route.geometry && Array.isArray(route.geometry.coordinates) && (
                <Polyline
                    positions={route.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                    color="blue"
                    weight={5}
                    opacity={0.7}
                />
            )}
        </MapContainer>
    );
};

export default AttractionsMap;
