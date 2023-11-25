import React from 'react';
import Navbar from "../Navbar/Navbar";
import styles from './MagicAITrip.module.scss';
import BottomNav from "../mobileNavbar/mobileNavbar"; // Assurez-vous d'avoir ce fichier CSS
import castleImage from './../img/disneycastle.jpg';

const MagicAITrip = () => {
    return (
        <div>
        <div className={styles.magicAiTripContainer}>
            <Navbar />
            <img src={castleImage} alt="Disney Castle" className={styles.castleImage} />
            <div className={styles.content}>

                <h2>Planifiez Votre Aventure Magique à Disneyland Paris</h2>
                <p>Nous travaillons actuellement sur une expérience exceptionnelle pour vous !</p>
                <p>
                    Bientôt, grâce à l'intelligence artificielle, vous pourrez personnaliser votre voyage à Disneyland Paris comme jamais auparavant. Imaginez une visite parfaitement adaptée à vos goûts, vos intérêts et vos préférences.
                </p>
                <p>
                    Restez à l'écoute pour une aventure pleine de magie, d'innovation et de souvenirs inoubliables.
                </p>
            </div>

        </div>
            <BottomNav />
        </div>
    );
};

export default MagicAITrip;
