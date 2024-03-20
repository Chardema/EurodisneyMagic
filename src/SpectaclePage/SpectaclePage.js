import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { toggleFavoriteShow } from '../redux/actions'; // Assurez-vous que cette action existe et est correctement importée
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import { formatImageName, importImage, useWindowWidth } from "../utils";
import styles from './spectacle.module.scss';

const Shows = () => {
    const [showsData, setShowsData] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const width = useWindowWidth();
    const favorites = useSelector(state => state.favorites.favorites);
    const dispatch = useDispatch();

    const handleToggleFavorite = (show) => {
        // Déterminer si le spectacle est déjà dans les favoris
        const isFavorited = favorites.some(fav => fav.id === show.id);
        // Enrichir le spectacle avec un type avant de dispatcher
        const showWithEntityType = { ...show, type: 'SHOW' };
        dispatch(toggleFavoriteShow(isFavorited ? show.id : showWithEntityType));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://eurojourney.azurewebsites.net/api/shows');
                const currentDateTime = new Date();
                const showsDataWithNextShowtime = response.data.map(show => {
                    const nextShowtime = show.showtimes
                        .filter(time => new Date(time.startTime) > currentDateTime)
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
                    return { ...show, showtimes: nextShowtime ? [nextShowtime] : [] };
                }).filter(show => show.showtimes.length > 0);
                setShowsData(showsDataWithNextShowtime);
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const compareShowtimes = (a, b) => new Date(a.showtimes[0]?.startTime).getTime() - new Date(b.showtimes[0]?.startTime).getTime();

    return (
        <div>
            {width > 768 && <Navbar />}
            <div className={styles.container}>
                <div className={styles.modeSwitch}>
                    <button onClick={() => setViewMode('list')}>Liste</button>
                    <button onClick={() => setViewMode('map')}>Plan</button>
                </div>
                <h1>Spectacles prévus aujourd'hui</h1>
                <p className={styles.info}>Pour plus de précision, n'hésitez pas à consulter l'application Disneyland Paris officielle.</p>
                {viewMode === 'list' ? (
                    <div className={styles.showsList}>
                        {showsData.length > 0 ? showsData.sort(compareShowtimes).map((show) => (
                            <div key={show.id} className={styles.card}>
                                <img className={styles.showImage} src={importImage(formatImageName(show.name))} alt={show.name} />
                                <h3 className={styles.showName}>{show.name}</h3>
                                {show.showtimes.length > 0 ? (
                                    <h2 className={styles.showStatus}>Prochaine représentation : {new Date(show.showtimes[0].startTime).toLocaleTimeString()}</h2>
                                ) : (
                                    <p className={styles.noShowtimes}>Aucune représentation prévue.</p>
                                )}
                                <button className={styles.favoriteButton} onClick={() => handleToggleFavorite(show)}>
                                    <FontAwesomeIcon icon={favorites.some(fav => fav.id === show.id && fav.type === 'SHOW') ? solidHeart : regularHeart} />
                                </button>
                            </div>
                        )) : <p>Aucun spectacle disponible pour le moment.</p>}
                    </div>
                ) : (
                    <MapContainer center={[48.872, 2.775]} zoom={15} scrollWheelZoom={true} style={{ height: '80vh', width: '100vw' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {showsData.map((show) => show.coordinates && show.coordinates.length === 2 && (
                            <Marker key={show.id} position={show.coordinates} icon={L.icon({ iconUrl: importImage(formatImageName(show.name)), iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] })}>
                                <Popup>{show.name} - Prochaine représentation : {new Date(show.showtimes[0]?.startTime).toLocaleTimeString()}</Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default Shows;
