import React, { useEffect, useState } from 'react';
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import styles from './appHome.module.scss'; // Votre fichier CSS pour la page d'accueil
import { useWindowWidth } from '../utils';
import { formatImageName, importImage } from '../utils';
import PopupSurvey from '../popupSurvey/popupSurvey';
import backgroundImage from './../img/simphonyofcolor.jpg';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFavorites, toggleFavorite } from "../redux/actions";
import { RiDeleteBin7Fill } from "react-icons/ri";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { attractionNames, attractionImages } from "../Attractions/AttractionsPage";

const HomePage = () => {
    const reduxFavorites = useSelector(state => state.favorites.favorites);
    const attractions = useSelector(state => state.attractions.attractions);
    const dispatch = useDispatch();
    const width = useWindowWidth();
    const [recommendedAttractions, setRecommendedAttractions] = useState([]);
    const [showPopup, setShowPopup] = useState(true);

    const updateFavorites = (favorites, attractions) => {
        return favorites.map(favorite => {
            const updatedAttraction = attractions.find(attr => attr.id === favorite.id);
            return updatedAttraction
                ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status }
                : favorite;
        });
    };

    const closePopup = (userPreferences) => {
        // Traitez les préférences de l'utilisateur ici si nécessaire
        setShowPopup(false);
      };

    const handleToggleFavorite = (attractionName) => {
        // Trouvez l'attraction dans la liste complète des attractions pour obtenir tous ses détails
        const attraction = attractions.find(attr => attr.name === attractionName);
        if (attraction) {
            dispatch(toggleFavorite(attraction));
        }
    };

    useEffect(() => {
        const updatedFavorites = updateFavorites(reduxFavorites, attractions);
        console.log('Updated favorites:', updatedFavorites);

        if (JSON.stringify(updatedFavorites) !== JSON.stringify(reduxFavorites)) {
            console.log('Updating favorites');
            dispatch(setFavorites(updatedFavorites));
        }

        // Vérifiez si les informations sur les attractions sont disponibles dans le cache
        if (!attractions.length) {
            setShowPopup(true); // Affichez la popup si les informations ne sont pas disponibles
        }
    }, [attractions, dispatch, reduxFavorites]);

    useEffect(() => {
        // Sélectionnez aléatoirement un nombre spécifique d'attractions recommandées
        const numberOfRecommendedAttractions = 6;
        const shuffledAttractionNames = attractionNames.sort(() => 0.5 - Math.random());
        const selectedAttractions = shuffledAttractionNames.slice(0, numberOfRecommendedAttractions);

        // Mettez à jour l'état pour afficher les attractions recommandées
        setRecommendedAttractions(selectedAttractions);
    }, []);

    const removeFavorite = (favorite) => {
        const updatedFavorites = reduxFavorites.filter(fav => fav.id !== favorite.id);
        dispatch(setFavorites(updatedFavorites)); // Mettre à jour les favoris sans déclencher à nouveau le composant
    };

    const handleUserPreference = (preference) => {
        // Traitez la préférence de l'utilisateur ici
        console.log('User preference:', preference);
        setShowPopup(false); // Masquez la popup après avoir traité la préférence de l'utilisateur
    };

    const getWaitTimeColor = (attraction) => {
        if (attraction.status === 'CLOSED') {
            return styles.gray;
        } else if (attraction.status === 'DOWN') {
            return styles.gray;
        } else if (attraction.waitTime <= 15) {
            return styles.green;
        } else if (attraction.waitTime <= 30) {
            return styles.yellow;
        } else {
            return styles.red;
        }
    };

    return (
        <div className={styles.homePage}>
            {width > 768 && <Navbar />}
            <div className={styles.topcontainer}>
                <div className={styles.heroSection}>
                    <img src={backgroundImage} alt="Disneyland Paris" className={styles.heroImage} />
                </div>
            </div>
            <div className={styles.bottomcontainer}>
                <div className={styles.content}>
                    {reduxFavorites.length > 0 ? (
                        <div className={styles.attractionsSection}>
                            {reduxFavorites.map(favorite => (
                                <div key={favorite.id} className={styles.attractionscard}>
                                    <img src={attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
                                    <h3>{favorite.name}</h3>
                                    <div className={styles.infoanddelete}>
                                        <div className={`${styles.waitTimeCircle} ${getWaitTimeColor(favorite)}`}>
                                            {favorite.status === 'CLOSED' ? 'Fermée' :
                                                favorite.status === 'DOWN' ? 'Indispo' :
                                                    favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
                                        </div>
                                        <RiDeleteBin7Fill
                                            className={`${styles.removeIcon} ${styles.favoriteIcon}`}
                                            onClick={() => removeFavorite(favorite)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.allBlock}>
                            <div className={styles.noFavoritesMessage}>
                                <p>Vous n'avez pas encore de favoris.</p>
                                <Link to="/attractions" className={styles.linkButton}>
                                    Ajoutez votre première attraction
                                </Link>
                            </div>
                            <div className={styles.randomBlock}>
                        <h2>Ajoutez votre première attraction:</h2>
                        <div className={styles.randomAttractionsContainer}>
                            {recommendedAttractions.map((attractionName, index) => (
                                <div key={index} className={styles.randomAttractions}>
                                    <img src={attractionImages[attractionName]} alt={attractionName} className={styles.randomAttractionsImage} />
                                    <p className={styles.randomAttractionsName}>{attractionName}</p>
                                    <button onClick={() => handleToggleFavorite(attractionName)}>
                                        {reduxFavorites.some(fav => fav.name === attractionName) ? (
                                            <FontAwesomeIcon icon={solidHeart} />
                                        ) : (
                                            <FontAwesomeIcon icon={regularHeart} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                        </div>
                    )}
                </div>
            </div>
            <BottomNav />
            {showPopup && <PopupSurvey onClose={closePopup} attractions={attractions} />}

        </div>
    );
};

export default HomePage;
