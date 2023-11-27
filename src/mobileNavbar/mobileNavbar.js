import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaMagic } from 'react-icons/fa';
import { MdSchedule, MdAttractions } from "react-icons/md";
import { RiSparkling2Fill } from "react-icons/ri";
import styles from './mobileNavbar.module.scss';

const BottomNav = () => {
    return (
        <div className={styles.bottomNav}>
            <NavLink
                to="/"
                className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
            >
                <MdSchedule className={styles.icon} />
                Horaires
            </NavLink>
            <NavLink
                to="/attractions"
                className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
            >
                <MdAttractions className={styles.icon} />
                Attractions
            </NavLink>
            <NavLink
                to="/spectacle"
                className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
            >
                <RiSparkling2Fill className={styles.icon} />
                Spectacle
            </NavLink>
            <NavLink
                to="/magicAITrip"
                className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
            >
                <FaMagic className={styles.icon} />
                Magic AI
            </NavLink>
        </div>
    );
};

export default BottomNav;
