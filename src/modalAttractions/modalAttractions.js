import React, { useEffect, useState } from 'react';
import styles from './modalAttractions.module.scss';
import { FaLightbulb } from 'react-icons/fa';

const AttractionModal = ({ isOpen, onClose, attractionDetails }) => {
    const [averageWaitTimes, setAverageWaitTimes] = useState({ morning: null, afternoon: null, evening: null });

    useEffect(() => {
        if (isOpen) {
            fetch(`https://eurojourney.azurewebsites.net/api/wait-times/average-period/${attractionDetails._id}`)
                .then(response => response.json())
                .then(data => {
                    setAverageWaitTimes({
                        morning: data.morning !== null ? data.morning.toFixed(1) : null,
                        afternoon: data.afternoon !== null ? data.afternoon.toFixed(1) : null,
                        evening: data.evening !== null ? data.evening.toFixed(1) : null
                    });
                })
                .catch(error => console.error('Error fetching average wait times by period:', error));
        }
    }, [isOpen, attractionDetails._id]);

    if (!isOpen) return null;

    const allWaitTimesZero = () => {
        const { morning, afternoon, evening } = averageWaitTimes;
        return morning === null && afternoon === null && evening === null;
    };

    const getRecommendation = () => {
        if (attractionDetails.status === 'CLOSED' && !averageWaitTimes.morning && !averageWaitTimes.afternoon && !averageWaitTimes.evening) {
            return "Cette attraction est fermée pour le moment.";
        }
        if (allWaitTimesZero()) {
            return "Cette attraction est faisable toute la journée !";
        }

        const { morning, afternoon, evening } = averageWaitTimes;
        if (morning !== null && afternoon !== null && evening !== null) {
            const minWaitTime = Math.min(morning, afternoon, evening);
            if (minWaitTime === morning) return "Nous vous recommandons de faire cette attraction le matin.";
            if (minWaitTime === afternoon) return "Nous vous recommandons de faire cette attraction l'après-midi.";
            return "Nous vous recommandons de faire cette attraction le soir.";
        }
        return null;
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button className={styles.closeModal} onClick={onClose}>×</button>
                <h2 className={styles.attractionTitle}>{attractionDetails.name}</h2>
                <p className={styles.attractionDescription}>{attractionDetails.description}</p>
                {attractionDetails.status === 'CLOSED' && allWaitTimesZero() ? (
                    <div className={styles.hint}>
                        <p>Cette attraction est fermée pour le moment.</p>
                    </div>
                ) : allWaitTimesZero() ? (
                    <div className={styles.hint}>
                        <FaLightbulb className={styles.hintIcon} />
                        <p>Cette attraction est faisable toute la journée !</p>
                    </div>
                ) : (
                    <table className={styles.waitTimesTable}>
                        <thead>
                        <tr>
                            <th>Période</th>
                            <th>Temps d'attente moyen (minutes)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Matin</td>
                            <td>{averageWaitTimes.morning !== null ? averageWaitTimes.morning : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Après-midi</td>
                            <td>{averageWaitTimes.afternoon !== null ? averageWaitTimes.afternoon : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Soir</td>
                            <td>{averageWaitTimes.evening !== null ? averageWaitTimes.evening : 'Fermé'}</td>
                        </tr>
                        </tbody>
                    </table>
                )}
                <p>{getRecommendation()}</p>
            </div>
        </div>
    );
};

export default AttractionModal;
