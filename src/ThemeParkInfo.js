import React, { useEffect} from 'react';
import axios from 'axios';

const ThemeParkInfo = ({ setRawRideData }) => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live'
                );
                const rideTimes = response.data;

                if (Array.isArray(rideTimes.liveData)) {
                    setRawRideData(rideTimes.liveData);
                } else {
                    setRawRideData([]);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [setRawRideData]);

    // Vous pouvez également retourner quelque chose ici si nécessaire
    return null;
};

export default ThemeParkInfo;
