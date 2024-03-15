import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './popupSurvey.module.scss';
import { FaClock, FaHome, FaLaughBeam } from 'react-icons/fa';
import { TbRollercoaster } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { toggleFavorite } from '../redux/actions';
import CardSwipe from '../CardSwipe/CardSwipe';

const questionIcons = {
  0: <FaHome className={styles.icon} />,
  1: <TbRollercoaster className={styles.icon} />,
  2: <FaLaughBeam className={styles.icon} />,
  3: <FaClock className={styles.icon} />,
};

const questions = [
  {
    question: "Bonjour et Bienvenue dans Magic Journey, l'application qui vous fera profiter au maximum de Disneyland Paris",
    answers: ['Suivant'],
    type: 'intro',
  },
  {
    question: "Commençons par vous poser quelques questions afin de vous proposer votre première attraction",
    answers: ['Suivant'],
    type: 'intro',
  },
  {
    question: "Quel type d'attractions préférez-vous ?",
    answers: ['Famille', 'Sensation', "Sans file d'attente", 'Rencontre avec les personnages'],
    type: 'typePreference',
  },
  {
    question: "Quelle durée d'attente est acceptable pour vous ?",
    answers: ['Moins de 15 minutes', '15-30 minutes', '30-60 minutes', 'Plus de 60 minutes'],
    type: 'waitTimePreference',
  },
];

const PopupSurvey = ({ onClose, attractions }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    typePreference: [],
    waitTimePreference: '',
  });
  const [currentAttractionIndex, setCurrentAttractionIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedPreferences = JSON.parse(localStorage.getItem('userPreferences'));
    if (storedPreferences) {
      // Assurez-vous que cette mise à jour d'état tient compte des préférences stockées
      setResponses({
        typePreference: storedPreferences.typePreference || [],
        waitTimePreference: storedPreferences.waitTimePreference || '',
      });
    }
  }, []);
  

  const recommendedAttractions = useMemo(() => {
    if (!attractions || !responses.typePreference.length) return [];
  
    let maxWaitTime;
    switch (responses.waitTimePreference) {
      case 'Moins de 15 minutes': maxWaitTime = 15; break;
      case '15-30 minutes': maxWaitTime = 30; break;
      case '30-60 minutes': maxWaitTime = 60; break;
      case 'Plus de 60 minutes': maxWaitTime = Infinity; break;
      default: maxWaitTime = Infinity;
    }
  
    return attractions.filter(attraction =>
        (responses.typePreference.length === 0 || responses.typePreference.some(type => attraction.type.includes(type))) &&
        attraction.waitTime <= maxWaitTime
      );
    }, [attractions, responses]);

  const onSwipeLeft = useCallback(() => {
    if (currentAttractionIndex < recommendedAttractions.length - 1) {
      setCurrentAttractionIndex(current => current + 1);
    }
  }, [currentAttractionIndex, recommendedAttractions.length]);

  const onSwipeRight = useCallback((attraction) => {
    dispatch(toggleFavorite(attraction));
    if (currentAttractionIndex < recommendedAttractions.length - 1) {
      setCurrentAttractionIndex(current => current + 1);
    }
  }, [dispatch, currentAttractionIndex, recommendedAttractions.length]);

  const handleAnswer = useCallback((answer, type) => {
    setResponses(current => ({
      ...current,
      [type]: type === 'typePreference'
        ? current.typePreference.includes(answer)
          ? current.typePreference.filter(item => item !== answer)
          : [...current.typePreference, answer]
        : answer,
    }));
    setCurrentStep(current => current + 1);
  }, []);

  useEffect(() => {
    if (currentStep === questions.length) {
      localStorage.setItem('userPreferences', JSON.stringify(responses));
    }
  }, [currentStep, responses]);
  const allAttractionsSwiped = currentAttractionIndex >= recommendedAttractions.length;

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popup}>
        {currentStep < questions.length ? (
          <>
            {questionIcons[currentStep]}
            <h2>{questions[currentStep].question}</h2>
            {questions[currentStep].answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(answer, questions[currentStep].type)}
                className={`${styles.answerButton} ${(responses[questions[currentStep].type] || []).includes(answer) ? styles.selected : ''}`}

              >
                {answer}
              </button>
            ))}
          </>
        ) : (
          <>
            <h2>Attractions recommandées pour vous</h2>
            {recommendedAttractions.length > 0 ? (
                <>
                {!allAttractionsSwiped ?(
              <CardSwipe
                key={recommendedAttractions[currentAttractionIndex].id}
                attraction={recommendedAttractions[currentAttractionIndex]}
                onSwipeLeft={() => onSwipeLeft()}
                onSwipeRight={() => onSwipeRight(recommendedAttractions[currentAttractionIndex])}
              />
                ) : ( 
                    <p>Toutes les attractions recommandées ont été parcourues. Appuyez sur "Fermer" pour continuer.</p>
                )}
                </>
            ) : (
                <p>Aucune attraction disponible correspondant à vos préférences.</p>  
            )}

            <button onClick={onClose} className={styles.closeButton}>Fermer</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PopupSurvey;
