import React, { useState, useEffect, useCallback } from 'react';
import styles from './popupSurvey.module.scss';
import { FaClock, FaHome, FaLaughBeam } from 'react-icons/fa';
import { TbRollercoaster } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { toggleFavorite } from '../redux/actions';
import CardSwipe from '../CardSwipe/CardSwipe';
import { useMemo } from 'react';

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
  const dispatch = useDispatch();
  const [currentAttractionIndex, setCurrentAttractionIndex] = useState(0);

  useEffect(() => {
    const storedPreferences = JSON.parse(localStorage.getItem('userPreferences'));
    if (storedPreferences) {
      setResponses(storedPreferences);
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (currentStep === questions.length) {
      localStorage.setItem('userPreferences', JSON.stringify(responses));
    }
  }, [currentStep, responses]);

  const handleAnswer = (answer, type) => {
    if (type === 'typePreference') {
      setResponses(current => ({
        ...current,
        typePreference: current.typePreference.includes(answer) ? current.typePreference.filter(item => item !== answer) : [...current.typePreference, answer],
      }));
    } else if (type === 'waitTimePreference') {
      setResponses(current => ({
        ...current,
        waitTimePreference: answer,
      }));
    }
    // Move to the next step for all types of questions, including 'intro'
    setCurrentStep(current => current + 1);
  };

  const recommendedAttractions = useMemo(() => {
    if (!attractions || responses.typePreference.length === 0) return [];
  
    let maxWaitTime;
    switch (responses.waitTimePreference) {
      case 'Moins de 15 minutes':
        maxWaitTime = 15;
        break;
      case '15-30 minutes':
        maxWaitTime = 30;
        break;
      case '30-60 minutes':
        maxWaitTime = 60;
        break;
      case 'Plus de 60 minutes':
        maxWaitTime = Infinity;
        break;
      default:
        maxWaitTime = Infinity;
    }
  
    // Filtre les attractions basé sur un critère OU pour le type et le temps d'attente
    return attractions.filter(attraction =>
      responses.typePreference.some(type => attraction.type.includes(type)) ||
      attraction.waitTime <= maxWaitTime
    );
  }, [attractions, responses.typePreference, responses.waitTimePreference]);

  const filteredAttractions = recommendedAttractions;

  const onSwipeLeft = (attraction) => {
    console.log('Pass', attraction.name);
    moveToNextAttraction();
  };

  const onSwipeRight = useCallback((attraction) => {
    console.log('Add to favorites', attraction.name);
    dispatch(toggleFavorite(attraction));
    moveToNextAttraction();
  }, [dispatch]);

  const moveToNextAttraction = () => {
    if (currentAttractionIndex < filteredAttractions.length - 1) {
      setCurrentAttractionIndex((currentIndex) => currentIndex + 1);
    }
    // Ne pas automatiquement fermer le popup pour laisser l'utilisateur fermer manuellement
  };

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
                className={`${styles.answerButton} ${responses.typePreference.includes(answer) ? styles.selected : ''}`}
              >
                {answer}
              </button>
            ))}
          </>
        ) : (
          <>
            <h2>Attractions recommandées pour vous</h2>
            {filteredAttractions.length > 0 && (
              <CardSwipe
                attraction={filteredAttractions[currentAttractionIndex]}
                onSwipeLeft={onSwipeLeft}
                onSwipeRight={onSwipeRight}
              />
            )}
            {currentAttractionIndex === filteredAttractions.length - 1 && (
              <button onClick={onClose} className={styles.closeButton}>Fermer</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PopupSurvey;
