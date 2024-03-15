import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import styles from './CardSwipe.module.scss';

const CardSwipe = ({ attraction, onSwipeLeft, onSwipeRight }) => {
  const [swipeDirection, setSwipeDirection] = useState('');

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setSwipeDirection(eventData.dir);
    },
    onSwipedLeft: () => {
      setSwipeDirection('');
      onSwipeLeft(attraction);
    },
    onSwipedRight: () => {
      setSwipeDirection('');
      onSwipeRight(attraction);
    },
    trackMouse: true
  });

  let cardStyle = {};
  if (swipeDirection === 'Left') {
    cardStyle = { transform: 'rotate(-10deg)' };
  } else if (swipeDirection === 'Right') {
    cardStyle = { transform: 'rotate(10deg)' };
  }

  return (
    <div {...handlers} className={styles.card} style={cardStyle}>
      <img src={attraction.image} alt={attraction.name} className={styles.image} />
      <div className={styles.details}>
        <h3>{attraction.name}</h3>
      </div>
    </div>
  );
};

export default CardSwipe;
