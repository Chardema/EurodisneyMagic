import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.scss'
import './Navbar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const location = useLocation();
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        <nav className={styles.navbar}>
            <div className={menuOpen ? `${styles.menuIcon} ${styles.open}` : styles.menuIcon} onClick={toggleMenu}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ''}`}>
                <li><Link to="/" onClick={toggleMenu}>Accueil</Link></li>
                <li><Link to="/hours" onClick={toggleMenu}>Horaires</Link></li>
                <li><Link to="/attractions" onClick={toggleMenu}>Attractions</Link></li>
                <li><Link to="/spectacle" onClick={toggleMenu}>Spectacle</Link></li>
                <li><Link to="/magicAITrip" onClick={toggleMenu}>MagicAITrip</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
