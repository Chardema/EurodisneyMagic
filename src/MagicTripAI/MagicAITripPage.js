import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from "../Navbar/Navbar";
import styles from './MagicAITrip.module.scss';
import BottomNav from "../mobileNavbar/mobileNavbar";
import { useWindowWidth } from '../utils';

const MagicAITrip = () => {
    const width = useWindowWidth();
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        parkChoice: 'both', // 'disneyland', 'studios', 'both'
        intensity: 'family', // 'family', 'thrill', 'mixed'
        duration: 'full', // 'morning', 'afternoon', 'full'
        priority: 'short-wait', // 'short-wait', 'popular', 'balanced'
        withKids: false,
        favoriteThemes: []
    });
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const attractions = useSelector(state => state.attractions.attractions) || [];

    const themes = [
        { id: 'adventure', name: 'Aventure', icon: '🗺️' },
        { id: 'fantasy', name: 'Fantaisie', icon: '✨' },
        { id: 'scifi', name: 'Science-Fiction', icon: '🚀' },
        { id: 'marvel', name: 'Super-héros', icon: '🦸' },
        { id: 'pirates', name: 'Pirates', icon: '🏴‍☠️' },
        { id: 'princess', name: 'Princesses', icon: '👑' }
    ];

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const toggleTheme = (themeId) => {
        setPreferences(prev => ({
            ...prev,
            favoriteThemes: prev.favoriteThemes.includes(themeId)
                ? prev.favoriteThemes.filter(t => t !== themeId)
                : [...prev.favoriteThemes, themeId]
        }));
    };

    const generateSmartPlan = () => {
        setLoading(true);

        setTimeout(() => {
            // Filtrer les attractions selon les préférences
            let filteredAttractions = attractions.filter(attr => attr.status === 'OPERATING');

            // Filtrer par parc
            if (preferences.parkChoice !== 'both') {
                filteredAttractions = filteredAttractions.filter(attr =>
                    preferences.parkChoice === 'disneyland'
                        ? attr.park === 'Disneyland Park'
                        : attr.park === 'Walt Disney Studios'
                );
            }

            // Calculer un score pour chaque attraction
            const scoredAttractions = filteredAttractions.map(attr => {
                let score = 100;
                const waitTime = attr.queue?.STANDBY?.waitTime || 0;

                // Score basé sur le temps d'attente
                if (preferences.priority === 'short-wait') {
                    score -= waitTime * 2; // Pénaliser fortement les longues attentes
                } else if (preferences.priority === 'popular') {
                    score += waitTime * 0.5; // Bonus pour les attractions populaires
                } else {
                    score -= waitTime * 0.5; // Équilibré
                }

                // Bonus pour les attractions adaptées aux enfants
                if (preferences.withKids && waitTime < 20) {
                    score += 20;
                }

                // Bonus pour les thèmes préférés
                if (preferences.favoriteThemes.length > 0) {
                    const attractionName = attr.name.toLowerCase();
                    preferences.favoriteThemes.forEach(themeId => {
                        if (
                            (themeId === 'adventure' && (attractionName.includes('jungle') || attractionName.includes('adventure'))) ||
                            (themeId === 'fantasy' && (attractionName.includes('fantasy') || attractionName.includes('alice') || attractionName.includes('peter'))) ||
                            (themeId === 'scifi' && (attractionName.includes('star') || attractionName.includes('space') || attractionName.includes('buzz'))) ||
                            (themeId === 'marvel' && (attractionName.includes('spider') || attractionName.includes('avengers') || attractionName.includes('iron'))) ||
                            (themeId === 'pirates' && attractionName.includes('pirate')) ||
                            (themeId === 'princess' && (attractionName.includes('princess') || attractionName.includes('belle') || attractionName.includes('frozen')))
                        ) {
                            score += 30;
                        }
                    });
                }

                return { ...attr, score, waitTime };
            });

            // Trier par score
            scoredAttractions.sort((a, b) => b.score - a.score);

            // Sélectionner les meilleures attractions (8-12 selon la durée)
            const numberOfAttractions = preferences.duration === 'full' ? 10 :
                preferences.duration === 'morning' ? 5 : 6;

            const selectedAttractions = scoredAttractions.slice(0, numberOfAttractions);

            // Organiser par ordre logique (même parc ensemble, temps d'attente optimal)
            const morningSlot = selectedAttractions.filter((_, i) => i < numberOfAttractions / 2);
            const afternoonSlot = selectedAttractions.filter((_, i) => i >= numberOfAttractions / 2);

            // Calculer les statistiques
            const totalWaitTime = selectedAttractions.reduce((sum, attr) => sum + attr.waitTime, 0);
            const averageWaitTime = Math.round(totalWaitTime / selectedAttractions.length);

            setGeneratedPlan({
                morning: morningSlot,
                afternoon: preferences.duration !== 'morning' ? afternoonSlot : [],
                stats: {
                    totalAttractions: selectedAttractions.length,
                    totalWaitTime,
                    averageWaitTime,
                    estimatedDuration: selectedAttractions.length * 20 + totalWaitTime // 20 min par attraction
                }
            });

            setLoading(false);
            setStep(3);
        }, 1500);
    };

    const renderStep1 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.header}>
                <h1>🎯 Planificateur Magique</h1>
                <p>Créez votre journée parfaite à Disneyland Paris !</p>
            </div>

            <div className={styles.section}>
                <h3>🏰 Quel parc souhaitez-vous visiter ?</h3>
                <div className={styles.optionGroup}>
                    <button
                        className={`${styles.optionButton} ${preferences.parkChoice === 'disneyland' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('parkChoice', 'disneyland')}
                    >
                        <span className={styles.icon}>🏰</span>
                        <span>Disneyland Park</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.parkChoice === 'studios' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('parkChoice', 'studios')}
                    >
                        <span className={styles.icon}>🎬</span>
                        <span>Walt Disney Studios</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.parkChoice === 'both' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('parkChoice', 'both')}
                    >
                        <span className={styles.icon}>⭐</span>
                        <span>Les deux parcs</span>
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <h3>⏰ Durée de votre visite</h3>
                <div className={styles.optionGroup}>
                    <button
                        className={`${styles.optionButton} ${preferences.duration === 'morning' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('duration', 'morning')}
                    >
                        <span className={styles.icon}>🌅</span>
                        <span>Demi-journée (matin)</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.duration === 'afternoon' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('duration', 'afternoon')}
                    >
                        <span className={styles.icon}>☀️</span>
                        <span>Demi-journée (après-midi)</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.duration === 'full' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('duration', 'full')}
                    >
                        <span className={styles.icon}>🌙</span>
                        <span>Journée complète</span>
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <h3>🎢 Type d'attractions préféré</h3>
                <div className={styles.optionGroup}>
                    <button
                        className={`${styles.optionButton} ${preferences.intensity === 'family' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('intensity', 'family')}
                    >
                        <span className={styles.icon}>👨‍👩‍👧‍👦</span>
                        <span>Familial</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.intensity === 'thrill' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('intensity', 'thrill')}
                    >
                        <span className={styles.icon}>🎢</span>
                        <span>Sensations fortes</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.intensity === 'mixed' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('intensity', 'mixed')}
                    >
                        <span className={styles.icon}>✨</span>
                        <span>Varié</span>
                    </button>
                </div>
            </div>

            <button className={styles.nextButton} onClick={() => setStep(2)}>
                Continuer ✨
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.header}>
                <h1>✨ Personnalisez votre expérience</h1>
                <p>Dites-nous en plus sur vos préférences</p>
            </div>

            <div className={styles.section}>
                <h3>🎯 Priorité de planification</h3>
                <div className={styles.optionGroup}>
                    <button
                        className={`${styles.optionButton} ${preferences.priority === 'short-wait' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('priority', 'short-wait')}
                    >
                        <span className={styles.icon}>⚡</span>
                        <span>Temps d'attente courts</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.priority === 'popular' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('priority', 'popular')}
                    >
                        <span className={styles.icon}>🔥</span>
                        <span>Attractions populaires</span>
                    </button>
                    <button
                        className={`${styles.optionButton} ${preferences.priority === 'balanced' ? styles.selected : ''}`}
                        onClick={() => handlePreferenceChange('priority', 'balanced')}
                    >
                        <span className={styles.icon}>⚖️</span>
                        <span>Équilibré</span>
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={preferences.withKids}
                        onChange={(e) => handlePreferenceChange('withKids', e.target.checked)}
                    />
                    <span>👶 Je visite avec de jeunes enfants</span>
                </label>
            </div>

            <div className={styles.section}>
                <h3>💫 Thèmes favoris (optionnel)</h3>
                <div className={styles.themeGrid}>
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            className={`${styles.themeButton} ${preferences.favoriteThemes.includes(theme.id) ? styles.selected : ''}`}
                            onClick={() => toggleTheme(theme.id)}
                        >
                            <span className={styles.themeIcon}>{theme.icon}</span>
                            <span>{theme.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={() => setStep(1)}>
                    ← Retour
                </button>
                <button className={styles.generateButton} onClick={generateSmartPlan}>
                    Générer mon plan ✨
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className={styles.stepContainer}>
            <div className={styles.header}>
                <h1>🎉 Votre journée magique est prête !</h1>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{generatedPlan.stats.totalAttractions}</span>
                        <span className={styles.statLabel}>Attractions</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{generatedPlan.stats.averageWaitTime} min</span>
                        <span className={styles.statLabel}>Attente moyenne</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{Math.round(generatedPlan.stats.estimatedDuration / 60)}h</span>
                        <span className={styles.statLabel}>Durée estimée</span>
                    </div>
                </div>
            </div>

            {generatedPlan.morning.length > 0 && (
                <div className={styles.section}>
                    <h3>🌅 Matin (9h-13h)</h3>
                    <div className={styles.attractionsList}>
                        {generatedPlan.morning.map((attr, index) => (
                            <div key={attr.id} className={styles.attractionCard}>
                                <div className={styles.attractionNumber}>{index + 1}</div>
                                <div className={styles.attractionInfo}>
                                    <h4>{attr.name}</h4>
                                    <p>{attr.park}</p>
                                </div>
                                <div className={styles.attractionWait}>
                                    <span className={styles.waitTime}>{attr.waitTime || 0}</span>
                                    <span className={styles.waitLabel}>min</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {generatedPlan.afternoon.length > 0 && (
                <div className={styles.section}>
                    <h3>☀️ Après-midi (14h-19h)</h3>
                    <div className={styles.attractionsList}>
                        {generatedPlan.afternoon.map((attr, index) => (
                            <div key={attr.id} className={styles.attractionCard}>
                                <div className={styles.attractionNumber}>{generatedPlan.morning.length + index + 1}</div>
                                <div className={styles.attractionInfo}>
                                    <h4>{attr.name}</h4>
                                    <p>{attr.park}</p>
                                </div>
                                <div className={styles.attractionWait}>
                                    <span className={styles.waitTime}>{attr.waitTime || 0}</span>
                                    <span className={styles.waitLabel}>min</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.tips}>
                <h3>💡 Conseils pour optimiser votre visite</h3>
                <ul>
                    <li>Arrivez 30 minutes avant l'ouverture pour profiter des premières heures moins fréquentées</li>
                    <li>Téléchargez l'application Disneyland Paris pour suivre les temps d'attente en temps réel</li>
                    <li>Pensez à réserver vos restaurants à l'avance</li>
                    <li>Profitez des parades pour faire les attractions populaires avec moins d'attente</li>
                </ul>
            </div>

            <button className={styles.restartButton} onClick={() => { setStep(1); setGeneratedPlan(null); }}>
                ← Créer un nouveau plan
            </button>
        </div>
    );

    return (
        <div>
            <div className={styles.magicAiTripContainer}>
                {width > 768 && <Navbar />}

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <h2>✨ Création de votre itinéraire magique...</h2>
                        <p>Analyse des temps d'attente et optimisation de votre parcours</p>
                    </div>
                ) : (
                    <>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default MagicAITrip;
