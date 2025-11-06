import React, { useEffect, useState } from 'react';
import styles from './modalAttractions.module.scss';
import { FaLightbulb, FaTimes } from 'react-icons/fa';
import WaitTimePrediction from '../Components/WaitTimePrediction';

const AttractionModal = ({ isOpen, onClose, attractionDetails }) => {
    const [averageWaitTimes, setAverageWaitTimes] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && attractionDetails) {
            setLoading(true);
            // Utiliser l'id correct (id au lieu de _id)
            const attractionId = attractionDetails.id || attractionDetails._id;

            fetch(`https://eurojourney.azurewebsites.net/api/wait-times/average-period/${attractionId}`)
                .then(response => response.json())
                .then(data => {
                    setAverageWaitTimes(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching average wait times by period:', error);
                    setAverageWaitTimes(null);
                    setLoading(false);
                });
        }
    }, [isOpen, attractionDetails]);

    if (!isOpen || !attractionDetails) return null;

    // Obtenir le statut actuel de l'attraction
    const currentWaitTime = attractionDetails.queue?.STANDBY?.waitTime;
    const status = attractionDetails.status;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeModal} onClick={onClose} aria-label="Fermer">
                    <FaTimes />
                </button>

                <div className={styles.modalHeader}>
                    <h2 className={styles.attractionTitle}>{attractionDetails.name}</h2>
                    <div className={styles.statusBadge}>
                        {status === 'OPERATING' && currentWaitTime > 0 ? (
                            <span className={styles.openBadge}>
                                ⏱️ {currentWaitTime} min
                            </span>
                        ) : status === 'CLOSED' ? (
                            <span className={styles.closedBadge}>🔒 Fermé</span>
                        ) : (
                            <span className={styles.openBadge}>✅ Ouvert</span>
                        )}
                    </div>
                </div>

                {attractionDetails.description && (
                    <p className={styles.attractionDescription}>{attractionDetails.description}</p>
                )}

                {/* Afficher les informations de base */}
                <div className={styles.infoSection}>
                    {attractionDetails.location && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>📍</span>
                            <span>{attractionDetails.location}</span>
                        </div>
                    )}
                    {attractionDetails.park && (
                        <div className={styles.infoItem}>
                            <span className={styles.infoIcon}>🏰</span>
                            <span>{attractionDetails.park}</span>
                        </div>
                    )}
                </div>

                {/* Composant de prédiction intelligente */}
                {loading ? (
                    <div className={styles.loadingPrediction}>
                        <div className={styles.spinner}></div>
                        <p>Analyse des données en cours...</p>
                    </div>
                ) : status === 'CLOSED' ? (
                    <div className={styles.closedMessage}>
                        <span className={styles.closedIcon}>🔒</span>
                        <h3>Attraction fermée</h3>
                        <p>Cette attraction est actuellement fermée. Consultez les horaires du parc pour plus d'informations.</p>
                    </div>
                ) : (
                    <WaitTimePrediction
                        attraction={attractionDetails}
                        historicalData={averageWaitTimes}
                    />
                )}

                {/* Astuce pour FastPass si applicable */}
                {currentWaitTime > 45 && status === 'OPERATING' && (
                    <div className={styles.fastPassTip}>
                        <FaLightbulb className={styles.tipIcon} />
                        <p><strong>Astuce :</strong> Avec un temps d'attente élevé, pensez à utiliser le service Premier Access si disponible !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttractionModal;
