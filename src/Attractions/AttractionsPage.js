import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import styles from './attractions.module.scss'
import {formatDate} from "../utils";
import {
    setRawRideData,
    setFilteredRideData,
    setSearchTerm
} from '../redux/actions'; // Assurez-vous que le chemin est correct
import 'slick-carousel/slick/slick.css';
import {useNavigate} from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from './../Navbar/Navbar'; // Assurez-vous que le chemin est correct
import useInterval from './../useInterval'; // Assurez-vous que le chemin est correct
import './attractions.module.scss'; // Assurez-vous que le chemin est correct

// Fonction pour importer les images dynamiquement
const importImage = (imageName) => {
    try {
        return require(`./../img/${imageName}`);
    } catch (err) {
        console.error(err);
        // Retourne une image par défaut en cas d'erreur
        return require(`./../img/default.jpg`);
    }
};
const formatImageName = (name) => {
    return name
            .replace(/®/g, '') // Supprime le symbole ®
            .replace(/™/g, '') // Supprime le symbole ™
            .replace(/:/g, '') // Supprime les deux-points
            .replace(/é/g, 'e') // Remplace é par e
            .replace(/è/g, 'e') // Remplace è par e
            .replace(/'/g, '') // Remplace è par e
            // Ajoutez ici d'autres remplacements si nécessaire
            .replace(/[^a-zA-Z0-9]/g, '') // Supprime les autres caractères non alphanumériques
        + '.jpg';
};

// Liste des noms d'attractions
const attractionNames = [
    'Disneyland Railroad Discoveryland Station',
    'Disneyland Railroad Fantasyland Station',
    'Disneyland Railroad Main Street Station',
    'Disneyland Railroad',
    'Orbitron®',
    'Meet Mickey Mouse',
    'Frontierland Playground',
    'Disneyland Railroad Frontierland Depot',
    'Pirate Galleon',
    'Indiana Jones™ and the Temple of Peril',
    'La Cabane des Robinson',
    'Big Thunder Mountain',
    "Mad Hatter's Tea Cups",
    'Les Voyages de Pinocchio',
    'Casey Jr. – le Petit Train du Cirque',
    'Phantom Manor',
    'Star Wars Hyperspace Mountain',
    'Star Tours: The Adventures Continue*',
    'Thunder Mesa Riverboat Landing',
    "Alice's Curious Labyrinth",
    "Buzz Lightyear Laser Blast",
    'Main Street Vehicles',
    "Peter Pan's Flight",
    'Princess Pavilion',
    'Dumbo the Flying Elephant',
    "Le Passage Enchanté d'Aladdin",
    'Autopia®',
    'Le Carrousel de Lancelot ',
    'Les Mystères du Nautilus',
    'La Tanière du Dragon',
    "Rustler Roundup Shootin' Gallery",
    'Adventure Isle',
    'Welcome to Starport: A Star Wars Encounter',
    "Blanche-Neige et les Sept Nains®",
    "Mickey’s PhilharMagic",
    'Pirates of the Caribbean',
    '"it\'s a small world"',
    "Le Pays des Contes de Fées",
    "Pirates' Beach"
];
const attractionImages = attractionNames.reduce((acc, name) => {
    const imageName = formatImageName(name);
    acc[name] = importImage(imageName);
    return acc;
}, {});

const Attractions = () => {
    const dispatch = useDispatch();
    const { rawRideData, filteredRideData, searchTerm } = useSelector(state => state);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get('https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live');
            const rideTimes = response.data;

            setLastUpdate(new Date()); // Mettre à jour lastUpdate à chaque appel réussi

            if (Array.isArray(rideTimes.liveData)) {
                updatePreviousWaitTimes(rideTimes.liveData);
                dispatch(setRawRideData(rideTimes.liveData));
            } else {
                dispatch(setRawRideData([]));
            }
        } catch (error) {
            console.error(error);
            setLastUpdate(new Date()); // Mettre à jour lastUpdate même en cas d'erreur
        }
        setIsDataLoaded(true);
    }, [dispatch, previousWaitTimes]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useInterval(() => {
        fetchData();
    }, 60000);

    useEffect(() => {
        const filteredAttractions = rawRideData
            .filter(ride => ride.entityType !== 'SHOW')
            .filter(ride => ride.name.toLowerCase().includes(searchTerm.toLowerCase()));

        dispatch(setFilteredRideData(filteredAttractions));
    }, [rawRideData, searchTerm, dispatch]);

    const handleSearchChange = useCallback((event) => {
        dispatch(setSearchTerm(event.target.value));
    }, [dispatch]);

    const allRidesClosed = filteredRideData.every(ride => ride.status === 'CLOSED');

    const updatePreviousWaitTimes = (newData) => {
        const newPreviousWaitTimes = {};
        newData.forEach(ride => {
            const standbyQueue = ride.queue?.STANDBY;
            // Utilisez la valeur de waitTime seulement si standbyQueue est défini
            const currentWaitTime = standbyQueue ? standbyQueue.waitTime : null;
            // Stockez le dernier temps d'attente connu, ou null si non disponible
            newPreviousWaitTimes[ride.id] = (previousWaitTimes[ride.id] !== undefined) ? previousWaitTimes[ride.id] : currentWaitTime;
        });
        setPreviousWaitTimes(newPreviousWaitTimes);
    };


    return (
        <div>
            <Navbar />
            <div className={styles.container}>
                <p className={styles.lastUpdate}>
                    {lastUpdate ? `Dernière mise à jour : ${formatDate(lastUpdate)}` : 'Aucune mise à jour récente'}
                </p>
                <input
                    type="text"
                    placeholder="Rechercher une attraction"
                    className={styles.searchAttraction}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {!allRidesClosed && (
                    <div className={styles.attractionsList}>
                        {filteredRideData.length > 0 ? (
                            filteredRideData.map((ride) => {
                                const standbyQueue = ride.queue?.STANDBY;
                                const currentWaitTime = standbyQueue ? standbyQueue.waitTime : null;
                                const isIncreased = ride.queue.STANDBY.waitTime > (previousWaitTimes[ride.id] ?? ride.queue.STANDBY.waitTime);
                                const isDecreased = ride.queue.STANDBY.waitTime < (previousWaitTimes[ride.id] ?? ride.queue.STANDBY.waitTime);
                                const waitTimeColor = ride.queue.STANDBY.waitTime >= 35 ? 'red' : 'green';

                                return (
                                    <div key={ride.id} className={styles.card}>
                                        <img className={styles.imgAttraction} src={attractionImages[ride.name]} alt={ride.name} />
                                        <div className={styles.waitTime} style={{ backgroundColor: waitTimeColor }}>
                                            {ride.status === 'CLOSED' ? 'Fermée' : `${currentWaitTime ?? '0'}min`}
                                            {isIncreased && <span>🔺</span>} {/* Remplacer par une icône/image de flèche vers le haut */}
                                            {isDecreased && <span>🔻</span>} {/* Remplacer par une icône/image de flèche vers le bas */}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>Aucune attraction correspondant à la recherche.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attractions;
