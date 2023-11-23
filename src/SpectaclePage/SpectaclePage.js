import React, { useState, useEffect } from 'react';
import axios from "axios";
import styles from './spectacle.module.scss';
import Navbar from "../Navbar/Navbar"; // Adaptez le chemin et le style en conséquence

const Shows = () => {
    const [showsData, setShowsData] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/shows');
            const currentDateTime = new Date();

            const filteredShowsData = response.data.filter(show => {
                // Vérifier si au moins un horaire de spectacle est encore à venir
                return show.showtimes.some(time => new Date(time.endTime) > currentDateTime);
            });

            // Limiter à 3 représentations pour chaque spectacle
            const showsDataWithLimitedShowtimes = filteredShowsData.map(show => {
                return {
                    ...show,
                    showtimes: show.showtimes.slice(0, 3)
                };
            });

            setShowsData(showsDataWithLimitedShowtimes);
            setLastUpdate(currentDateTime);
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <Navbar />
            <div className={styles.container}>
                <h1>Spectacles prévu aujourd'hui</h1>
                {lastUpdate && <p className={styles.lastUpdate}>Dernière mise à jour : {lastUpdate.toLocaleTimeString()}</p>}
                <div className={styles.showsList}>
                    {showsData.length > 0 ? (
                        showsData.map((show) => (
                            <div key={show.id} className={styles.card}>
                                <h3 className={styles.showName}>{show.name}</h3>
                                <p className={styles.showStatus}>{show.status}</p>
                                <ul className={styles.showtimes}>
                                    {show.showtimes.map((time, index) => (
                                        <li key={index}>
                                            {new Date(time.startTime).toLocaleTimeString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>Aucun spectacle disponible pour le moment.</p>
                    )}
                </div>
            </div>
        </div>
    )
};

export default Shows;
