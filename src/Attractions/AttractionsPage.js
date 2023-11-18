import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import styles from './attractions.module.scss'
import {formatDate, importImage} from "../utils";
import {
    setRawRideData,
    setFilteredRideData,
    setSearchTerm
} from '../redux/actions'; // Assurez-vous que le chemin est correct
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from './../Navbar/Navbar'; // Assurez-vous que le chemin est correct
import useInterval from './../useInterval'; // Assurez-vous que le chemin est correct
import './attractions.module.scss'; // Assurez-vous que le chemin est correct

// Fonction pour importer les images dynamiquement

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
    const { rawRideData, filteredRideData, searchTerm } = useSelector((state) => state);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [showShortWaitTimesOnly, setShowShortWaitTimesOnly] = useState(false);
    const [showClosedRides, setShowClosedRides] = useState(false);


    // Simplification de la fonction de mise à jour des temps d'attente
    const updatePreviousWaitTimes = useCallback((newData) => {
        const newPreviousWaitTimes = newData.reduce((acc, ride) => {
            const currentWaitTime = ride.queue?.STANDBY?.waitTime;
            if (acc[ride.id] !== currentWaitTime) {
                acc[ride.id] = currentWaitTime;
            }
            return acc;
        }, {...previousWaitTimes});

        setPreviousWaitTimes(newPreviousWaitTimes);
        localStorage.setItem('previousWaitTimes', JSON.stringify(newPreviousWaitTimes));
    }, [previousWaitTimes]);

    // Chargement initial des temps d'attente précédents
    useEffect(() => {
        const storedPreviousWaitTimes = localStorage.getItem('previousWaitTimes');
        if (storedPreviousWaitTimes) {
            setPreviousWaitTimes(JSON.parse(storedPreviousWaitTimes));
        }
    }, []);

    // Fonction pour la récupération des données
    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/attractions');
            const rideData = response.data;

            setLastUpdate(new Date());
            updatePreviousWaitTimes(rideData || []);
            dispatch(setRawRideData(rideData || []));
        } catch (error) {
            console.error(error);
            setLastUpdate(new Date());
        } finally {
            setIsDataLoaded(true);
        }
    }, [dispatch, updatePreviousWaitTimes]);


    // Exécutez fetchData immédiatement après le premier rendu
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Récupération périodique des données
    useInterval(fetchData, 60000);

    // Filtre des attractions
    useEffect(() => {
        const filteredAttractions = rawRideData
            .filter((ride) => (showClosedRides || ride.status !== 'CLOSED') && ride.entityType !== 'SHOW')
            .filter((ride) => ride.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter((ride) => !showShortWaitTimesOnly || ride.queue?.STANDBY?.waitTime < 30);

        dispatch(setFilteredRideData(filteredAttractions));
    }, [rawRideData, searchTerm, showClosedRides, showShortWaitTimesOnly, dispatch]);

    // Gestion de la recherche
    const handleSearchChange = useCallback((event) => {
        dispatch(setSearchTerm(event.target.value));
    }, [dispatch]);

    const allRidesClosed = rawRideData.every((ride) => ride.status === 'CLOSED');
    return (
        <div>
            <Navbar />
            <div className={styles.container}>
                <p className={styles.lastUpdate}>
                    {lastUpdate
                        ? `Dernière mise à jour : ${formatDate(lastUpdate)}`
                        : 'Aucune mise à jour récente'}
                </p>
                <input
                    type="text"
                    placeholder="Rechercher une attraction"
                    className={styles.searchAttraction}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className={styles.filters}>
                    <label className={styles.filterOption}>
                        <input
                            type="checkbox"
                            checked={showShortWaitTimesOnly}
                            onChange={(e) => setShowShortWaitTimesOnly(e.target.checked)}
                        />
                        Moins de 30 min d'attente
                    </label>
                    <label className={styles.filterOption}>
                        <input
                            type="checkbox"
                            checked={showClosedRides}
                            onChange={(e) => setShowClosedRides(e.target.checked)}
                        />
                        Afficher les attractions fermées
                    </label>
                </div>
                {!allRidesClosed && (
                    <div className={styles.attractionsList}>
                        {filteredRideData.length > 0 ? (
                            filteredRideData.map((ride) => {
                                const standbyQueue = ride.queue?.STANDBY;
                                const currentWaitTime = standbyQueue ? standbyQueue.waitTime : null;
                                const isIncreased = ride.queue.STANDBY.waitTime > (previousWaitTimes[ride.id] ?? ride.queue.STANDBY.waitTime);
                                const isDecreased = ride.queue.STANDBY.waitTime < (previousWaitTimes[ride.id] ?? ride.queue.STANDBY.waitTime);
                                let waitTimeClass = currentWaitTime >= 30 ? styles.waitTimeHigh : styles.waitTimeLow;
                                if (isIncreased) waitTimeClass = styles.waitTimeIncreased;
                                if (isDecreased) waitTimeClass = styles.waitTimeDecreased;

                                return (
                                    <div key={ride.id} className={styles.card}>
                                        <img
                                            className={styles.imgAttraction}
                                            src={attractionImages[ride.name]}
                                            alt={ride.name}
                                        />
                                        <div className={styles.cardText}>
                                        <h3 className={styles.attractionName}>{ride.name}</h3>
                                        </div>
                                        <div className={`${styles.waitTime} ${waitTimeClass}`}>
                                            {ride.status === 'CLOSED' ? 'Fermée' : `${currentWaitTime ?? '0'}min`}
                                            {isIncreased && <span> 🔺</span>}
                                            {isDecreased && <span> 🔻</span>}
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

