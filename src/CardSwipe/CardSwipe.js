import React from 'react';
import { useSwipeable } from 'react-swipeable';
import styles from './CardSwipe.module.scss'; // Assurez-vous de créer ce fichier CSS

const CardSwipe = ({ attraction, onSwipeLeft, onSwipeRight }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft(attraction),
    onSwipedRight: () => onSwipeRight(attraction),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div {...handlers} className={styles.card}>
      <img src={attraction.image} alt={attraction.name} className={styles.image} />
      <div className={styles.details}>
        <h3>{attraction.name}</h3>
        <p>Temps d'attente: {attraction.waitTime} minutes</p>
      </div>
    </div>
  );
};

export default CardSwipe;
