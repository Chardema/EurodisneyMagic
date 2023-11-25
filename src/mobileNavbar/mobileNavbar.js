import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaMagic, FaTheaterMasks } from 'react-icons/fa';
import { LuRollerCoaster } from "react-icons/lu";
import { MdSchedule } from "react-icons/md";
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
                <LuRollerCoaster className={styles.icon} />
                Attractions
            </NavLink>
            <NavLink
                to="/spectacle"
                className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
            >
                <FaTheaterMasks className={styles.icon} />
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
