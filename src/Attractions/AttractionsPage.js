import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import styles from './attractions.module.scss'
import Slider from 'react-slick';
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
    const { rawRideData, filteredRideData, closedRideData, searchTerm } = useSelector(state => state);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [parkHours, setParkHours] = useState(null);
    const now = new Date();

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get('https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live');
            const rideTimes = response.data;

            if (Array.isArray(rideTimes.liveData)) {
                dispatch(setRawRideData(rideTimes.liveData));
                setLastUpdate(new Date());
            } else {
                dispatch(setRawRideData([]));
                setLastUpdate(null);
            }
        } catch (error) {
            console.error(error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useInterval(() => {
        fetchData();
    }, 60000);
    //Récupérer les horraires du Parc
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

    //Filtre des attractions
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

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date invalide';

        try {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
        } catch (error) {
            console.error("Erreur de formatage de date:", error, "pour la date:", dateString);
            return 'Date invalide';
        }
    };
    const renderParkHours = () => {
        if (!parkHours || !parkHours.schedule) {
            return <p>Horaires non disponibles.</p>;
        }

        const todayStr = now.toISOString().split('T')[0];
        const todaySchedules = parkHours.schedule.filter(schedule => schedule.date === todayStr);

        const renderScheduleInfo = (schedules) => {
            const operatingSchedule = schedules.find(s => s.type === "OPERATING");
            const extraHoursSchedule = schedules.find(s => s.type === "EXTRA_HOURS");

            return (
                <>
                    {operatingSchedule && (
                        <p>Le parc est ouvert le {formatDate(operatingSchedule.date).split(' ')[0]} entre {formatDate(operatingSchedule.openingTime)} et {formatDate(operatingSchedule.closingTime)}.</p>
                    )}
                    {extraHoursSchedule && (
                        <p>Extra Magic Hours: de {formatDate(extraHoursSchedule.openingTime)} à {formatDate(extraHoursSchedule.closingTime)}.</p>
                    )}
                </>
            );
        };

        return (
            <>
                {renderScheduleInfo(todaySchedules)}
            </>
        );
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
                            filteredRideData.map((ride) => (
                                <div key={ride.id} className={styles.card}>
                                    <img className={styles.imgAttraction} src={attractionImages[ride.name]} alt={ride.name} />
                                    <div className={styles.cardText}>
                                        <p className={styles.textOpenAttraction}>{ride.name} {ride.status === 'CLOSED' ? '(Fermé)' : ''}</p>
                                        {ride.queue && ride.queue.STANDBY && ride.queue.STANDBY.waitTime !== null && ride.status !== 'CLOSED' ? (
                                            <p className={styles.textOpenAttraction}>
                                                {`${ride.queue.STANDBY.waitTime} minutes d'attente (Ouvert)`}
                                            </p>
                                        ) : ride.status !== 'CLOSED' ? (
                                            <p className={styles.textOpenAttraction}>Momentanément Indisponible</p>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Aucune attraction correspondant à la recherche.</p>
                        )}
                    </div>
                )}
                {allRidesClosed && (
                    <div className={styles.parkHours}>
                        <h2>Horaires du Parc</h2>
                        {renderParkHours()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attractions;
