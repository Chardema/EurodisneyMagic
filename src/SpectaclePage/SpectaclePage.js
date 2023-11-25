import React, { useState, useEffect } from 'react';
import axios from "axios";
import styles from './spectacle.module.scss';
import Navbar from "../Navbar/Navbar";
import {formatImageName, importImage, useWindowWidth} from "../utils";
import BottomNav from "../mobileNavbar/mobileNavbar"; // Adaptez le chemin et le style en conséquence


const showsNames = [
    "Mickey's Dazzling Christmas Parade!",
    'Let’s Sing Christmas!',
    'Disney Dreams Nighttime Extravaganza',
    'The Lion King: Rhythms of the Pride Lands',
    'The Disney Junior Dream Factory',
    'Frozen: A Musical Invitation',
    'Stitch Live!',
    'Mickey and the Magician ',
    'TOGETHER: a Pixar Musical Adventure',
    'Avengers: Power the Night',
    'Disney Stars on Parade ',
    'Magic Over Disney: a nighttime show to the rhythm of Disney and Pixar Music',
    'Guardians of the Galaxy: Dance Challenge! '
];
const attractionShows = showsNames.reduce((acc, name) => {
    const imageName = formatImageName(name);
    acc[name] = importImage(imageName);
    return acc;
}, {});
const Shows = () => {
    const [showsData, setShowsData] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const width = useWindowWidth()

    const fetchData = async () => {
        try {
            const response = await axios.get('https://eurojourney.azurewebsites.net/api/shows');
            const currentDateTime = new Date();

            const showsDataWithNextShowtime = response.data
                .map(show => {
                    // Trouver le prochain horaire de spectacle
                    const nextShowtime = show.showtimes
                        .filter(time => new Date(time.startTime) > currentDateTime)
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

                    return {
                        ...show,
                        showtimes: nextShowtime ? [nextShowtime] : []
                    };
                })
                .filter(show => show.showtimes.length > 0); // Exclure les spectacles sans horaires futurs

            setShowsData(showsDataWithNextShowtime);
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
            {width > 768 && <Navbar />}
            <div className={styles.container}>
                <h1>Spectacles prévu aujourd'hui</h1>
                <p className={styles.info}>Pour plus de précision, n'hésitez pas à consultez l'application Disneyland Paris officielle </p>
                {lastUpdate && <p className={styles.lastUpdate}>Dernière mise à jour : {lastUpdate.toLocaleTimeString()}</p>}
                <div className={styles.showsList}>
                    {showsData.length > 0 ? (
                        showsData.map((show) => (
                            <div key={show.id} className={styles.card}>
                                <img className={styles.showImage} src={attractionShows[show.name]} alt={show.name} />
                                <h3 className={styles.showName}>{show.name}</h3>
                                {show.showtimes.length > 0 ? (
                                    <h2 className={styles.showStatus}>Prochaine représentation : {new Date(show.showtimes[0].startTime).toLocaleTimeString()}</h2>
                                ) : (
                                    <p className={styles.noShowtimes}>Aucune représentation prévue.</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Aucun spectacle disponible pour le moment.</p>
                    )}
                </div>
            </div>
            <BottomNav />
        </div>
    )
};

export default Shows;
