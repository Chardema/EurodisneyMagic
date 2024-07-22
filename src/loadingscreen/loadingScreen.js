import React, { useState, useEffect } from 'react';
import styles from './loadingScreen.module.scss';

const secrets = [
    "Les meilleures vues pour les parades se trouvent près de Main Street USA.",
    "Il y a des oreilles de Mickey cachées partout dans le parc, pouvez-vous les trouver? Il y en a plus de 43 qui ont déjà était découvert !",
    "Les attractions les plus populaires sont souvent plus calmes pendant les parades.",
    "L'affluence à Pirate des caraïbes est plus faible en soirée.",
    "Le parc a ouvert ses portes en 1992, le 12 avril précisément.",
    "La disney Electrical Sky Parade est un hommage à la Main Street Electrical Parade",
    "Disneyland Paris détient le record du monde de drone volant en même temps depuis le 14 juillet 2024",
    "Avengers Campus est la dernière nouveauté du parc, ouvert en 2022",
    "Disneyland Paris à bien failli fermer ses portes, c'est Space Mountain qui a sauvé le parc",
    "Nous vous recommandons de commencer votre visite par les Studios",
    "Disneyland Paris est plus fréquenté que la tour eiffel !",
];

const getRandomSecret = () => {
    return secrets[Math.floor(Math.random() * secrets.length)];
};

const LoadingScreen = ({ onLoadingComplete }) => {
    const [secret, setSecret] = useState('');

    useEffect(() => {
        setSecret(getRandomSecret());
        const timer = setTimeout(() => {
            onLoadingComplete();
        }, 5000); // Simule un chargement de 3 secondes

        return () => clearTimeout(timer);
    }, [onLoadingComplete]);

    return (
        <div className={styles.loadingScreen}>
            <h1 className={styles.title}>Magic Journey</h1>
            <div className={styles.spinner}></div>
            <p className={styles.secret}>{secret}</p>
        </div>
    );
};

export default LoadingScreen;
