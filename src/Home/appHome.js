import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import PopupSurvey from '../popupSurvey/popupSurvey';
import { setFavorites } from "../redux/actions";
import { useSwipeable } from 'react-swipeable';
import backgroundImage from './../img/simphonyofcolor.jpg';
import styles from './appHome.module.scss';
import { attractionImages } from "../Attractions/AttractionsPage";
import {formatImageName, importImage, useWindowWidth} from '../utils';

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
const FavoriteCard = ({ favorite, onRemove, isMinimalistMode }) => {
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeAction, setSwipeAction] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [nextShowtime, setNextShowtime] = useState(null);

  useEffect(() => {
    if (favorite.type === 'SHOW') {
      const now = new Date();
      const futureShowtimes = favorite.showtimes.filter(showtime =>
          new Date(showtime.startTime) > now
      ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      setNextShowtime(futureShowtimes.length > 0 ? futureShowtimes[0] : null);
    }
  }, [favorite.showtimes]);


  
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
    <div {...handlers} className={`${styles.attractionscard} ${showHint ? styles.swipeHintAnimation : ''} ${isMinimalistMode ? styles.minimalistModeCard : ''}`}>
      <div className={styles.deleteIndicator} style={indicatorStyle}>
        <div className={styles.deleteIndicatorContent}>Supprimer</div>
      </div>
      {!isMinimalistMode && favorite.type === 'SHOW' && (
        <>
          <img className={styles.favoriteImage} src={importImage(formatImageName(favorite.name))} alt={favorite.name}/>
          <h3 className={styles.attractionTitle}>{favorite.name}</h3>
          {nextShowtime ? (
            <p>Prochaine représentation : {new Date(nextShowtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          ) : (
            <p>Non disponible</p>
          )}
        </>
      )}
      {!isMinimalistMode && favorite.type !== 'SHOW' && (
        <>
          <img src={attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
          <h3 className={styles.attractionTitle}>{favorite.name}</h3>
          <div className={styles.waitTimeContainer}>
            <div className={`${styles.waitTimeCircle} ${styles[getWaitTimeColor(favorite)]}`}>
              {favorite.status === 'CLOSED' ? 'Fermée' :
                  favorite.status === 'DOWN' ? 'Indispo' :
                      favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
            </div>
          </div>
        </>
      )}
      {isMinimalistMode && (
        <>
          <h3 className={styles.attractionTitle}>{favorite.name}</h3>
          {favorite.type !== 'SHOW' ? (
            <div className={styles.waitTimeContainer}>
              <div className={`${styles.waitTimeCircle} ${styles[getWaitTimeColor(favorite)]}`}>
                {favorite.status === 'CLOSED' ? 'Fermée' :
                    favorite.status === 'DOWN' ? 'Indispo' :
                        favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
              </div>
            </div>
          ) : nextShowtime ? (
            <p>Prochaine représentation : {new Date(nextShowtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          ) : (
            <p>Non disponible</p>
          )}
        </>
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
  const [filteredFavorites, setFilteredFavorites] = useState(reduxFavorites); // Stocker les favoris filtrés
  const [isMinimalistMode, setIsMinimalistMode] = useState(false);

  const toggleViewMode = () => setIsMinimalistMode(!isMinimalistMode);

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
    setFilteredFavorites(reduxFavorites.filter(favorite => {
      if (favoritesFilter === 'all') return true;
      if (favoritesFilter === 'attractions') return favorite.type !== 'SHOW';
      return favorite.type === 'SHOW'; // Filtre par spectacles
    }));
  }, [favoritesFilter, reduxFavorites]);

  useEffect(() => {
    const userPreferences = localStorage.getItem('userPreferences');
    if (!userPreferences) {
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => setShowPopup(false);

  return (
      <div className={styles.homePage}>
        {width > 768 && <Navbar />}
        <div className={styles.topcontainer}>
          <div className={styles.heroSection}>
            <img src={backgroundImage} alt="Disneyland Paris" className={styles.heroImage} />
          </div>
          <div className={styles.filterButtons}>
            <button onClick={() => setFavoritesFilter('all')} className={favoritesFilter === 'all' ? styles.active : ''}>Tous</button>
            <button onClick={() => setFavoritesFilter('attractions')} className={favoritesFilter === 'attractions' ? styles.active : ''}>Attractions</button>
            <button onClick={() => setFavoritesFilter('shows')} className={favoritesFilter === 'shows' ? styles.active : ''}>Spectacles</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <button 
  aria-label="Vue en liste" 
  onClick={() => setIsMinimalistMode(true)} 
  className={`${styles.toggleButton} ${isMinimalistMode ? styles.active : ''}`}
>
  <i className="fas fa-list"></i>
</button>
<button 
  aria-label="Vue en carte" 
  onClick={() => setIsMinimalistMode(false)} 
  className={`${styles.toggleButton} ${!isMinimalistMode ? styles.active : ''}`}
>
  <i className="fas fa-th-large"></i>
</button>

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
                          isMinimalistMode={isMinimalistMode}
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
          <div className={styles.buyMeABeerContainer}>
            <p>Cette application n'a aucune affilitation officielle avec Disneyland Paris <br />
              N'hésitez pas à me soutenir !</p>
            <a href="https://www.buymeacoffee.com/8w7bkbktqs4">
              <img
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍺&slug=8w7bkbktqs4&button_colour=5F7FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00"
                  alt="Buy me a beer"/>
            </a>
          </div>
        </div>
        {width <= 768 && <BottomNav/>}
        {showPopup && <PopupSurvey onClose={closePopup} attractions={attractions}/>}
      </div>
  );
};

export default HomePage;
    
