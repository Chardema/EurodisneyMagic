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
    "Pirates' Beach",
    "Avengers Assemble: Flight Force",
    "Cars ROAD TRIP",
    "Spider-Man W.E.B. Adventure",
    "Cars Quatre Roues Rallye",
    "Toy Soldiers Parachute Drop",
    "RC Racer",
    "The Twilight Zone Tower of Terror",
    "Crush's Coaster",
    "Ratatouille: The Adventure",
    "Slinky® Dog Zigzag Spin",
    "Les Tapis Volants - Flying Carpets Over Agrabah®"
];
const attractionImages = attractionNames.reduce((acc, name) => {
    const imageName = formatImageName(name);
    acc[name] = importImage(imageName);
    return acc;
}, {});

const Attractions = () => {
    const dispatch = useDispatch();
    const { rawRideData, searchTerm, filteredRideData } = useSelector((state) => state);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [filters, setFilters] = useState({
        showShortWaitTimesOnly: false,
        showClosedRides: false,
        selectedPark: 'all' // 'all', 'disneyland', 'studio'
    });

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

    useEffect(() => {
        const storedPreviousWaitTimes = localStorage.getItem('previousWaitTimes');
        if (storedPreviousWaitTimes) {
            setPreviousWaitTimes(JSON.parse(storedPreviousWaitTimes));
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get('http://magicai.jfcp3675.odns.fr/api/attractions')
            ;
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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useInterval(fetchData, 60000);

    useEffect(() => {
        const filteredAttractions = rawRideData
            .filter((ride) => {
                return (
                    (filters.showClosedRides || ride.status !== 'CLOSED') &&
                    ride.entityType !== 'SHOW' &&
                    ride.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (!filters.showShortWaitTimesOnly || ride.queue?.STANDBY?.waitTime < 30) &&
                    (filters.selectedPark === 'all' || ride.parkId === filters.selectedPark)
                );
            });

        dispatch(setFilteredRideData(filteredAttractions));
    }, [rawRideData, searchTerm, filters, dispatch]);

    const handleFilterChange = (filter, value) => {
        setFilters({ ...filters, [filter]: value });
    };
    const handleSearchChange = (event) => {
        dispatch(setSearchTerm(event.target.value));
    };


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
                    placeholder="Rechercher une attractio"
                    className={styles.searchAttraction}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className={styles.filters}>
                    <div className={styles.checkbox}>
                        <label className={styles.filterOption}>
                            <input
                                type="checkbox"
                                className={styles.checkboxcustom}
                                checked={filters.showShortWaitTimesOnly}
                                onChange={(e) => handleFilterChange('showShortWaitTimesOnly', e.target.checked)}
                            />
                            <div className={styles.textCheckbox}>
                                Moins de 30 min d'attente
                            </div>
                        </label>
                        <label className={styles.filterOption}>
                            <input
                                type="checkbox"
                                className={styles.checkboxcustom}
                                checked={filters.showClosedRides}
                                onChange={(e) => handleFilterChange('showClosedRides', e.target.checked)}
                            />
                            <div className={styles.textCheckbox}>
                                Afficher les attractions fermées
                            </div>
                        </label>
                    </div>
                    <div className={styles.allbutton}>
                        <button className={styles.button} onClick={() => setFilters({...filters, selectedPark: 'all'})}>Tous les Parcs</button>
                        <button  className={styles.button} onClick={() => setFilters({...filters, selectedPark: 'dae968d5-630d-4719-8b06-3d107e944401'})}>Disneyland Park</button>
                        <button  className={styles.button} onClick={() => setFilters({...filters, selectedPark: 'ca888437-ebb4-4d50-aed2-d227f7096968'})}>Studio Park</button>
                    </div>
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

