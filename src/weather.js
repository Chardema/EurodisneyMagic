import { useState, useEffect } from 'react';

const useWeather = () => {
    const [weather, setWeather] = useState(null);
    const API_KEY = 'e58d393ecefe611db214805b39c74a9c'; // Remplacez par votre clé API OpenWeather
    const LATITUDE = 48.8719;  // Latitude de Disneyland Paris
    const LONGITUDE = 2.7769;  // Longitude de Disneyland Paris

    useEffect(() => {
        const fetchWeather = async () => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LATITUDE}&lon=${LONGITUDE}&appid=${API_KEY}&units=metric`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                setWeather(data);
            } catch (error) {
                console.error("Erreur lors de la récupération de la météo", error);
            }
        };

        fetchWeather();
    }, []);

    return weather;
};

export default useWeather;