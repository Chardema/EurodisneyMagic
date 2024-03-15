import React, { useEffect, useState, useCallback } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import PopupSurvey from '../popupSurvey/popupSurvey';
import { setFavorites } from "../redux/actions";
import { useSwipeable } from 'react-swipeable';
import backgroundImage from './../img/simphonyofcolor.jpg';
import styles from './appHome.module.scss';
import { attractionNames, attractionImages } from "../Attractions/AttractionsPage";
import { useWindowWidth } from '../utils';




const getWaitTimeColor = (attraction) => {
    if (attraction.status === 'CLOSED' || attraction.status === 'DOWN') {
      return 'gray';
    } else if (attraction.waitTime <= 15) {
      return 'green';
    } else if (attraction.waitTime <= 30) {
      return 'yellow';
    } else {
      return 'red';
    }
  };

// Define the FavoriteCard component
const FavoriteCard = ({ favorite, onRemove, getWaitTimeColor }) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeAction, setSwipeAction] = useState(false);
  const [showHint, setShowHint] = useState(true);
  

  useEffect(() => {
    // Disable the hint after the first display
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 1000); // Duration of the animation + delay

    return () => clearTimeout(timer);
  }, []);

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
    <div {...handlers} className={`${styles.attractionscard} ${showHint ? 'swipeHintAnimation' : ''}`}>
      <div className={styles.deleteIndicator} style={indicatorStyle}>
        <div className={styles.deleteIndicatorContent}>
          Supprimer
        </div>
      </div>
      <img src={attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
      <h3 className={styles.attractionTitle}>{favorite.name}</h3>
      <div className={styles.waitTimeContainer}>
      <div className={`${styles.waitTimeCircle} ${styles[getWaitTimeColor(favorite)]}`}>
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
  const [showPopup, setShowPopup] = useState(false);

  const updateFavorites = useCallback((favorites, attractions) => {
    return favorites.map(favorite => {
      const updatedAttraction = attractions.find(attr => attr.id === favorite.id);
      return updatedAttraction ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status } : favorite;
    });
  }, []);

  const removeFavorite = useCallback((favorite) => {
    const updatedFavorites = reduxFavorites.filter(fav => fav.id !== favorite.id);
    dispatch(setFavorites(updatedFavorites));
  }, [dispatch, reduxFavorites]);


  useEffect(() => {
    const updatedFavorites = updateFavorites(reduxFavorites, attractions);
    if (JSON.stringify(updatedFavorites) !== JSON.stringify(reduxFavorites)) {
      dispatch(setFavorites(updatedFavorites));
    }
  }, [attractions, dispatch, reduxFavorites, updateFavorites]);

  useEffect(() => {
    const shuffledAttractionNames = [...attractionNames].sort(() => 0.5 - Math.random());
    const selectedAttractions = shuffledAttractionNames.slice(0, 6);
    // Assuming setRecommendedAttractions is used to set state somewhere in this component or its children
  }, []);

  useEffect(() => {
    // Vérifiez si userPreferences existe dans le localStorage
    const userPreferences = localStorage.getItem('userPreferences');
    if (!userPreferences) {
      // S'il n'existe pas, affichez le popup
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
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
      {showPopup && <PopupSurvey onClose={() => setShowPopup(false)} attractions={attractions} />}
    </div>
  );
};

export default HomePage;
