// Fichier BottomNav.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMagic, FaTheaterMasks} from 'react-icons/fa'; // Exemple d'icônes
import { LuRollerCoaster } from "react-icons/lu";
import { MdSchedule } from "react-icons/md";
import styles from './mobileNavbar.module.scss';

const BottomNav = () => {
    return (
        <div className={styles.bottomNav}>
            <Link to="/" className={styles.navItem}>
                <MdSchedule className={styles.icon} />
                Horaires
            </Link>
            <Link to="/attractions" className={styles.navItem}>
                <LuRollerCoaster className={styles.icon} />
                Attractions
            </Link>
            <Link to="/spectacle" className={styles.navItem}>
                <FaTheaterMasks className={styles.icon} />
                Spectacle
            </Link>
            <Link to="/magicAITrip" className={styles.navItem}>
                <FaMagic className={styles.icon} />
                Magic AI
            </Link>
        </div>
    );
};

export default BottomNav;
