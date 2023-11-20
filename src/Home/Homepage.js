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

        const openingTime = new Date(todayStr + 'T' + operatingSchedule.openingTime);
        const closingTime = new Date(todayStr + 'T' + operatingSchedule.closingTime);
        const isParkOpen = now >= openingTime && now <= closingTime;

        if (!isParkOpen) {
            return <p className={styles.closedMessage}>{parkName} est actuellement fermé.</p>;
        }

        return (
            <>
                <p className={styles.schedule}>Aujourd'hui, {parkName} est ouvert entre {formatTime(operatingSchedule.openingTime)} et {formatTime(operatingSchedule.closingTime)}.</p>
                {extraHoursSchedule && (
                    <p className={styles.schedule}>Avec des Magic Hours entre {formatTime(extraHoursSchedule.openingTime)} et {formatTime(extraHoursSchedule.closingTime)}.</p>
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
