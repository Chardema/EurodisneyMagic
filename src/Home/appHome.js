import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RiDeleteBin7Fill } from "react-icons/ri";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart, faHeart as regularHeart } from '@fortawesome/free-solid-svg-icons';
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import PopupSurvey from '../popupSurvey/popupSurvey';
import { setFavorites, toggleFavorite } from "../redux/actions";
import { useSwipeable } from 'react-swipeable';
import backgroundImage from './../img/simphonyofcolor.jpg';
import styles from './appHome.module.scss';
import { attractionNames, attractionImages } from "../Attractions/AttractionsPage";

// Assuming useWindowWidth is a custom hook you've created:
import { useWindowWidth } from '../utils';

// Define the FavoriteCard component
const FavoriteCard = ({ favorite, onRemove, getWaitTimeColor }) => {
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [swipeAction, setSwipeAction] = useState(false);

    const handlers = useSwipeable({
        onSwiping: (eventData) => {
            const progress = Math.abs(eventData.deltaX);
            setSwipeProgress(progress);
            setSwipeAction(eventData.dir === 'Left');
        },
        onSwiped: (eventData) => {
            if (swipeAction && swipeProgress > window.innerWidth * 0.25) {
                onRemove(favorite);
            }
            setSwipeProgress(0);
            setSwipeAction(false);
        },
        trackMouse: true,
    });

    const indicatorStyle = {
        width: swipeAction ? `${Math.min(swipeProgress / window.innerWidth * 100 * 2, 100)}%` : '0%',
        opacity: swipeAction ? 1 : 0,
    };

    return (
        <div {...handlers} className={styles.attractionscard}>
            <div className={styles.deleteIndicator} style={indicatorStyle}>
                <div className={styles.deleteIndicatorContent}>
                    Supprimer
                </div>
            </div>
            <img src={attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
            <h3>{favorite.name}</h3>
            <div className={styles.infoanddelete}>
                <div className={`${styles.waitTimeCircle} ${getWaitTimeColor(favorite)}`}>
                    {favorite.status === 'CLOSED' ? 'Fermée' :
                    favorite.status === 'DOWN' ? 'Indispo' :
                    favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
    const reduxFavorites = useSelector(state => state.favorites.favorites);
    const attractions = useSelector(state => state.attractions.attractions);
    const dispatch = useDispatch();
    const width = useWindowWidth(); // This needs to be a hook that returns the current window width
    const [recommendedAttractions, setRecommendedAttractions] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const updateFavorites = (favorites, attractions) => {
        return favorites.map(favorite => {
            const updatedAttraction = attractions.find(attr => attr.id === favorite.id);
            return updatedAttraction ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status } : favorite;
        });
    };

    const removeFavorite = (favorite) => {
        const updatedFavorites = reduxFavorites.filter(fav => fav.id !== favorite.id);
        dispatch(setFavorites(updatedFavorites));
    };

    const getWaitTimeColor = (attraction) => {
        if (attraction.status === 'CLOSED' || attraction.status === 'DOWN') {
            return styles.gray;
        } else if (attraction.waitTime <= 15) {
            return styles.green;
        } else if (attraction.waitTime <= 30) {
            return styles.yellow;
        } else {
            return styles.red;
        }
    };

    useEffect(() => {
        const updatedFavorites = updateFavorites(reduxFavorites, attractions);
        if (JSON.stringify(updatedFavorites) !== JSON.stringify(reduxFavorites)) {
            dispatch(setFavorites(updatedFavorites));
        }
    }, [attractions, dispatch, reduxFavorites]);

    useEffect(() => {
        const shuffledAttractionNames = attractionNames.sort(() => 0.5 - Math.random());
        const selectedAttractions = shuffledAttractionNames.slice(0, 6);
        setRecommendedAttractions(selectedAttractions);
    }, []);

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleToggleFavorite = (attractionName) => {
        const attraction = attractions.find(attr => attr.name === attractionName);
        if (attraction) {
            dispatch(toggleFavorite(attraction));
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
                                <FavoriteCard
                                    key={favorite.id}
                                    favorite={favorite}
                                    onRemove={removeFavorite}
                                    getWaitTimeColor={getWaitTimeColor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noFavoritesMessage}>
                            <p>Vous n'avez pas encore de favoris.</p>
                            <Link to="/attractions" className={styles.linkButton}>
                                Ajoutez votre première attraction
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            {width <= 768 && <BottomNav />}
            {showPopup && <PopupSurvey onClose={closePopup} attractions={attractions} />}
        </div>
    );
};

export default HomePage;
