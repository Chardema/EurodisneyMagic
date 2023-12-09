import React, {useEffect, useState} from 'react';
import Navbar from "../Navbar/Navbar";
import BottomNav from "../mobileNavbar/mobileNavbar";
import styles from './appHome.module.scss'; // Votre fichier CSS pour la page d'accueil
import { useWindowWidth } from '../utils';
import { formatImageName, importImage } from '../utils';
import backgroundImage from './../img/MickeysDazzlingChristmasParade.jpg';
import {Link} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setFavorites} from "../redux/actions";



const HomePage = () => {
    const reduxFavorites = useSelector(state => state.favorites.favorites);
    const attractions = useSelector(state => state.attractions.attractions);
    const dispatch = useDispatch();
    const width = useWindowWidth();
    const attractionImages = reduxFavorites.reduce((acc, favorite) => {
        const imageName = formatImageName(favorite.name);
        acc[favorite.name] = importImage(imageName);
        return acc;
    }, {});


    const updateFavorites = (favorites, attractions) => {
        return favorites.map(favorite => {
            const updatedAttraction = attractions.find(attr => attr.id === favorite.id);
            return updatedAttraction
                ? { ...favorite, waitTime: updatedAttraction.waitTime, status: updatedAttraction.status }
                : favorite;
        });
    };
    // Chargement initial des favoris depuis localStorage
    // Mise à jour des favoris Redux lorsque les attractions changent
    useEffect(() => {
        const updatedFavorites = updateFavorites(reduxFavorites, attractions);
        // Effectuez une vérification pour voir si les favoris ont réellement changé
        if (JSON.stringify(updatedFavorites) !== JSON.stringify(reduxFavorites)) {
            dispatch(setFavorites(updatedFavorites));
        }
    }, [attractions, dispatch]);



    const getWaitTimeColor = (attraction) => {
        if (attraction.status === 'CLOSED') {
            return styles.gray; // ou une autre couleur représentant une attraction fermée
        } else if (attraction.status === 'DOWN') {
            return styles.gray; // ou une autre couleur pour les attractions indisponibles
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
                            <h3>Vos Favoris</h3>
                            {reduxFavorites.map(favorite => (
                                <div key={favorite.id} className={styles.attractionscard}>
                                    <img src={attractionImages[favorite.name]} alt={favorite.name} className={styles.favoriteImage} />
                                    <h3>{favorite.name}</h3>
                                    <div className={`${styles.waitTimeCircle} ${getWaitTimeColor(favorite)}`}>
                                        {favorite.status === 'CLOSED' ? 'Fermée' :
                                            favorite.status === 'DOWN' ? 'Indispo' :
                                                favorite.waitTime === null ? 'Direct' : `${favorite.waitTime} min`}
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