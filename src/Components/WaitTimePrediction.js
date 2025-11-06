import React, { useMemo } from 'react';
import styles from '../Styles/WaitTimePrediction.module.scss';

/**
 * Composant de prédiction des temps d'attente
 * Utilise des algorithmes pour prédire les meilleurs moments pour visiter une attraction
 */
const WaitTimePrediction = ({ attraction, historicalData }) => {
    // Calculer les prédictions basées sur les données historiques
    const predictions = useMemo(() => {
        if (!historicalData || !historicalData.morning || !historicalData.afternoon || !historicalData.evening) {
            return null;
        }

        const { morning, afternoon, evening } = historicalData;

        // Déterminer la meilleure période
        const periods = [
            { name: 'Matin', time: '9h-12h', average: morning.average, icon: '🌅', count: morning.count },
            { name: 'Après-midi', time: '12h-18h', average: afternoon.average, icon: '☀️', count: afternoon.count },
            { name: 'Soirée', time: '18h-23h', average: evening.average, icon: '🌙', count: evening.count }
        ].filter(p => p.average !== null && p.average > 0);

        if (periods.length === 0) {
            return {
                bestTime: null,
                recommendation: "Pas encore assez de données pour faire une prédiction précise.",
                confidence: 0
            };
        }

        // Trier par temps d'attente croissant
        periods.sort((a, b) => a.average - b.average);

        const bestPeriod = periods[0];
        const worstPeriod = periods[periods.length - 1];

        // Calculer le niveau de confiance basé sur le nombre de données
        const totalCount = periods.reduce((sum, p) => sum + p.count, 0);
        const confidence = Math.min(100, Math.floor((totalCount / 50) * 100));

        // Générer une recommandation intelligente
        let recommendation = '';
        const timeDifference = worstPeriod.average - bestPeriod.average;

        if (timeDifference < 10) {
            recommendation = `L'affluence est relativement stable toute la journée. Le ${bestPeriod.name.toLowerCase()} reste le meilleur moment avec environ ${bestPeriod.average} min d'attente.`;
        } else if (timeDifference < 20) {
            recommendation = `Le ${bestPeriod.name.toLowerCase()} est légèrement moins fréquenté avec environ ${bestPeriod.average} min d'attente, contre ${worstPeriod.average} min en ${worstPeriod.name.toLowerCase()}.`;
        } else {
            recommendation = `⭐ Meilleur moment : ${bestPeriod.name} (${bestPeriod.time}) avec seulement ${bestPeriod.average} min d'attente ! Évitez la ${worstPeriod.name.toLowerCase()} où l'attente peut atteindre ${worstPeriod.average} min.`;
        }

        // Ajouter des insights supplémentaires
        const insights = [];

        if (bestPeriod.name === 'Matin') {
            insights.push('💡 Astuce : Arrivez dès l\'ouverture pour profiter de l\'attraction presque sans attente.');
        }

        if (worstPeriod.name === 'Après-midi') {
            insights.push('🎭 Profitez de l\'après-midi pour voir les spectacles pendant que les files sont longues.');
        }

        if (bestPeriod.average < 15) {
            insights.push('🎉 Cette attraction est généralement peu fréquentée, parfait pour les familles !');
        } else if (bestPeriod.average > 45) {
            insights.push('⚡ Attraction très populaire ! Utilisez FastPass si disponible.');
        }

        return {
            bestTime: bestPeriod,
            worstTime: worstPeriod,
            allPeriods: periods,
            recommendation,
            insights,
            confidence,
            timeSaved: timeDifference
        };
    }, [historicalData]);

    if (!predictions) {
        return (
            <div className={styles.predictionContainer}>
                <div className={styles.noPrediction}>
                    <span className={styles.icon}>🔮</span>
                    <p>Collecte de données en cours...</p>
                    <small>Revenez bientôt pour des prédictions personnalisées !</small>
                </div>
            </div>
        );
    }

    if (!predictions.bestTime) {
        return (
            <div className={styles.predictionContainer}>
                <div className={styles.noPrediction}>
                    <span className={styles.icon}>📊</span>
                    <p>{predictions.recommendation}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.predictionContainer}>
            <div className={styles.header}>
                <h3>🎯 Prédiction Intelligente</h3>
                <div className={styles.confidence}>
                    <span className={styles.label}>Fiabilité</span>
                    <div className={styles.confidenceBar}>
                        <div
                            className={styles.confidenceFill}
                            style={{ width: `${predictions.confidence}%` }}
                        />
                    </div>
                    <span className={styles.value}>{predictions.confidence}%</span>
                </div>
            </div>

            <div className={styles.recommendation}>
                <span className={styles.magicIcon}>✨</span>
                <p>{predictions.recommendation}</p>
            </div>

            {predictions.timeSaved > 15 && (
                <div className={styles.timeSaved}>
                    <span className={styles.clockIcon}>⏱️</span>
                    <p>Économisez jusqu'à <strong>{predictions.timeSaved} minutes</strong> en choisissant le bon moment !</p>
                </div>
            )}

            <div className={styles.periodsChart}>
                {predictions.allPeriods.map((period, index) => (
                    <div
                        key={period.name}
                        className={`${styles.periodCard} ${index === 0 ? styles.best : ''} ${index === predictions.allPeriods.length - 1 ? styles.worst : ''}`}
                    >
                        <div className={styles.periodIcon}>{period.icon}</div>
                        <div className={styles.periodInfo}>
                            <h4>{period.name}</h4>
                            <span className={styles.periodTime}>{period.time}</span>
                        </div>
                        <div className={styles.periodWait}>
                            <span className={styles.waitTime}>{period.average}</span>
                            <span className={styles.waitLabel}>min</span>
                        </div>
                        {index === 0 && (
                            <div className={styles.bestBadge}>Meilleur moment</div>
                        )}
                    </div>
                ))}
            </div>

            {predictions.insights && predictions.insights.length > 0 && (
                <div className={styles.insights}>
                    <h4>💡 Astuces Disney Magic</h4>
                    {predictions.insights.map((insight, index) => (
                        <div key={index} className={styles.insight}>
                            {insight}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.disclaimer}>
                <small>
                    * Prédictions basées sur {predictions.allPeriods.reduce((sum, p) => sum + p.count, 0)} données collectées.
                    Les temps réels peuvent varier selon la saison et les événements spéciaux.
                </small>
            </div>
        </div>
    );
};

export default WaitTimePrediction;
