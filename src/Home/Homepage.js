import React from 'react';
import { Link } from 'react-router-dom'; // Importez Link depuis react-router-dom
import Navbar from "../Navbar/Navbar";
import styles from './Homepage.module.scss';
import useParkHours from "../FetchParkHours";
import Castle from './../img/DisneylandCastle.png'
import {formatTime} from '../utils'

const Homepage = () => {
    const parkHours = useParkHours();
    const now = new Date()

    const renderParkHours = () => {
        if (!parkHours || !parkHours.schedule) {
            return <p>Horaires non disponibles.</p>;
        }

        const todayStr = now.toISOString().split('T')[0];
        const todaySchedules = parkHours.schedule.filter(schedule => schedule.date === todayStr);

        const renderScheduleInfo = (schedules) => {
            const operatingSchedule = schedules.find(s => s.type === "OPERATING");
            const extraHoursSchedule = schedules.find(s => s.type === "EXTRA_HOURS");

            return (
                <>
                    {operatingSchedule && (
                        <p className={styles.schedule}>Aujourd'hui, Le Disneyland Park est ouvert entre {formatTime(operatingSchedule.openingTime)} et {formatTime(operatingSchedule.closingTime)}.</p>
                    )}
                    {extraHoursSchedule && (
                        <p className={styles.schedule}>Avec des EMT {formatTime(extraHoursSchedule.openingTime)} et {formatTime(extraHoursSchedule.closingTime)}.</p>
                    )}
                </>
            );
        };

        return (
            <>
                {renderScheduleInfo(todaySchedules)}
            </>
        );
    };

    return (
        <div className={styles.body}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.hours}>
                    <img className={styles.logo} src={Castle} alt="Castle Hours" />
                    {renderParkHours()}
                </div>
                {/* Bouton pour naviguer vers les attractions */}
                <div className={styles.centerButton}>
                    <Link to="/attractions" className={styles.attractionsButton}>Temps d'attente en direct</Link>
                </div>
            </div>
        </div>
    );
};

export default Homepage;


