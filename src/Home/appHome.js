import React, { useEffect, useState, useCallback } from 'react';
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

const FavoriteCard = ({ favorite, onRemove }) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeAction, setSwipeAction] = useState(false);
  const [showHint, setShowHint] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const progress = Math.abs(eventData.deltaX);
      setSwipeProgress(progress);
      setSwipeAction(eventData.dir === 'Left');
    },
    onSwiped: () => {
      if (swipeAction && swipeProgress > window.innerWidth * 0.25) {
        onRemove(favorite);
      }
      setSwipeProgress(0);
      setSwipeAction(false);
    },
    trackMouse: true
  });

  const indicatorStyle = {
    width: swipeAction ? `${Math.min(swipeProgress / window.innerWidth * 100 * 2, 100)}%` : '0%',
    opacity: swipeAction ? 1 : 0,
  };

  return (
    <div {...handlers} className={`${styles.attractionscard} ${showHint ? styles.swipeHintAnimation : ''}`}>
      <div className={styles.deleteIndicator} style={indicatorStyle}>
        <div className={styles.deleteIndicatorContent}>Supprimer</div>
      </div>
      <img src={favorite.type === 'SHOW' ? favorite.image : attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
      <h3 className={styles.attractionTitle}>{favorite.name}</h3>
      {favorite.type === 'SHOW' ? (
        <p>Prochain horaire : {favorite.showTime}</p>
      ) : (
        <div className={styles.waitTimeContainer}>
          <div className={`${styles.waitTimeCircle} ${styles[getWaitTimeColor(favorite)]}`}>
            {favorite.status === 'CLOSED' ? 'Fermée' :
            favorite.status === 'DOWN' ? 'Indispo' :
            favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
          </div>
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const reduxFavorites = useSelector(state => state.favorites.favorites);
  const attractions = useSelector(state => state.attractions.attractions);
  const dispatch = useDispatch();
  const width = useWindowWidth();
  const [showPopup, setShowPopup] = useState(false);
  const [favoritesFilter, setFavoritesFilter] = useState('all');

  const updateFavorites = useCallback((favorites, attractions) => {
    return favorites.map(favorite => {
      const updatedAttraction = attractions.find(attr => attr.id === favorite.id);
      return updatedAttraction ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status } : favorite;
    });
  }, []);

  // Vérifiez si vous avez à la fois des attractions et des spectacles dans les favoris
const hasBothTypesOfFavorites = reduxFavorites.some(fav => fav.type === 'ATTRACTION') && reduxFavorites.some(fav => fav.type === 'SHOW');

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
    // Assuming setRecommendedAttractions is a missing part of your state management
  }, []);

  useEffect(() => {
    const userPreferences = localStorage.getItem('userPreferences');
    if (!userPreferences) {
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => setShowPopup(false);

  const filteredFavorites = reduxFavorites.filter(favorite => {
    if (favoritesFilter === 'all') return true;
    if (favoritesFilter === 'attractions') return favorite.type !== 'SHOW';
    return favorite.type === 'SHOW'; // Defaults to showing only shows if 'shows' is selected
  });

  return (
    <div className={styles.homePage}>
      {width > 768 && <Navbar />}
      <div className={styles.topcontainer}>
        <div className={styles.heroSection}>
          <img src={backgroundImage} alt="Disneyland Paris" className={styles.heroImage} />
        </div>
        {hasBothTypesOfFavorites && (
      <div className={styles.filterButtons}>
        <button onClick={() => setFavoritesFilter('all')} className={favoritesFilter === 'all' ? styles.active : ''}>Tous</button>
        <button onClick={() => setFavoritesFilter('attractions')} className={favoritesFilter === 'attractions' ? styles.active : ''}>Attractions</button>
        <button onClick={() => setFavoritesFilter('shows')} className={favoritesFilter === 'shows' ? styles.active : ''}>Spectacles</button>
      </div>
    )}
      </div>
      <div className={styles.bottomcontainer}>
        <div className={styles.content}>
          {filteredFavorites.length > 0 ? (
            <div className={styles.attractionsSection}>
              {filteredFavorites.map(favorite => (
                <FavoriteCard
                  key={favorite.id}
                  favorite={favorite}
                  onRemove={removeFavorite}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noFavoritesMessage}>
              <p>Vous n'avez pas encore de favoris.</p>
              <button onClick={() => setShowPopup(true)} className={styles.linkButton}>
                Refaire le quiz
              </button>
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
    
