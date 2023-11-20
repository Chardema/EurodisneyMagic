import { useState, useEffect } from 'react';
import axios from 'axios';

const useParkHours = () => {
    const [parkHours, setParkHours] = useState({ disneyland: null, studio: null });

    useEffect(() => {
        const fetchParkHours = async () => {
            try {
                // Disneyland Park
                const disneylandResponse = await axios.get('https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/schedule');
                // Studio Park
                const studioResponse = await axios.get('https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/schedule');

                setParkHours({
                    disneyland: disneylandResponse.data,
                    studio: studioResponse.data
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des horaires des parcs :", error);
            }
        };

        fetchParkHours();
    }, []);

    return parkHours;
}

export default useParkHours;
