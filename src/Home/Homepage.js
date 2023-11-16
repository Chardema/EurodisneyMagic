import React from 'react';
import { Link } from 'react-router-dom'; // Importez Link depuis react-router-dom
import Navbar from "../Navbar/Navbar";
import styles from './Homepage.module.scss';

const Homepage = () => {
    return (
        <div className={styles.body}>
            <Navbar />
            <div className={styles.container}>
                <h1 className={styles.Welcome}>Bienvenue sur MagicTrip</h1>
                <p>Cette application a plusieurs objectifs :</p>
                <ul className={styles.list}>
                    <li>Utilisation de l'IA pour vous proposer des voyages personnalisés</li>
                    {/* ... Autres éléments de la liste ... */}
                </ul>
                {/* Bouton pour naviguer vers les attractions */}
                <div className={styles.centerButton}>
                    <Link to="/attractions" className={styles.attractionsButton}>Découvrez les attractions</Link>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
