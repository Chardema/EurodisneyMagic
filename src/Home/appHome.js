import React, {useEffect} from 'react';
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import styles from './appHome.module.scss'; // Votre fichier CSS pour la page d'accueil
import { useWindowWidth } from '../utils';
import { formatImageName, importImage } from '../utils';
import backgroundImage from './../img/MickeysDazzlingChristmasParade.jpg';
import {Link} from "react-router-dom";


const HomePage = ({ favorites, setFavorites, attractions }) => {
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
    useEffect(() => {
        if (attractions && Array.isArray(attractions)) { // Vérifiez que attractions est défini et est un tableau
            const updatedFavorites = favorites.map(favorite => {
                const matchingAttraction = attractions.find(attraction => attraction.id === favorite.id);
                return matchingAttraction
                    ? { ...favorite, waitTime: matchingAttraction.waitTime }
                    : favorite;
            });
            setFavorites(updatedFavorites);
        }
    }, [favorites, attractions, setFavorites]);

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
                    {favorites.length > 0 ? (
                        <div className={styles.attractionsSection}>
                            <h3>Vos Favoris</h3>
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
                    ) : (
                        <div className={styles.noFavoritesMessage}>
                            <p>Vous n'avez pas encore de favoris.</p>
                            <Link to="/attractions" className={styles.linkButton}>
                                Découvrez les attractions
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default HomePage;