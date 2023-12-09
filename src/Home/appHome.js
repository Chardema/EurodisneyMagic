import React from 'react';
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import styles from './appHome.module.scss'; // Votre fichier CSS pour la page d'accueil
import { useWindowWidth } from '../utils';
import { formatImageName, importImage } from '../utils';

const HomePage = ({ favorites }) => {
    const width = useWindowWidth();
    const attractionImages = favorites.reduce((acc, favorite) => {
        const imageName = formatImageName(favorite.name);
        acc[favorite.name] = importImage(imageName);
        return acc;
    }, {});

    const getWaitTimeColor = (waitTime) => {
        if (waitTime <= 15) {
            return styles.green;
        } else if (waitTime <= 30) {
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
                </div>
            </div>
            <div className={styles.bottomcontainer}>
                <div className={styles.content}>
                    <div className={styles.attractionsSection}>
                        {favorites.map(favorite => (
                            <div key={favorite.id} className={styles.attractionscard}>
                                <img src={attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
                                <h3>{favorite.name}</h3>
                                <div className={`${styles.waitTimeCircle} ${getWaitTimeColor(favorite.waitTime)}`}>
                                    {favorite.waitTime === null ? 'Instantanée' : `${favorite.waitTime} min`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default HomePage;