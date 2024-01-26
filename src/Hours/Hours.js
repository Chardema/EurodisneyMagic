import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import styles from './Hours.module.scss';
import useParkHours from "../FetchParkHours";
import Castle from './../img/Disneylandlogo.png';
import Studios from './../img/Studioslogo.png';
import { TiWeatherCloudy } from "react-icons/ti";
import {formatTime, useWindowWidth} from '../utils';
import BottomNav from "../mobileNavbar/mobileNavbar";
import useWeather from "../weather";

const Hours = () => {
    const parkHours = useParkHours();
    const now = new Date();
    const width = useWindowWidth()
    const weather = useWeather();
<<<<<<<< HEAD:src/Home/Homepage.js
========
    const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
    const [showWeatherInfo, setShowWeatherInfo] = useState(false);
    const weatherForecast = useWeatherForecast(selectedDay);
    const todayString = new Date().toISOString().split('T')[0];
    const maxDateString = new Date();
    maxDateString.setDate(maxDateString.getDate() + 30); // ou une autre logique si vous avez une date limite spécifique pour les horaires du parc
    const maxDateStringFormatted = maxDateString.toISOString().split('T')[0];
    const maxForecastDate = new Date();
    maxForecastDate.setDate(maxForecastDate.getDate() + 5); // 5 jours à partir d'aujourd'hui
    const isForecastAvailable = new Date(selectedDay) < maxForecastDate;

    const weatherDescriptions = {
        "clear sky": "ciel clair",
        "few clouds": "uelques nuages",
        "scattered clouds": "Nuages dispersés",
        "broken clouds": "Nuages brisés",
        "shower rain": "Pluie d'averse",
        "thunderstorm": "Orage",
        "snow": "Neige",
        "mist": "Brume",
        "moderate rain": "Pluie modérée",
        "Rain": "Pluie",
        "Clouds": "Nuageux",
>>>>>>>> 6cad6c9 (Modif esthétique):src/Hours/Hours.js

    const getSchedulesForDate = (schedules, date) => {
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter(schedule => schedule.date === dateStr);
    };

<<<<<<<< HEAD:src/Home/Homepage.js
    const renderScheduleInfo = (schedules, parkName) => {
========
    const toggleWeatherInfo = () => {
        setShowWeatherInfo(!showWeatherInfo);
    };
    const isToday = (dateString) => {
        const today = new Date().toISOString().split('T')[0];
        return dateString === today;
    };

    const getSchedulesForDate = (schedules, dateString) => {
        return schedules.filter(schedule => schedule.date === dateString);
    };

    const goToToday = () => {
        setSelectedDay(new Date().toISOString().split('T')[0]);
    };

    const changeDay = (increment) => {
        setSelectedDay(prevDay => {
            let tempDate = new Date(prevDay);
            tempDate.setDate(tempDate.getDate() + increment);
            return tempDate.toISOString().split('T')[0];
        });
    };

    const renderScheduleInfo = (schedules, parkName, date) => {
>>>>>>>> 6cad6c9 (Modif esthétique):src/Hours/Hours.js
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
<<<<<<<< HEAD:src/Home/Homepage.js
                <div className={styles.weatherInfo}>
                    {weather && (
                        <div>
                            <p> <TiWeatherCloudy size={40} />  {Math.round(weather.main.temp)}°C </p>
                        </div>
                    )}
                </div>
========
                <button onClick={toggleWeatherInfo} className={styles.showWeatherButton}>
                    {showWeatherInfo ? 'Masquer' : 'Changer de date'}
                </button>
                {showWeatherInfo && (
                    <>
                        <div className={`${styles.dateChangePanel} ${showWeatherInfo ? styles.dateChangePanelOpen : ''}`}>
                        {selectedDay !== todayString && (
                            <div className={styles.todayButtonContainer}>
                                <button onClick={function(event){ goToToday(); setShowWeatherInfo(false)}} className={styles.todayButton}>Aujourd'hui</button>
                            </div>
                        )}
                        <div className={styles.datePickerContainer}>
                            <input
                                type="date"
                                value={selectedDay}
                                onChange={e => {
                                    setSelectedDay(e.target.value);
                                    setShowWeatherInfo(false); // Ajoutez ceci pour fermer le panneau
                                }}
                                min={todayString}
                                max={maxDateStringFormatted}
                                className={styles.datePicker}
                            />
                        </div>
                   </div>
                    </>
                )}
                    <div className={styles.weatherInfo}>
                        {isToday(selectedDay) && weather && weather.main && (
                            <div>
                                <img
                                    src={`https://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                                    alt="Weather Icon"
                                    width={40}
                                    height={40}
                                />
                                <p> {Math.round(weather.main.temp)}°C </p>
                            </div>
                        )}
                        {!isToday(selectedDay) && isForecastAvailable && weatherForecast && weatherForecast.length > 0 ? (
                            <div>
                                <img
                                    src={`https://openweathermap.org/img/w/${weatherForecast[0].weather[0].icon}.png`}
                                    alt="Weather Icon"
                                    width={40}
                                    height={40}
                                />
                                <p>{Math.round(weatherForecast[0].main.temp)}°C</p>
                                <p>Prévisions : {weatherDescriptions[weatherForecast[0].weather[0].main] || weatherForecast[0].weather[0].main}</p>
                            </div>
                        ) : (
                            !isToday(selectedDay) && !isForecastAvailable && <p>Les prévisions météorologiques ne sont pas encore disponibles pour cette date.</p>
                        )}
                    </div>
>>>>>>>> 6cad6c9 (Modif esthétique):src/Hours/Hours.js
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
            </div>
            <BottomNav />
        </div>
    );
};

export default Hours;
