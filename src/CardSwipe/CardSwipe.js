import React from 'react';
import { useSwipeable } from 'react-swipeable';
import styles from './CardSwipe.module.scss'; // Assurez-vous de créer ou d'ajuster ce fichier CSS

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
      <h3 className={styles.title}>{attraction.name}</h3>
    </div>
  );
};

export default CardSwipe;

