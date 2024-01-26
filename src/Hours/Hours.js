import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import styles from './Hours.module.scss';
import useParkHours from "../FetchParkHours";
import Castle from './../img/Disneylandlogo.png';
import Studios from './../img/Studioslogo.png';
import { TiWeatherCloudy } from "react-icons/ti";
import { formatTime, useWindowWidth } from '../utils';
import BottomNav from "../mobileNavbar/mobileNavbar";
import { useWeather, useWeatherForecast } from "../weather";

const Hours = () => {
    const parkHours = useParkHours();
    const width = useWindowWidth();
    const weather = useWeather();
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

    };

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
        if (!schedules) {
            return <p>Horaires de {parkName} non disponibles.</p>;
        }

        const selectedDaySchedules = getSchedulesForDate(schedules, date);
        const operatingSchedule = selectedDaySchedules.find(s => s.type === "OPERATING");
        const extraHoursSchedule = selectedDaySchedules.find(s => s.type === "EXTRA_HOURS");

        if (!operatingSchedule && !extraHoursSchedule) {
            return <p className={styles.closedMessage}>{parkName} est actuellement fermé. Pas d'horaires disponibles pour le jour sélectionné.</p>;
        }

        return (
            <>
                {operatingSchedule && (
                    <p className={styles.schedule}>
                        {formatTime(new Date(operatingSchedule.openingTime))} - {formatTime(new Date(operatingSchedule.closingTime))}
                    </p>
                )}
                {extraHoursSchedule && (
                    <p className={styles.schedule}>
                        Extra Magic Hours: {formatTime(new Date(extraHoursSchedule.openingTime))} - {formatTime(new Date(extraHoursSchedule.closingTime))}
                    </p>
                )}

            </>
        );
    };


    return (
        <div className={styles.body}>
            {width > 768 && <Navbar />}
            <div className={styles.container}>
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
                <div className={styles.allparks}>
                    <div className={styles.disneyland}>
                        <div className={styles.hours}>
                            <img className={styles.logo} src={Castle} alt="Disneyland Park Hours" />
                            {renderScheduleInfo(parkHours?.disneyland?.schedule, "Le Parc Disneyland", selectedDay)}
                        </div>
                    </div>
                    <div className={styles.studios}>
                        <div className={styles.hours}>
                            <img className={styles.logo} src={Studios} alt="Studio Park Hours" />
                            {renderScheduleInfo(parkHours?.studio?.schedule, "Les Walt Disney Studios", selectedDay)}
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default Hours;
