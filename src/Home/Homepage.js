import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import styles from './Homepage.module.scss';
import useParkHours from "../FetchParkHours";
import Castle from './../img/Disneylandlogo.png';
import Studios from './../img/Studioslogo.png';
import { formatTime } from '../utils';

const Homepage = () => {
    const parkHours = useParkHours();
    const now = new Date();

    const renderScheduleInfo = (schedules, parkName) => {
        if (!schedules) {
            return <p>Horaires de {parkName} non disponibles.</p>;
        }
    
        const todayStr = now.toISOString().split('T')[0];
        const todaySchedules = schedules.filter(schedule => schedule.date === todayStr);
        const operatingSchedule = todaySchedules.find(s => s.type === "OPERATING");
        const extraHoursSchedule = todaySchedules.find(s => s.type === "EXTRA_HOURS");
    
        if (!operatingSchedule) {
            return <p className={styles.closedMessage}>{parkName} est actuellement fermé.</p>;
        }
    
        // Utiliser les Extra Magic Hours pour l'heure d'ouverture, si disponibles
        const openingTime = extraHoursSchedule ? new Date(extraHoursSchedule.openingTime) : new Date(operatingSchedule.openingTime);
    
        // Utiliser l'horaire d'opération normal pour l'heure de fermeture
        const closingTime = new Date(operatingSchedule.closingTime);
    
        const isParkOpen = now >= openingTime && now <= closingTime;
    
        if (!isParkOpen) {
            return <p className={styles.closedMessage}>{parkName} est actuellement fermé.</p>;
        }
        console.log("Opening Time:", openingTime);
        console.log("Closing Time:", closingTime);
        console.log("Current Time:", now);
        console.log("Is Park Open:", isParkOpen);

    
        return (
            <>
                <p className={styles.schedule}>{parkName} est ouvert entre {formatTime(openingTime)} et {formatTime(closingTime)}.</p>
                {extraHoursSchedule && (
                    <p className={styles.schedule}>Avec des Magic Hours entre {formatTime(extraHoursSchedule.openingTime)} et {formatTime(operatingSchedule.openingTime)}.</p>
                )}
            </>
        );
    };



    return (
        <div className={styles.body}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.allparks}>
                    <div className={styles.disneyland}>
                        <div className={styles.hours}>
                            <img className={styles.logo} src={Castle} alt="Disneyland Park Hours" />
                            {renderScheduleInfo(parkHours?.disneyland?.schedule, "Le Parc Disneyland")}
                        </div>
                    </div>
                    <div className={styles.studios}>
                        <div className={styles.hours}>
                            <img className={styles.logo} src={Studios} alt="Studio Park Hours" />
                            {renderScheduleInfo(parkHours?.studio?.schedule, "Le Parc Walt Disney Studios")}
                        </div>
                    </div>
                </div>
                <div className={styles.centerButton}>
                    <Link to="/attractions" className={styles.attractionsButton}>Temps d'attente en direct</Link>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
