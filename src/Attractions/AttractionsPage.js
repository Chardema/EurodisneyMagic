import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import styles from './attractions.module.scss'
import {formatDate, formatImageName, importImage, useWindowWidth} from "../utils";
import { setAttractions, setRawRideData, setFilteredRideData, setSearchTerm } from '../redux/actions';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from './../Navbar/Navbar';
import './attractions.module.scss';
import BottomNav from "../mobileNavbar/mobileNavbar";
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { toggleFavorite } from '../redux/actions';
import AttractionsMap from "../attractionsMap/attractionsMap";



// Liste des noms d'attractions
export const attractionNames = [
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
    'Autopia, presented by Avis',
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
export const attractionImages = attractionNames.reduce((acc, name) => {
    const imageName = formatImageName(name);
    acc[name] = importImage(imageName);
    return acc;
}, {});

const Attractions = () => {
    const { rawRideData, searchTerm, filteredRideData, favorites } = useSelector(state => ({
        rawRideData: state.attractions.rawRideData,
        searchTerm: state.attractions.searchTerm,
        filteredRideData: state.attractions.filteredRideData,
        favorites: state.favorites.favorites
    }));
    const [viewMode, setViewMode] = useState('list'); // 'list', 'map'
    const [lastUpdate, setLastUpdate] = useState(null);
    const [previousWaitTimes, setPreviousWaitTimes] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [filters, setFilters] = useState({
        showShortWaitTimesOnly: false,
        hideClosedRides: false,
        selectedPark: 'all', // 'all', 'disneyland', 'studio'
        selectedType: 'all', // 'all', 'sans file d'attente', 'famille', 'sensation'
        selectedLand: 'all' // 'all', 'fantasyland', 'frontierland', 'adventureland', 'discoveryland'
    });
    const dispatch = useDispatch();

    const handleToggleFavorite = (attraction) => {
        dispatch(toggleFavorite(attraction));
    };
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

            const newPreviousWaitTimes = rideData.reduce((acc, ride) => {
                acc[ride.id] = {
                    currentWaitTime: ride.waitTime,
                    previousWaitTime: ride.previousWaitTime,
                    hadPreviousWaitTime: ride.previousWaitTime != null
                };
                return acc;
            }, {});

            setPreviousWaitTimes(newPreviousWaitTimes);

            const sortedRideData = rideData.sort((a, b) => a.waitTime - b.waitTime);
            dispatch(setRawRideData(sortedRideData || []));
            dispatch(setAttractions(sortedRideData || []));
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
        if (!rawRideData) {
            return;
        }
        const filteredAttractions = rawRideData
            .filter((ride) => {
                return (
                    (filters.hideClosedRides ? ride.status !== 'CLOSED' : true) &&
                    (filters.showShortWaitTimesOnly ? ride.waitTime < 40 : true) &&
                    (filters.selectedPark === 'all' || ride.parkId === filters.selectedPark) &&
                    (filters.selectedType === 'all' || ride.type === filters.selectedType) &&
                    (filters.selectedLand === 'all' || ride.land === filters.selectedLand) &&
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
    const width = useWindowWidth();

    const allRidesClosed = rawRideData && rawRideData.length > 0 && rawRideData.every((ride) => ride.status === 'CLOSED');
    const getWaitTimeColor = (waitTime) => {
        let content;
        let backgroundColor = '#F44336'; // Couleur par défaut

        if (waitTime === null) {
            content = 'Direct';
            backgroundColor = '#4CAF50'; // Vert
        } else if (waitTime < 20) {
            content = `${waitTime} min`;
            backgroundColor = '#4CAF50'; // Vert
        } else if (waitTime < 40) {
            content = `${waitTime} min`;
            backgroundColor = '#FFC107'; // Jaune
        } else {
            content = `${waitTime} min`;
        }

        return `<div style="background-color: ${backgroundColor}; color: white; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; border-radius: 50%; font-weight: bold; font-size: 10px;">${content}</div>`;
    };

    return (
        <div className={styles.bodyAttraction}>
            {width > 768 && <Navbar />}
            <div className = {styles.header}>
                <div className={styles.modeSwitch}>
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>Liste</button>
                    <button className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')}>Plan</button>
                </div>
            </div>
            {viewMode === 'list' ? (
                <div className={styles.container}>
                    <input
                        type="text"
                        placeholder="Quelle attraction aujourd'hui ?"
                        className={styles.searchAttraction}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className={styles.filters}>
                        <div className={styles.filterOption}>
                            <select
                                value={filters.selectedLand}
                                onChange={(e) => handleFilterChange('selectedLand', e.target.value)}
                                className={styles.selectOption1}
                            >
                                <option value="all">Tous les lands</option>
                                <option value="Adventureland">Adventureland</option>
                                <option value="Fantasyland">Fantasyland</option>
                                <option value="Frontierland">Frontierland</option>
                                <option value="Discoveryland">Discoveryland</option>
                                <option value="Main Street, U.S.A">Main Street U.S.A.</option>
                                <option value="Production Courtyard">Production Courtyard</option>
                                <option value="Toon Studio">Toon Studio</option>
                                <option value="Avengers Campus">Avengers Campus</option>
                            </select>
                            <select
                                value={filters.selectedType}
                                onChange={(e) => handleFilterChange('selectedType', e.target.value)}
                                className={styles.selectOption}
                            >
                                <option value="all">Types d'attractions</option>
                                <option value="all">Toutes</option>
                                <option value="Famille">Famille</option>
                                <option value="Sensation">Sensation</option>
                                <option value="Sans file d’attente">Sans file d’attente</option>
                                <option value="Rencontre avec les personnages">Rencontre avec les personnages</option>
                            </select>
                        </div>
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
                                const waitTimeClass = isWaitTimeHigh ? styles.waitTimeHigh : '';

                                return (
                                    <div key={ride.id} className={styles.card}>
                                        <img  src={attractionImages[ride.name]} alt={ride.name} />
                                        <div className={styles.cardText}>
                                            <h3 className={styles.attractionName}>{ride.name}</h3>
                                            <p className={styles.attractionLand}>{ride.land}</p>
                                        </div>
                                        <div className={`${styles.waitTime} ${waitTimeClass} ${isIncreased || isDecreased ? styles.pulseAnimation : ''}`}>
                                            {ride.status === 'DOWN' ? 'Indispo' :
                                                ride.status === 'CLOSED' ? 'Fermée' :
                                                    ride.waitTime === null ? 'Direct' : `${ride.waitTime} min`}
                                            {isIncreased && <span className={styles.arrowUp}>⬆️</span>}
                                            {isDecreased && <span className={styles.arrowDown}>⬇️</span>}
                                        </div>
                                        <button className={styles.favoriteButton} onClick={() => handleToggleFavorite(ride)}>
                                            <FontAwesomeIcon icon={favorites.some(fav => fav.id === ride.id) ? solidHeart : regularHeart} />
                                        </button>


                                    </div>
                                );
                            }) : (
                                <p>Aucune attraction correspondant à la recherche.</p>
                            )}
                        </div>
                    )}
                </div>
                    ) : (
                <div style={{height: '80vh', width: '100vw'}}>
                    <AttractionsMap attractions={filteredRideData} getWaitTimeColor={getWaitTimeColor} />
                </div>
            )}
            <div className={styles.mobilecontainer}>
                <BottomNav/>
            </div>
        </div>
    );
};

export default Attractions;

