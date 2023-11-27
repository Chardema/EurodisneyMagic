import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import styles from './Homepage.module.scss';
import useParkHours from "../FetchParkHours";
import Castle from './../img/Disneylandlogo.png';
import Studios from './../img/Studioslogo.png';
import { TiWeatherCloudy } from "react-icons/ti";
import {formatTime, useWindowWidth} from '../utils';
import BottomNav from "../mobileNavbar/mobileNavbar";
import useWeather from "../weather";

const Homepage = () => {
    const parkHours = useParkHours();
    const now = new Date();
    const width = useWindowWidth()
    const weather = useWeather();

    const getSchedulesForDate = (schedules, date) => {
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter(schedule => schedule.date === dateStr);
    };

    const renderScheduleInfo = (schedules, parkName) => {
        if (!schedules) {
            return <p>Horaires de {parkName} non disponibles.</p>;
        }

        const todaySchedules = getSchedulesForDate(schedules, now);
        const operatingScheduleToday = todaySchedules.find(s => s.type === "OPERATING");

        if (!operatingScheduleToday) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowSchedules = getSchedulesForDate(schedules, tomorrow);
            const operatingScheduleTomorrow = tomorrowSchedules.find(s => s.type === "OPERATING");

            if (!operatingScheduleTomorrow) {
                return <p className={styles.closedMessage}>{parkName} est actuellement fermé. Pas d'horaires disponibles pour demain.</p>;
            }

            const openingTimeTomorrow = new Date(operatingScheduleTomorrow.openingTime);
            const closingTimeTomorrow = new Date(operatingScheduleTomorrow.closingTime);

            return (
                <p className={styles.closedMessage}>
                    {parkName} est actuellement fermé. <br/> Demain, il sera ouvert de {formatTime(openingTimeTomorrow)} à {formatTime(closingTimeTomorrow)}.
                </p>
            );
        }

        const extraHoursSchedule = todaySchedules.find(s => s.type === "EXTRA_HOURS");
        const openingTime = extraHoursSchedule ? new Date(extraHoursSchedule.openingTime) : new Date(operatingScheduleToday.openingTime);
        const closingTime = new Date(operatingScheduleToday.closingTime);
        const isParkOpen = now >= openingTime && now <= closingTime;

        if (!isParkOpen) {
            return <p className={styles.closedMessage}>{parkName} est actuellement fermé.</p>;
        }

        return (
            <>
                <p className={styles.schedule}> {formatTime(openingTime)} - {formatTime(closingTime)}.</p>
                {extraHoursSchedule && (
                    <p className={styles.schedule}>les Magic Hours sont entre {formatTime(extraHoursSchedule.openingTime)} et {formatTime(operatingScheduleToday.openingTime)}.</p>
                )}
            </>
        );
    };

    return (
        <div className={styles.body}>
            {width > 768 && <Navbar />}
            <div className={styles.container}>
                <div className={styles.weatherInfo}>
                    {weather && (
                        <div>
                            <p> <TiWeatherCloudy size={40} />  {Math.round(weather.main.temp)}°C </p>
                        </div>
                    )}
                </div>
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
                            {renderScheduleInfo(parkHours?.studio?.schedule, "Les Walt Disney Studios")}
                        </div>
                    </div>
                </div>
                <div className={styles.Buttoncontainer}>
                    <div className={styles.centerButton}>
                        <Link to="/attractions" className={styles.attractionsButton}>Temps d'attente en direct</Link>
                    </div>
                    <div className={styles.centerButton}>
                        <Link to="/spectacle" className={styles.attractionsButton}>Prochaine représentation spectacle</Link>
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default Homepage;
