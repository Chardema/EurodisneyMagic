import { useState, useEffect } from 'react';
import axios from 'axios';

const useParkHours = () => {
    const [parkHours, setParkHours] = useState(null);

    useEffect(() => {
        const fetchParkHours = async () => {
            try {
                const response = await axios.get('https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/schedule');
                setParkHours(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des horaires du parc :", error);
            }
        };

        fetchParkHours();
    }, []);

    return parkHours;
}

export default useParkHours;
