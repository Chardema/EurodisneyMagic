import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.scss';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <ul className={styles.navLinks}>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/hours">Horaires</Link></li>
                <li><Link to="/attractions">Attractions</Link></li>
                <li><Link to="/spectacle">Spectacle</Link></li>
                <li><Link to="/magicAITrip">MagicAITrip</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
