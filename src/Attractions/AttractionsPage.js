import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import styles from './attractions.module.scss'
import {formatDate, formatImageName, importImage} from "../utils";
import {
    setRawRideData,
    setFilteredRideData,
    setSearchTerm
} from '../redux/actions'; // Assurez-vous que le chemin est correct
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from './../Navbar/Navbar'; // Assurez-vous que le chemin est correct
import useInterval from './../useInterval'; // Assurez-vous que le chemin est correct
import './attractions.module.scss';
import MobileNavbar from "../mobileNavbar/mobileNavbar";
import BottomNav from "../mobileNavbar/mobileNavbar"; // Assurez-vous que le chemin est correct

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
    const rawRideData = useSelector((state) => state.rawRideData);
    const searchTerm = useSelector((state) => state.searchTerm);
    const filteredRideData = useSelector((state) => state.filteredRideData);

    const [lastUpdate, setLastUpdate] = useState(null);
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [filters, setFilters] = useState({
        showShortWaitTimesOnly: false,
        hideClosedRides: false,
        selectedPark: 'all' // 'all', 'disneyland', 'studio'
    });

    useEffect(() => {
        const storedPreviousWaitTimes = localStorage.getItem('previousWaitTimes');
        if (storedPreviousWaitTimes) {
            setPreviousWaitTimes(JSON.parse(storedPreviousWaitTimes));
        }
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('https://eurojourney.azurewebsites.net/api/attractions');
            const rideData = response.data;
            setLastUpdate(new Date());

            const sortedRideData = rideData.sort((a, b) => a.waitTime - b.waitTime);
            dispatch(setRawRideData(sortedRideData || []));
        } catch (error) {
            console.error(error);
            setLastUpdate(new Date());
        } finally {
            setIsDataLoaded(true);
        }
    };

    const getWaitTimeStyle = (waitTime) => {
        if (waitTime < 20) return styles.waitTimeShort;
        if (waitTime < 40) return styles.waitTimeMedium;
        return styles.waitTimeLong;
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []); // Aucune dépendance ici pour éviter des appels multiples

    useEffect(() => {
        const filteredAttractions = rawRideData
            .filter((ride) => {
                return (
                    (filters.hideClosedRides ? ride.status !== 'CLOSED' : true) &&
                    (filters.showShortWaitTimesOnly ? ride.waitTime < 40 : true) &&
                    (filters.selectedPark === 'all' || ride.parkId === filters.selectedPark) &&
                    ride.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            })
            .sort((a, b) => a.waitTime - b.waitTime); // Tri par temps d'attente
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
                    placeholder="Rechercher une attraction"
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
                                Moins de 40 min d'attente
                            </div>
                        </label>
                    </div>
                    <div className={styles.checkbox}>
                        <label className={styles.filterOption}>
                            <input
                                type="checkbox"
                                className={styles.checkboxcustom}
                                checked={filters.hideClosedRides}
                                onChange={(e) => handleFilterChange('hideClosedRides', e.target.checked)}
                            />
                            <div className={styles.textCheckbox}>
                                Masquer les attractions fermées
                            </div>
                        </label>
                    </div>
                    <div className={styles.allbutton}>
                                <button 
                                    className={`${styles.button} ${filters.selectedPark === 'all' ? styles.buttonSelected : ''}`}
                                    onClick={() => setFilters({...filters, selectedPark: 'all'})}
                                >
                                    Tous les Parcs
                                </button>
                                <button 
                                    className={`${styles.button} ${filters.selectedPark === 'dae968d5-630d-4719-8b06-3d107e944401' ? styles.buttonSelected : ''}`}
                                    onClick={() => setFilters({...filters, selectedPark: 'dae968d5-630d-4719-8b06-3d107e944401'})}
                                >
                                    Parc Disneyland
                                </button>
                                <button 
                                    className={`${styles.button} ${filters.selectedPark === 'ca888437-ebb4-4d50-aed2-d227f7096968' ? styles.buttonSelected : ''}`}
                                    onClick={() => setFilters({...filters, selectedPark: 'ca888437-ebb4-4d50-aed2-d227f7096968'})}
                                >
                                    Walt Disney Studios
                                </button>
                    </div>
                </div>
                {allRidesClosed ? (
                    <div className={styles.noRidesMessage}>
                        <p>Toutes les attractions sont actuellement fermées, à demain !</p>
                    </div>
                ) : (
                    <div className={styles.attractionsList}>
                        {filteredRideData.length > 0 ? filteredRideData.map((ride) => {
                            const waitTimeInfo = previousWaitTimes[ride.id];
                            const isIncreased = waitTimeInfo && waitTimeInfo.hadPreviousWaitTime && waitTimeInfo.currentWaitTime > waitTimeInfo.previousWaitTime;
                            const isDecreased = waitTimeInfo && waitTimeInfo.hadPreviousWaitTime && waitTimeInfo.currentWaitTime < waitTimeInfo.previousWaitTime;
                            const isWaitTimeHigh = ride.waitTime >= 40;
                            const imageClass = ride.status === 'DOWN' ? `${styles.imgAttraction} ${styles.imgGrayscale}` : styles.imgAttraction;
                            const waitTimeClass = isWaitTimeHigh ? styles.waitTimeHigh : ''; // Classe supplémentaire pour les temps d'attente élevés

                            return (
                                <div key={ride.id} className={styles.card}>
                                    <img className={imageClass} src={attractionImages[ride.name]} alt={ride.name} />
                                    <div className={styles.cardText}>
                                        <h3 className={styles.attractionName}>{ride.name}</h3>
                                        {/* Ajoutez ici des informations supplémentaires sur l'attraction si disponibles */}
                                    </div>
                                    <div className={`${styles.waitTime} ${waitTimeClass} ${isIncreased || isDecreased ? styles.pulseAnimation : ''}`}>
                                        {ride.status === 'DOWN' ? 'Indispo' :
                                            ride.status === 'CLOSED' ? 'Fermée' :
                                                `${ride.waitTime !== null ? ride.waitTime : 0} min`}
                                        {isIncreased && <span className={styles.arrowUp}>⬆️</span>}
                                        {isDecreased && <span className={styles.arrowDown}>⬇️</span>}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p>Aucune attraction correspondant à la recherche.</p>
                        )}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default Attractions;

